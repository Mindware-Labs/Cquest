"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PER_PAGE_OPTIONS, pageList } from "@/components/admin/pagination";
import { useDebouncedSearch, useTableParams } from "@/components/admin/useTableParams";
import Select from "@/components/admin/Select";
import Modal from "@/components/admin/Modal";
import t from "@/components/admin/dataTable.module.css";
import { useToast } from "@/components/admin/Toaster";
import { deleteVacancies, setVacancyStatus, type VacancyListRow } from "@/server/vacancies";
import styles from "./VacanciesTable.module.css";

type Badge = "published" | "scheduled" | "draft" | "hidden";

/* Programado no se guarda: es publicado con fecha futura, igual que en el blog
   (ver src/app/(admin)/admin/(panel)/posts/PostsTable.tsx). */
function badgeOf(row: VacancyListRow, now: number): Badge {
  if (row.status !== "published") return row.status;
  return row.publishedAt && new Date(row.publishedAt).getTime() > now ? "scheduled" : "published";
}

type SortKey = "title" | "updatedAt";
type SortDir = "asc" | "desc";

const STAGGER_LIMIT = 8;

const STATUS: Record<Badge, { label: string; ink: string; dot: "full" | "half" | "ring" }> = {
  published: { label: "Published", ink: "var(--brand-verde)", dot: "full" },
  scheduled: { label: "Scheduled", ink: "var(--brand-petroleo)", dot: "half" },
  draft: { label: "Draft", ink: "var(--brand-celeste)", dot: "full" },
  hidden: { label: "Hidden", ink: "var(--text-tertiary)", dot: "ring" },
};

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

