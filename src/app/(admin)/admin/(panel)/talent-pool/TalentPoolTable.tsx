"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import BusyBar from "@/components/admin/BusyBar";
import DateTimePicker from "@/components/admin/DateTimePicker";
import Modal from "@/components/admin/Modal";
import { PER_PAGE_OPTIONS, pageList } from "@/components/admin/pagination";
import Select from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toaster";
import { useDebouncedSearch, useTableParams } from "@/components/admin/useTableParams";
import t from "@/components/admin/dataTable.module.css";
import { APPLICATION_STATUSES, APPLICATION_STATUS_META, type ApplicationStatus } from "@/lib/applicationStatus";
import { deleteApplications, setApplicationStatus, type TalentPoolCandidate } from "@/server/applications";
import type { DepartmentRow } from "@/server/departments";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, optionLabel } from "@/app/(site)/join-us/apply/data";
import styles from "./TalentPoolTable.module.css";

type SortKey = "createdAt" | "fullName";
type SortDir = "asc" | "desc";

const STAGGER_LIMIT = 8;

const STATUS_OPTIONS = APPLICATION_STATUSES.map((value) => ({ value, label: APPLICATION_STATUS_META[value].label }));

const stamp = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Santo_Domingo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatStamp(iso: string): string {
  const parts = stamp.formatToParts(new Date(iso));
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}, ${get("hour")}:${get("minute")}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function Icon({ name }: { name: string }) {
  const c = { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  switch (name) {
    case "search":
      return (
        <svg {...c} width="15" height="15" aria-hidden="true">
          <circle cx="7.1" cy="7.1" r="4.5" />
          <path d="m10.5 10.5 3 3" strokeLinecap="round" />
        </svg>
      );
    case "clock":
      return (
        <svg {...c} aria-hidden="true">
          <circle cx="8" cy="8" r="5.8" />
          <path d="M8 4.8V8l2.2 1.4" strokeLinecap="round" />
        </svg>
      );
    case "eye":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M1.4 8s2.6-4.2 6.6-4.2S14.6 8 14.6 8s-2.6 4.2-6.6 4.2S1.4 8 1.4 8Z" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.9" />
        </svg>
      );
    case "download":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M8 2.6v7.2M5.2 7l2.8 2.8L10.8 7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 11v2.4h10V11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trash":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M2.8 4.4h10.4M6.4 4.4V2.8h3.2v1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m4.2 4.4.7 8.4h6.2l.7-8.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "prev":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "clear":
      return (
        <svg {...c} width="12" height="12" aria-hidden="true">
          <path d="M3 3l10 10M13 3 3 13" strokeLinecap="round" />
        </svg>
      );
    case "caret":
      return (
        <svg {...c} width="11" height="11" aria-hidden="true">
          <path d="m4 6.4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...c} aria-hidden="true">
          <path d="M6.2 3.6 10.6 8l-4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function Caret({ dir }: { dir: SortDir | null }) {
  if (dir === null)
    return (
      <svg className={t.caret} width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M5 6.6 8 3.6l3 3M5 9.4l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg className={t.caret} width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      {dir === "asc" ? (
        <path d="M4 10.2 8 6.2l4 4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M4 6.2 8 10.2l4-4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function StatusDot({ shape }: { shape: "full" | "half" | "ring" }) {
  return (
    <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="3.2" fill={shape === "ring" ? "none" : "currentColor"} stroke="currentColor" strokeWidth="1.2" />
      {shape === "half" && <path d="M4 0.8a3.2 3.2 0 0 0 0 6.4Z" fill="var(--surface-raised)" />}
    </svg>
  );
}

type Props = {
  rows: TalentPoolCandidate[];
  total: number;
  page: number;
  perPage: number;
  sortKey: SortKey;
  sortDir: SortDir;
  query: string;
  status: ApplicationStatus | null;
  experience: string | null;
  english: string | null;
  availability: string | null;
  departmentId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  counts: Record<ApplicationStatus | "all", number>;
  departments: DepartmentRow[];
};

export default function TalentPoolTable({
  rows,
  total,
  page,
  perPage,
  sortKey,
  sortDir,
  query,
  status,
  experience,
  english,
  availability,
  departmentId,
  dateFrom,
  dateTo,
  counts,
  departments,
}: Props) {
  const toast = useToast();
  const router = useRouter();
  const reduced = useReducedMotion();
  const { pending, setParams } = useTableParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [text, setText] = useDebouncedSearch(query, (next) => {
    setSelected(new Set());
    setParams({ q: next || null, page: 1 });
  });
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const allRef = useRef<HTMLInputElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // position: absolute contra un wrapper propio (no fixed + coordenadas
  // calculadas a mano): el toolbar no vive dentro de un <dialog>, así que no
  // hace falta ese truco — y es justo el que le dio problemas a Select.tsx.
  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function navigate(next: Record<string, string | number | null>) {
    setSelected(new Set());
    setParams(next);
  }

  function changeDateFrom(value: string) {
    if (value && dateTo && value > dateTo) {
      toast.error("Invalid date range", "The start date can't be after the end date.");
      return;
    }
    navigate({ dateFrom: value || null, page: 1 });
  }

  function changeDateTo(value: string) {
    if (value && dateFrom && value < dateFrom) {
      toast.error("Invalid date range", "The end date can't be before the start date.");
      return;
    }
    navigate({ dateTo: value || null, page: 1 });
  }

  const allChecked = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const someChecked = selected.size > 0 && !allChecked;

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someChecked;
  }, [someChecked]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function sortBy(key: SortKey) {
    const dir = key === sortKey ? (sortDir === "asc" ? "desc" : "asc") : key === "fullName" ? "asc" : "desc";
    navigate({ sort: key, dir, page: 1 });
  }

  function ariaSort(key: SortKey) {
    if (key !== sortKey) return "none" as const;
    return sortDir === "asc" ? ("ascending" as const) : ("descending" as const);
  }

  async function changeStatus(ids: string[], next: ApplicationStatus) {
    setBusy(true);
    const result = await setApplicationStatus(ids, next);
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not change the status", result.message);
      return;
    }
    const label = APPLICATION_STATUS_META[next].label;
    toast.success(ids.length === 1 ? `Marked as ${label}` : `${ids.length} candidates marked as ${label}`);
    setSelected(new Set());
    router.refresh();
  }

  function askDelete(ids: string[]) {
    setPendingIds(ids);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    setBusy(true);
    const result = await deleteApplications(pendingIds);
    setBusy(false);
    setConfirmOpen(false);
    if (!result.ok) {
      toast.error("Could not delete", result.message);
      return;
    }
    const n = pendingIds.length;
    toast.success(`${n} ${n === 1 ? "candidate deleted" : "candidates deleted"}`);
    setSelected(new Set());
    setPendingIds([]);
    router.refresh();
  }

  const experienceOptions = [{ value: "", label: "Any experience" }, ...EXPERIENCE_OPTIONS];
  const englishOptions = [{ value: "", label: "Any English level" }, ...ENGLISH_OPTIONS];
  const availabilityOptions = [{ value: "", label: "Any availability" }, ...AVAILABILITY_OPTIONS];
  const departmentOptions = [
    { value: "", label: "Any department" },
    ...departments.map((entry) => ({ value: entry.id, label: entry.shortLabel })),
  ];

  const pendingNames = rows.filter((row) => pendingIds.includes(row.id)).map((row) => row.fullName);

  const tabs: { key: ApplicationStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    ...APPLICATION_STATUSES.map((value) => ({ key: value, label: APPLICATION_STATUS_META[value].label })),
  ];

  const hasFilters = Boolean(query || status || experience || english || availability || departmentId || dateFrom || dateTo);
  // Solo cuenta lo que vive dentro del popover "Filters" — Department queda
  // visible siempre, así que no necesita avisar que está activo.
  const extraFiltersCount = [experience, english, availability, dateFrom || dateTo].filter(Boolean).length;

  return (
    <>
      <div className={t.container} aria-busy={pending || undefined}>
        <BusyBar active={pending} />
        <div className={t.toolbar}>
          <div className={t.search}>
            <span className={t.searchIcon}>
              <Icon name="search" />
            </span>
            <input
              className={t.searchInput}
              type="search"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Search by name or email"
              aria-label="Search the talent pool"
            />
          </div>

          <div className={styles.filters}>
            <Select
              value={departmentId ?? ""}
              options={departmentOptions}
              onChange={(next) => navigate({ department: next || null, page: 1 })}
              label="Filter by interested department"
              width="12rem"
            />

            <div className={styles.moreWrap} ref={moreRef}>
              <button className={styles.moreButton} type="button" onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen}>
                Filters
                {extraFiltersCount > 0 && <span className={styles.moreBadge}>{extraFiltersCount}</span>}
                <Icon name="caret" />
              </button>

              {moreOpen && (
                <div className={styles.morePanel} role="group" aria-label="More filters">
                  <label className={styles.moreField}>
                    <span className={styles.moreLabel}>Experience</span>
                    <Select
                      value={experience ?? ""}
                      options={experienceOptions}
                      onChange={(next) => navigate({ experience: next || null, page: 1 })}
                      label="Filter by experience"
                      width="100%"
                    />
                  </label>
                  <label className={styles.moreField}>
                    <span className={styles.moreLabel}>English level</span>
                    <Select
                      value={english ?? ""}
                      options={englishOptions}
                      onChange={(next) => navigate({ english: next || null, page: 1 })}
                      label="Filter by English level"
                      width="100%"
                    />
                  </label>
                  <label className={styles.moreField}>
                    <span className={styles.moreLabel}>Availability</span>
                    <Select
                      value={availability ?? ""}
                      options={availabilityOptions}
                      onChange={(next) => navigate({ availability: next || null, page: 1 })}
                      label="Filter by availability"
                      width="100%"
                    />
                  </label>
                  <div className={styles.moreField}>
                    <span className={styles.moreLabel}>Applied between</span>
                    <div className={styles.dates}>
                      <DateTimePicker
                        value={dateFrom ?? ""}
                        onChange={changeDateFrom}
                        label="From date"
                        placeholder="From"
                        showTime={false}
                        max={dateTo ?? undefined}
                        width="8rem"
                      />
                      <span className={styles.datesSep}>–</span>
                      <DateTimePicker
                        value={dateTo ?? ""}
                        onChange={changeDateTo}
                        label="To date"
                        placeholder="To"
                        showTime={false}
                        min={dateFrom ?? undefined}
                        width="8rem"
                      />
                      {(dateFrom || dateTo) && (
                        <button
                          className={styles.datesClear}
                          type="button"
                          onClick={() => navigate({ dateFrom: null, dateTo: null, page: 1 })}
                          aria-label="Clear date filter"
                        >
                          <Icon name="clear" />
                        </button>
                      )}
                    </div>
                  </div>

                  {hasFilters && (
                    <button
                      className={styles.resetFilters}
                      type="button"
                      onClick={() => {
                        setMoreOpen(false);
                        navigate({
                          q: null,
                          status: null,
                          experience: null,
                          english: null,
                          availability: null,
                          department: null,
                          dateFrom: null,
                          dateTo: null,
                          page: 1,
                        });
                      }}
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tabs} role="group" aria-label="Filter by status">
          {tabs.map((tab) => {
            const active = tab.key === "all" ? status === null : status === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={styles.tab}
                aria-pressed={active}
                onClick={() => navigate({ status: tab.key === "all" ? null : tab.key, page: 1 })}
              >
                {tab.key !== "all" && (
                  <span className={styles.tabDot} style={{ color: APPLICATION_STATUS_META[tab.key].ink }}>
                    <StatusDot shape={APPLICATION_STATUS_META[tab.key].dot} />
                  </span>
                )}
                {tab.label}
                <span className={styles.tabCount}>{counts[tab.key]}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {selected.size > 0 && (
            <motion.div
              key="bulk"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className={t.bulk}>
                <span className={t.bulkCount}>
                  {selected.size} selected
                  <span className={t.bulkScope}>on this page</span>
                </span>
                <span className={t.bulkActions}>
                  <span className={styles.bulkStatus}>
                    <Select
                      value=""
                      options={[{ value: "", label: "Set status…" }, ...STATUS_OPTIONS]}
                      onChange={(next) => {
                        if (next) void changeStatus([...selected], next as ApplicationStatus);
                      }}
                      label="Set status for selected"
                      width="11rem"
                    />
                  </span>
                  <button className={t.bulkButton} type="button" data-tone="danger" disabled={busy} onClick={() => askDelete([...selected])}>
                    Delete
                  </button>
                  <button className={t.bulkButton} type="button" data-variant="plain" onClick={() => setSelected(new Set())}>
                    Clear selection
                  </button>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={t.scroller}>
          <table className={t.table}>
            <caption className={t.srOnly}>
              Talent pool, {rows.length} on this page of {total}, page {page} of {totalPages}, sorted by{" "}
              {sortKey === "fullName" ? "name" : "date received"}.
            </caption>

            <thead>
              <tr>
                <th className={`${t.th} ${t.selectCell}`}>
                  <input
                    ref={allRef}
                    className={t.checkbox}
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="Select every candidate on this page"
                  />
                </th>
                <th className={t.th} aria-sort={ariaSort("fullName")}>
                  <button className={t.sortLink} type="button" onClick={() => sortBy("fullName")} data-active={sortKey === "fullName"}>
                    Candidate
                    <Caret dir={sortKey === "fullName" ? sortDir : null} />
                  </button>
                </th>
                <th className={t.th}>Interested in</th>
                <th className={t.th}>Profile</th>
                <th className={t.th}>Status</th>
                <th className={t.th} aria-sort={ariaSort("createdAt")}>
                  <button className={t.sortLink} type="button" onClick={() => sortBy("createdAt")} data-active={sortKey === "createdAt"}>
                    Applied
                    <Caret dir={sortKey === "createdAt" ? sortDir : null} />
                  </button>
                </th>
                <th className={t.th}>
                  <span className={t.srOnly}>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={t.empty} colSpan={7}>
                    {hasFilters ? "No candidate matches these filters." : "The talent pool is empty right now."}
                  </td>
                </tr>
              )}

              {rows.map((row, index) => {
                const meta = APPLICATION_STATUS_META[row.status];
                const isSelected = selected.has(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`${t.row} ${t.enter}`}
                    style={{ "--i": Math.min(index, STAGGER_LIMIT) } as React.CSSProperties}
                    data-selected={isSelected}
                  >
                    <td className={`${t.td} ${t.selectCell}`}>
                      <input
                        className={t.checkbox}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(row.id)}
                        aria-label={`Select ${row.fullName}`}
                      />
                    </td>

                    <td className={`${t.td} ${styles.candidateCell}`}>
                      <span className={t.person}>
                        <span className={t.avatar} aria-hidden="true">
                          {initials(row.fullName)}
                        </span>
                        <span className={styles.identity}>
                          <Link className={styles.name} href={`/admin/applications/${row.id}`}>
                            {row.fullName}
                          </Link>
                          <span className={styles.contact}>
                            {row.email} · {row.city}
                          </span>
                        </span>
                      </span>
                    </td>

                    <td className={`${t.td} ${styles.targetCell}`}>
                      {row.departmentLabel ? <span className={t.chip}>{row.departmentLabel}</span> : <span className={styles.noTarget}>Any department</span>}
                    </td>

                    <td className={`${t.td} ${styles.profileCell}`}>
                      <span className={styles.profile}>
                        <span>{optionLabel(EXPERIENCE_OPTIONS, row.experience)}</span>
                        <span>{optionLabel(ENGLISH_OPTIONS, row.english)} English</span>
                        <span>{optionLabel(AVAILABILITY_OPTIONS, row.availability)}</span>
                      </span>
                    </td>

                    <td className={`${t.td} ${styles.statusCell}`}>
                      <span className={styles.statusSelect} style={{ "--badge-ink": meta.ink } as React.CSSProperties}>
                        <Select
                          value={row.status}
                          options={STATUS_OPTIONS}
                          onChange={(next) => void changeStatus([row.id], next as ApplicationStatus)}
                          label={`Status for ${row.fullName}`}
                          width="9.5rem"
                        />
                      </span>
                    </td>

                    <td className={`${t.td} ${t.nowrap}`}>
                      <span className={t.stamp}>
                        <Icon name="clock" />
                        {formatStamp(row.createdAt)}
                      </span>
                    </td>

                    <td className={`${t.td} ${t.actionsCell}`}>
                      <span className={t.actions}>
                        <Link className={t.action} href={`/admin/applications/${row.id}`} title="View candidate" aria-label={`View ${row.fullName}`}>
                          <Icon name="eye" />
                        </Link>
                        <a
                          className={t.action}
                          href={`/api/admin/applications/${row.id}/resume?download=1`}
                          title={`Download ${row.resumeName}`}
                          aria-label={`Download resume of ${row.fullName}`}
                        >
                          <Icon name="download" />
                        </a>
                        <button
                          className={t.action}
                          type="button"
                          data-tone="danger"
                          title="Delete candidate"
                          aria-label={`Delete candidate ${row.fullName}`}
                          disabled={busy}
                          onClick={() => askDelete([row.id])}
                        >
                          <Icon name="trash" />
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={t.pagination}>
        <div className={t.perPage}>
          <span>Show</span>
          <Select
            value={String(perPage)}
            options={PER_PAGE_OPTIONS}
            onChange={(next) => navigate({ perPage: Number(next), page: 1 })}
            label="Candidates per page"
          />
          <span>per page</span>
        </div>

        <nav className={t.pages} aria-label="Pagination">
          <button className={t.pageButton} type="button" onClick={() => navigate({ page: page - 1 })} disabled={page === 1 || pending} aria-label="Previous page">
            <Icon name="prev" />
          </button>
          {pageList(page, totalPages).map((entry, i) =>
            entry === "gap" ? (
              <span key={`gap-${i}`} className={t.ellipsis} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={entry}
                className={t.pageButton}
                type="button"
                onClick={() => navigate({ page: entry })}
                disabled={pending}
                aria-current={entry === page ? "page" : undefined}
                aria-label={`Page ${entry}`}
              >
                {entry}
              </button>
            ),
          )}
          <button
            className={t.pageButton}
            type="button"
            onClick={() => navigate({ page: page + 1 })}
            disabled={page === totalPages || pending}
            aria-label="Next page"
          >
            <Icon name="next" />
          </button>
        </nav>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        eyebrow="Confirm"
        title={pendingIds.length === 1 ? "Delete the candidate" : `Delete ${pendingIds.length} candidates`}
      >
        <p className={styles.dialogText}>
          {pendingIds.length === 1
            ? `The application from ${pendingNames[0] ?? "this candidate"} and its resume are deleted. This cannot be undone.`
            : `${pendingIds.length} applications and their resumes are deleted. This cannot be undone.`}
        </p>
        <div className={styles.dialogFoot}>
          <button className={styles.ghost} type="button" onClick={() => setConfirmOpen(false)}>
            Cancel
          </button>
          <button className={styles.confirm} type="button" onClick={() => void confirmDelete()} disabled={busy}>
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
