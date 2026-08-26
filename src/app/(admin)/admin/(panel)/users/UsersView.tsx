"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import InfoHint from "@/components/admin/InfoHint";
import { useToast } from "@/components/admin/Toaster";
import {
  createAdminUser,
  removeAdminUser,
  resendWelcomeEmail,
  setUserBanned,
} from "@/server/admin-users";
import t from "@/components/admin/dataTable.module.css";
import { PER_PAGE_OPTIONS, pageList } from "@/components/admin/pagination";
import { useDebouncedSearch, useTableParams } from "@/components/admin/useTableParams";
import styles from "./UsersView.module.css";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  banned: boolean;
  createdAt: string;
};

type BulkKind = "ban" | "unban" | "remove";
type Pending =
  | { scope: "one"; kind: BulkKind; user: AdminUser }
  | { scope: "bulk"; kind: BulkKind; users: AdminUser[] }
  | null;
type SortKey = "name" | "createdAt";
type SortDir = "asc" | "desc";

const STAGGER_LIMIT = 8;

const schema = z.object({
  name: z.string().trim().min(2, "The name needs at least 2 characters."),
  email: z.email("Enter a valid email address."),
});

const exactDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });
const relative = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60_000],
  ["month", 30 * 24 * 60 * 60_000],
  ["day", 24 * 60 * 60_000],
  ["hour", 60 * 60_000],
  ["minute", 60_000],
];

function sinceNow(iso: string, now: number): string {
  const diff = new Date(iso).getTime() - now;
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return relative.format(Math.round(diff / ms), unit);
  }
  return "just now";
}

function initials(name: string, email: string): string {
  const parts = (name.trim() || email).split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const c = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  switch (name) {
    case "search":
      return (
        <svg {...c} width={size} height={size} aria-hidden="true">
          <circle cx="7.1" cy="7.1" r="4.5" />
          <path d="m10.5 10.5 3 3" strokeLinecap="round" />
        </svg>
      );
    case "list":
      return (
        <svg {...c} width={size} height={size} aria-hidden="true">
          <path d="M5.4 4.2h8.2M5.4 8h8.2M5.4 11.8h8.2M2.4 4.2h.7M2.4 8h.7M2.4 11.8h.7" strokeLinecap="round" />
        </svg>
      );
    case "grid":
      return (
        <svg {...c} width={size} height={size} aria-hidden="true">
          <rect x="2.4" y="2.4" width="4.8" height="4.8" />
          <rect x="8.8" y="2.4" width="4.8" height="4.8" />
          <rect x="2.4" y="8.8" width="4.8" height="4.8" />
          <rect x="8.8" y="8.8" width="4.8" height="4.8" />
        </svg>
      );
    case "plus":
      return (
        <svg {...c} width={size} height={size} aria-hidden="true">
          <path d="M8 3.4v9.2M3.4 8h9.2" strokeLinecap="round" />
        </svg>
      );
    case "clock":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <circle cx="8" cy="8" r="5.8" />
          <path d="M8 4.8V8l2.2 1.4" strokeLinecap="round" />
        </svg>
      );
    case "resend":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M13.4 8a5.4 5.4 0 1 1-1.6-3.8" strokeLinecap="round" />
          <path d="M13.6 2.2v2.9h-2.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "ban":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <circle cx="8" cy="8" r="5.6" />
          <path d="m4.2 4.2 7.6 7.6" strokeLinecap="round" />
        </svg>
      );
    case "unban":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <circle cx="8" cy="8" r="5.6" />
          <path d="m5.4 8.2 1.8 1.8 3.4-3.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trash":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M2.8 4.4h10.4M6.4 4.4V2.8h3.2v1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m4.2 4.4.7 8.4h6.2l.7-8.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "alert":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M8 2 14.6 13.4H1.4L8 2Z" strokeLinejoin="round" />
          <path d="M8 6.4v3.2M8 11.6v.6" strokeLinecap="round" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.6} width={14} height={14} aria-hidden="true">
          <path d="M2 6.3 4.6 9 10 3.2" strokeLinecap="square" />
        </svg>
      );
    case "prev":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
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
      <path d={dir === "asc" ? "M4 10.2 8 6.2l4 4" : "M4 6.2 8 10.2l4-4"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  users: AdminUser[];
  currentUserId: string;
  total: number;
  page: number;
  perPage: number;
  sortKey: SortKey;
  sortDir: SortDir;
  query: string;
};