function StatusDot({ shape }: { shape: "full" | "half" | "ring" }) {
  return (
    <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="3.2" fill={shape === "ring" ? "none" : "currentColor"} stroke="currentColor" strokeWidth="1.2" />
      {shape === "half" && <path d="M4 0.8a3.2 3.2 0 0 0 0 6.4Z" fill="var(--surface-raised)" />}
    </svg>
  );
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
    case "briefcase":
      return (
        <svg {...c} aria-hidden="true">
          <rect x="2.2" y="5.2" width="11.6" height="8" strokeLinejoin="round" />
          <path d="M5.6 5.2V3.6h4.8v1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.2 9h11.6" strokeLinecap="round" />
        </svg>
      );
    case "eye":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M1.4 8s2.6-4.2 6.6-4.2S14.6 8 14.6 8s-2.6 4.2-6.6 4.2S1.4 8 1.4 8Z" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.9" />
        </svg>
      );
    case "eyeOff":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M1.4 8s2.6-4.2 6.6-4.2S14.6 8 14.6 8s-2.6 4.2-6.6 4.2S1.4 8 1.4 8Z" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.9" />
          <path d="M2.6 2.6 13.4 13.4" strokeLinecap="round" />
        </svg>
      );
    case "pencil":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M11.2 2.6 13.4 4.8 5.6 12.6 2.6 13.4l.8-3z" strokeLinejoin="round" />
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
    case "next":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M6.2 3.6 10.6 8l-4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...c} aria-hidden="true">
          <path d="M5 3.4 8 6.4l3-3M5 12.6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function Caret({ dir }: { dir: SortDir | null }) {
  if (dir === null)
    return (
      <svg className={styles.caret} width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M5 6.6 8 3.6l3 3M5 9.4l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg className={styles.caret} width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      {dir === "asc" ? (
        <path d="M4 10.2 8 6.2l4 4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M4 6.2 8 10.2l4-4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

type Props = {
  rows: VacancyListRow[];
  total: number;
  page: number;
  perPage: number;
  sortKey: SortKey;
  sortDir: SortDir;
  query: string;
};

export default function VacanciesTable({ rows, total, page, perPage, sortKey, sortDir, query }: Props) {
  const toast = useToast();
  const router = useRouter();
  const { pending, setParams } = useTableParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [text, setText] = useDebouncedSearch(query, (next) => {
    setSelected(new Set());
    setParams({ q: next || null, page: 1 });
  });
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  async function toggleVisibility(row: VacancyListRow) {
    setBusy(true);
    const next = row.status === "published" ? "hidden" : "published";
    const result = await setVacancyStatus(row.id, next);
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not change the status", result.message);
      return;
    }
    toast.success(next === "published" ? "Vacancy published" : "Vacancy hidden", row.title);
    router.refresh();
  }

  function askDelete(ids: string[]) {
    setPendingIds(ids);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    setBusy(true);
    const result = await deleteVacancies(pendingIds);
    setBusy(false);
    setConfirmOpen(false);

    if (!result.ok) {
      toast.error("Could not delete", result.message);
      return;
    }
    const n = pendingIds.length;
    toast.success(`${n} ${n === 1 ? "vacancy deleted" : "vacancies deleted"}`);
    setSelected(new Set());
    setPendingIds([]);
    router.refresh();
  }
  const allRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function navigate(next: Record<string, string | number | null>) {
    setSelected(new Set());
    setParams(next);
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

  function goTo(next: number) {
    navigate({ page: Math.min(Math.max(next, 1), totalPages) });
  }

  function changePerPage(size: number) {
    navigate({ perPage: size, page: 1 });
  }

  function sortBy(key: SortKey) {
    const dir = key === sortKey ? (sortDir === "asc" ? "desc" : "asc") : key === "title" ? "asc" : "desc";
    navigate({ sort: key, dir, page: 1 });
  }

  function ariaSort(key: SortKey) {
    if (key !== sortKey) return "none" as const;
    return sortDir === "asc" ? ("ascending" as const) : ("descending" as const);
  }

  const pendingTitles = rows.filter((row) => pendingIds.includes(row.id)).map((row) => row.title);

  return (
    <>
      <div className={styles.container}>
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
              placeholder="Search by title or department"
              aria-label="Search vacancies"
            />
          </div>
        </div>

        {selected.size > 0 && (
          <div className={styles.bulk}>
            <div className={styles.bulkInner}>
              <span className={styles.bulkCount}>
                {selected.size} {selected.size === 1 ? "selected" : "selected"}
                <span className={styles.bulkScope}>on this page</span>
              </span>
              <span className={styles.bulkActions}>
                <button
                  className={styles.bulkButton}
                  type="button"
                  data-tone="danger"
                  disabled={busy}
                  onClick={() => askDelete([...selected])}
                >
                  Delete
                </button>
                <button
                  className={styles.bulkButton}
                  type="button"
                  data-variant="plain"
                  onClick={() => setSelected(new Set())}
                >
                  Clear selection
                </button>
              </span>
            </div>
          </div>
        )}

        <div className={styles.scroller}>
          <table className={styles.table}>
            <caption className={styles.caption}>
              Vacancies, {rows.length} on this page of {total}, page {page} of {totalPages}, sorted by{" "}
              {sortKey === "title" ? "title" : "last edit"}.
            </caption>

            <thead>
              <tr>
                <th className={`${styles.th} ${styles.selectCell}`}>
                  <input
                    ref={allRef}
                    className={styles.checkbox}
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="Select every vacancy on this page"
                  />
                </th>
                <th className={styles.th} aria-sort={ariaSort("title")}>
                  <button className={styles.sortLink} type="button" onClick={() => sortBy("title")} data-active={sortKey === "title"}>
                    Vacancy
                    <Caret dir={sortKey === "title" ? sortDir : null} />
                  </button>
                </th>
                <th className={styles.th}>Department</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th} aria-sort={ariaSort("updatedAt")}>
                  <button className={styles.sortLink} type="button" onClick={() => sortBy("updatedAt")} data-active={sortKey === "updatedAt"}>
                    Edited
                    <Caret dir={sortKey === "updatedAt" ? sortDir : null} />
                  </button>
                </th>
                <th className={styles.th}>
                  <span className={styles.caption}>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={6}>
                    {query ? `No vacancy matches “${query}”.` : "No vacancies yet. Create the first one from “New vacancy”."}
                  </td>
                </tr>
              )}

              {rows.map((row, index) => {
                const state = STATUS[badgeOf(row, now)];
                const isSelected = selected.has(row.id);
                return (
                  <Fragment key={row.id}>
                    <tr
                      className={`${styles.row} ${styles.enter}`}
                      style={{ "--i": Math.min(index, STAGGER_LIMIT) } as React.CSSProperties}
                      data-selected={isSelected}
                    >
                      <td className={`${styles.td} ${styles.selectCell}`}>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(row.id)}
                          aria-label={`Select “${row.title}”`}
                        />
                      </td>

                      <td className={`${styles.td} ${styles.titleCell}`}>
                        <span className={styles.article}>
                          <span className={styles.thumb}>
                            <Icon name="briefcase" />
                          </span>
                          <Link className={styles.articleTitle} href={`/admin/vacancies/${row.id}`}>
                            {row.title}
                          </Link>
                        </span>
                      </td>

                      <td className={`${styles.td} ${styles.inkCell}`}>{row.departmentLabel ?? "No department"}</td>

                      <td className={styles.td}>
                        <span className={styles.badge} style={{ "--badge-ink": state.ink } as React.CSSProperties}>
                          <StatusDot shape={state.dot} />
                          {state.label}
                        </span>
                        {badgeOf(row, now) === "scheduled" && row.publishedAt && (
                          <span className={styles.badgeDate}>{formatStamp(row.publishedAt)}</span>
                        )}
                      </td>

                      <td className={styles.td}>
                        <span className={styles.edited}>
                          <Icon name="clock" />
                          <span className={styles.stamp}>{formatStamp(row.updatedAt)}</span>
                        </span>
                        {row.authorName && <span className={styles.author}>{row.authorName}</span>}
                      </td>

                      <td className={`${styles.td} ${styles.actionsCell}`}>
                        <span className={styles.actions}>
                          <Link
                            className={styles.action}
                            href={`/admin/vacancies/${row.id}`}
                            title={`Edit “${row.title}”`}
                            aria-label={`Edit “${row.title}”`}
                          >
                            <Icon name="pencil" />
                          </Link>
                          <button
                            className={styles.action}
                            type="button"
                            title={row.status === "published" ? `Hide “${row.title}”` : `Publish “${row.title}”`}
                            aria-label={row.status === "published" ? `Hide “${row.title}”` : `Publish “${row.title}”`}
                            disabled={busy}
                            onClick={() => void toggleVisibility(row)}
                          >
                            <Icon name={row.status === "published" ? "eyeOff" : "eye"} />
                          </button>
                          <button
                            className={styles.action}
                            type="button"
                            data-tone="danger"
                            title={`Delete “${row.title}”`}
                            aria-label={`Delete “${row.title}”`}
                            disabled={busy}
                            onClick={() => askDelete([row.id])}
                          >
                            <Icon name="trash" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  </Fragment>
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
            onChange={(next) => changePerPage(Number(next))}
            label="Vacancies per page"
          />
          <span>per page</span>
        </div>

        <nav className={t.pages} aria-label="Pagination">
          <button
            className={t.pageButton}
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 1 || pending}
            aria-label="Previous page"
          >
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
                onClick={() => goTo(entry)}
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
            onClick={() => goTo(page + 1)}
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
        title={pendingIds.length === 1 ? "Delete the vacancy" : `Delete ${pendingIds.length} vacancies`}
      >
        <p className={styles.dialogText}>
          {pendingIds.length === 1
            ? `“${pendingTitles[0] ?? ""}” is deleted and this cannot be undone.`
            : `${pendingIds.length} vacancies are deleted and this cannot be undone.`}
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