export default function UsersView({
  users,
  currentUserId,
  total,
  page,
  perPage,
  sortKey,
  sortDir,
  query,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const nameId = useId();
  const emailId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const allRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<"list" | "grid">("list");
  const { pending: navigating, setParams } = useTableParams();
  const [text, setText] = useDebouncedSearch(query, (next) =>
    navigate({ q: next || null, page: 1 }),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* La selección no cruza de página: la barra de acciones dice "en esta página"
     y actuar en bloque sobre filas que ya no se ven es el error fácil. */
  function navigate(next: Record<string, string | number | null>) {
    setSelected(new Set());
    setParams(next);
  }

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [saving, startSaving] = useTransition();
  const [bulkBusy, setBulkBusy] = useState(false);
  const reduced = useReducedMotion() ?? false;

  /* Una sola marca de tiempo para todas las filas: llamar Date.now() por fila
     durante el render es impuro y da resultados que no cuadran entre sí. */
  const [now] = useState(() => Date.now());

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const visible = users;

  const allChecked = visible.length > 0 && visible.every((u) => selected.has(u.id));
  const someChecked = visible.some((u) => selected.has(u.id)) && !allChecked;

  // indeterminate no es un atributo: solo se fija por JavaScript.
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someChecked;
  }, [someChecked]);

  const bulkTargets = useMemo(
    () => users.filter((u) => selected.has(u.id) && u.id !== currentUserId),
    [users, selected, currentUserId],
  );
  const skipsSelf = selected.has(currentUserId);

  const errors = useMemo(() => {
    const parsed = schema.safeParse({ name, email });
    if (parsed.success) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !map[key]) map[key] = issue.message;
    }
    return map;
  }, [name, email]);

  const valid = Object.keys(errors).length === 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const u of visible) {
        if (allChecked) next.delete(u.id);
        else next.add(u.id);
      }
      return next;
    });
  }

  function sortBy(key: SortKey) {
    if (key === sortKey) {
      navigate({ sort: key, dir: sortDir === "asc" ? "desc" : "asc", page: 1 });
      return;
    }
    navigate({ sort: key, dir: key === "name" ? "asc" : "desc", page: 1 });
  }

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!valid) {
      setShowErrors(true);
      formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    startSaving(async () => {
      const result = await createAdminUser({ name, email });
      if (!result.ok) {
        toast.error("Could not create the account", result.message);
        return;
      }
      toast.success("Account created", `The access code went out to ${email.trim().toLowerCase()}.`);
      setName("");
      setEmail("");
      setShowErrors(false);
      setCreateOpen(false);
      router.refresh();
    });
  }

  async function handleResend(user: AdminUser) {
    setBusyId(user.id);
    const result = await resendWelcomeEmail(user.email);
    setBusyId(null);
    if (result.ok) toast.success("Access resent", `New code for ${user.email}.`);
    else toast.error("Could not resend access", result.message);
  }

  async function applyTo(user: AdminUser, kind: BulkKind) {
    return kind === "remove" ? removeAdminUser(user.id) : setUserBanned(user.id, kind === "ban");
  }

  async function runBulk(kind: BulkKind, targets: AdminUser[]) {
    setBulkBusy(true);
    const failed: string[] = [];
    let done = 0;
    for (const user of targets) {
      const result = await applyTo(user, kind);
      if (result.ok) done++;
      else failed.push(user.email);
    }
    setBulkBusy(false);
    setPending(null);
    setSelected(new Set());

    const verb = kind === "remove" ? "deleted" : kind === "ban" ? "blocked" : "unblocked";
    const noun = done === 1 ? "account" : "accounts";
    if (failed.length === 0) toast.success(`${done} ${noun} ${verb}`);
    else
      toast.error(
        `${done} of ${targets.length} ${verb}`,
        `Failed for: ${failed.join(", ")}.`,
      );
    router.refresh();
  }

  async function confirmPending() {
    if (!pending) return;
    if (pending.scope === "bulk") {
      await runBulk(pending.kind, pending.users);
      return;
    }
    const { kind, user } = pending;
    setBusyId(user.id);
    const result = await applyTo(user, kind);
    setBusyId(null);
    setPending(null);

    if (!result.ok) {
      toast.error("The action did not complete", result.message);
      return;
    }
    const who = user.name || user.email;
    if (kind === "remove") toast.success("Account deleted", `${who} no longer has access.`);
    else if (kind === "ban") toast.success("Access blocked", `${who} will not be able to sign in.`);
    else toast.success("Access restored", `${who} can sign in again.`);
    router.refresh();
  }

  const bulkCopy =
    pending?.scope === "bulk"
      ? {
          n: pending.users.length,
          noun: pending.users.length === 1 ? "account" : "accounts",
        }
      : null;

  const dialogCopy = pending?.scope === "bulk" && bulkCopy
    ? {
        title:
          pending.kind === "remove"
            ? `Delete ${bulkCopy.n} ${bulkCopy.noun}`
            : pending.kind === "ban"
              ? `Block ${bulkCopy.n} ${bulkCopy.noun}`
              : `Restore access for ${bulkCopy.n} ${bulkCopy.noun}`,
        text:
          pending.kind === "remove"
            ? `${bulkCopy.n} ${bulkCopy.noun} are deleted and this cannot be undone. Any articles they wrote are kept.`
            : pending.kind === "ban"
              ? `Those ${bulkCopy.n} ${bulkCopy.noun} will no longer be able to sign in. You can unblock them later.`
              : `Those ${bulkCopy.n} ${bulkCopy.noun} will be able to sign in again with their usual password.`,
        cta: pending.kind === "remove" ? "Delete" : pending.kind === "ban" ? "Block" : "Unblock",
      }
    : pending?.scope === "one"
    ? pending.kind === "remove"
      ? {
          title: "Delete the account",
          text: `The account for ${pending.user.name || pending.user.email} is deleted and this cannot be undone. Any articles they wrote are kept.`,
          cta: "Delete",
        }
      : pending.kind === "ban"
        ? {
            title: "Block access",
            text: `${pending.user.name || pending.user.email} will no longer be able to sign in. The account is kept and you can unblock it later.`,
            cta: "Block",
          }
        : {
            title: "Restore access",
            text: `${pending.user.name || pending.user.email} will be able to sign in again with their usual password.`,
            cta: "Unblock",
          }
    : null;

  function rowActions(user: AdminUser) {
    const self = user.id === currentUserId;
    const busy = busyId === user.id;
    return (
      <span className={t.actions}>
        <button
          className={t.action}
          type="button"
          onClick={() => void handleResend(user)}
          disabled={busy}
          aria-label={`Resend the access code to ${user.email}`}
          title="Resend access"
        >
          <Icon name="resend" />
        </button>
        <button
          className={t.action}
          type="button"
          onClick={() => setPending({ scope: "one", kind: user.banned ? "unban" : "ban", user })}
          disabled={busy || self}
          aria-label={`${user.banned ? "Unblock" : "Block"} ${user.email}`}
          title={self ? "You cannot block your own account" : user.banned ? "Unblock" : "Block"}
        >
          <Icon name={user.banned ? "unban" : "ban"} />
        </button>
        <button
          className={t.action}
          type="button"
          data-tone="danger"
          onClick={() => setPending({ scope: "one", kind: "remove", user })}
          disabled={busy || self}
          aria-label={`Delete the account for ${user.email}`}
          title={self ? "You cannot delete your own account" : "Delete"}
        >
          <Icon name="trash" />
        </button>
      </span>
    );
  }

  function statusBadge(user: AdminUser) {
    return (
      <span
        className={t.badge}
        style={
          { "--badge-ink": user.banned ? "var(--danger)" : "var(--brand-verde)" } as React.CSSProperties
        }
      >
        <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden="true">
          <circle cx="4" cy="4" r="3.2" fill={user.banned ? "none" : "currentColor"} stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {user.banned ? "Blocked" : "Active"}
      </span>
    );
  }

  function stampCell(user: AdminUser) {
    return (
      <span className={t.stamp} title={exactDate.format(new Date(user.createdAt))}>
        <Icon name="clock" />
        {sinceNow(user.createdAt, now)}
      </span>
    );
  }

  function personCell(user: AdminUser) {
    return (
      <span className={t.personName}>
        {user.name || "No name"}
        {user.id === currentUserId && <span className={t.tagSelf}>You</span>}
      </span>
    );
  }

  return (
    <div className={t.page}>
      <header className={t.pageHead}>
        <div className={t.titleGroup}>
          <h1 className={t.pageTitle}>Users</h1>
          <InfoHint label="How accounts are created">
            There is no public sign-up: accounts are created here. Whoever you add receives a
            six-digit code and sets their own password, which nobody else ever sees.
          </InfoHint>
        </div>
        <div className={t.search}>
          <span className={t.searchIcon}>
            <Icon name="search" size={15} />
          </span>
          <input
            className={t.searchInput}
            type="search"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            placeholder="Search by name or email"
            aria-label="Search users"
          />
        </div>
      </header>



      <div className={t.container}>
        <div className={t.toolbar}>
          <div className={t.viewToggle} role="group" aria-label="User view mode">
            <button className={t.viewButton} type="button" onClick={() => setView("list")} aria-pressed={view === "list"}>
              <Icon name="list" size={15} />
              List
            </button>
            <button className={t.viewButton} type="button" onClick={() => setView("grid")} aria-pressed={view === "grid"}>
              <Icon name="grid" size={15} />
              Grid
            </button>
          </div>

          <button
            className={t.primary}
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <Icon name="plus" size={15} />
            Add user
          </button>
        </div>

        {/* Alto y opacidad en los dos sentidos: al soltar la selección la tabla
            daría un salto seco si solo animara al entrar. */}
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
                  {selected.size} {selected.size === 1 ? "selected" : "selected"}
                  <span className={t.bulkScope}>on this page</span>
                  {skipsSelf && (
                    <span className={t.bulkNote}>Your own account is left out of these actions.</span>
                  )}
                </span>

                <span className={t.bulkActions}>
                  <button
                    className={t.bulkButton}
                    type="button"
                    disabled={bulkBusy || bulkTargets.length === 0}
                    onClick={() => setPending({ scope: "bulk", kind: "ban", users: bulkTargets })}
                  >
                    <Icon name="ban" />
                    Block
                  </button>
                  <button
                    className={t.bulkButton}
                    type="button"
                    disabled={bulkBusy || bulkTargets.length === 0}
                    onClick={() => setPending({ scope: "bulk", kind: "unban", users: bulkTargets })}
                  >
                    <Icon name="unban" />
                    Unblock
                  </button>
                  <button
                    className={t.bulkButton}
                    type="button"
                    data-tone="danger"
                    disabled={bulkBusy || bulkTargets.length === 0}
                    onClick={() => setPending({ scope: "bulk", kind: "remove", users: bulkTargets })}
                  >
                    <Icon name="trash" />
                    Delete
                  </button>
                  <button
                    className={t.bulkButton}
                    type="button"
                    data-variant="plain"
                    disabled={bulkBusy}
                    onClick={() => setSelected(new Set())}
                  >
                    Clear selection
                  </button>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {visible.length === 0 ? (
          <p className={t.empty}>
            {query ? `No user matches “${query}”.` : "No accounts yet."}
          </p>
        ) : view === "list" ? (
          <div className={t.scroller}>
            <table className={t.table}>
              <caption className={t.srOnly}>
                Staff with panel access, {total} in total, page {page} of {totalPages}.
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
                      aria-label="Select the users on this page"
                    />
                  </th>
                  <th className={t.th} aria-sort={sortKey === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                    <button className={t.sortLink} type="button" onClick={() => sortBy("name")} data-active={sortKey === "name"}>
                      User
                      <Caret dir={sortKey === "name" ? sortDir : null} />
                    </button>
                  </th>
                  <th className={t.th}>Email</th>
                  <th className={t.th}>Status</th>
                  <th className={t.th} aria-sort={sortKey === "createdAt" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                    <button className={t.sortLink} type="button" onClick={() => sortBy("createdAt")} data-active={sortKey === "createdAt"}>
                      Added
                      <Caret dir={sortKey === "createdAt" ? sortDir : null} />
                    </button>
                  </th>
                  <th className={t.th}>Role</th>
                  <th className={t.th}>
                    <span className={t.srOnly}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`${t.row} ${t.enter}`}
                    style={{ "--i": Math.min(index, STAGGER_LIMIT) } as React.CSSProperties}
                    data-selected={selected.has(user.id)}
                  >
                    <td className={`${t.td} ${t.selectCell}`}>
                      <input
                        className={t.checkbox}
                        type="checkbox"
                        checked={selected.has(user.id)}
                        onChange={() => toggle(user.id)}
                        aria-label={`Select “${user.name || user.email}”`}
                      />
                    </td>
                    <td className={t.td}>
                      <span className={t.person}>
                        <span className={t.avatar} aria-hidden="true">
                          {initials(user.name, user.email)}
                        </span>
                        {personCell(user)}
                      </span>
                    </td>
                    <td className={t.td}>{user.email}</td>
                    <td className={t.td}>{statusBadge(user)}</td>
                    <td className={`${t.td} ${t.nowrap}`}>{stampCell(user)}</td>
                    <td className={t.td}>
                      <span className={t.chip}>Admin</span>
                    </td>
                    <td className={`${t.td} ${t.actionsCell}`}>{rowActions(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={t.grid}>
            {visible.map((user, index) => (
              <article
                key={user.id}
                className={`${t.card} ${t.enter}`}
                style={{ "--i": Math.min(index, STAGGER_LIMIT) } as React.CSSProperties}
                data-selected={selected.has(user.id)}
              >
                <div className={t.cardHead}>
                  <input
                    className={t.checkbox}
                    type="checkbox"
                    checked={selected.has(user.id)}
                    onChange={() => toggle(user.id)}
                    aria-label={`Select “${user.name || user.email}”`}
                  />
                  <span className={t.avatar} aria-hidden="true">
                    {initials(user.name, user.email)}
                  </span>
                  <span className={t.cardIdentity}>
                    {personCell(user)}
                    <span className={t.cardMeta}>{user.email}</span>
                  </span>
                </div>

                <div className={t.cardRows}>
                  <div className={t.cardRow}>
                    <span className={t.cardRowLabel}>Added</span>
                    {stampCell(user)}
                  </div>
                  <div className={t.cardRow}>
                    <span className={t.cardRowLabel}>Role</span>
                    <span className={t.chip}>Admin</span>
                  </div>
                </div>

                <div className={t.cardFoot}>
                  {statusBadge(user)}
                  {rowActions(user)}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className={t.pagination}>
        <div className={t.perPage}>
          <span>Show</span>
          <Select
            value={String(perPage)}
            options={PER_PAGE_OPTIONS}
            onChange={(next) => {
              navigate({ perPage: Number(next), page: 1 });
            }}
            label="Users per page"
          />
          <span>per page</span>
        </div>

        <nav className={t.pages} aria-label="Pagination">
          <button
            className={t.pageButton}
            type="button"
            onClick={() => navigate({ page: Math.max(1, page - 1) })}
            disabled={page === 1 || navigating}
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
                onClick={() => navigate({ page: entry })}
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
            onClick={() => navigate({ page: Math.min(totalPages, page + 1) })}
            disabled={page === totalPages || navigating}
            aria-label="Next page"
          >
            <Icon name="next" />
          </button>
        </nav>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        eyebrow="New access"
        title="Add user"
        width="30rem"
      >
        <form ref={formRef} className={styles.form} onSubmit={handleCreate} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={nameId}>
                Name
              </label>
              <input
                id={nameId}
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="First and last name"
                autoComplete="off"
                required
                aria-invalid={showErrors && Boolean(errors.name)}
              />
              {showErrors && errors.name && (
                <span className={styles.fieldError} role="alert">
                  <Icon name="alert" />
                  {errors.name}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={emailId}>
                Email
              </label>
              <input
                id={emailId}
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@cquest.do"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                aria-invalid={showErrors && Boolean(errors.email)}
              />
              {showErrors && errors.email && (
                <span className={styles.fieldError} role="alert">
                  <Icon name="alert" />
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formFoot}>
            <p className={styles.formNote}>
              The initial password is random and shown to nobody: the person sets their own with
              the code that reaches them by email.
            </p>
            <button className={t.primary} type="submit" disabled={saving}>
              {saving ? "Creating" : "Create and send access"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        eyebrow="Confirm"
        title={dialogCopy?.title ?? ""}
      >
        <p className={styles.dialogText}>{dialogCopy?.text}</p>
        <div className={styles.dialogFoot}>
          <button className={styles.ghost} type="button" onClick={() => setPending(null)}>
            Cancel
          </button>
          <button
            className={styles.confirm}
            type="button"
            onClick={() => void confirmPending()}
            disabled={busyId !== null}
          >
            {dialogCopy?.cta}
          </button>
        </div>
      </Modal>
    </div>
  );
}
