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

const PER_PAGE_OPTIONS = [10, 25, 50].map((n) => ({ value: String(n), label: String(n) }));
const STAGGER_LIMIT = 8;

const schema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.email("Escribe un correo válido."),
});

const exactDate = new Intl.DateTimeFormat("es-DO", { dateStyle: "long" });
const relative = new Intl.RelativeTimeFormat("es-DO", { numeric: "auto" });

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
  return "hace un momento";
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

function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "gap")[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) out.push("gap");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push("gap");
  out.push(total);
  return out;
}

export default function UsersView({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const nameId = useId();
  const emailId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const allRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const base = needle
      ? users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(needle))
      : users;
    return [...base].sort((a, b) => {
      const value =
        sortKey === "name"
          ? (a.name || a.email).localeCompare(b.name || b.email, "es")
          : a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? value : -value;
    });
  }, [users, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * perPage, safePage * perPage);

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
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
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
        toast.error("No se pudo crear la cuenta", result.message);
        return;
      }
      toast.success("Cuenta creada", `El código de acceso salió hacia ${email.trim().toLowerCase()}.`);
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
    if (result.ok) toast.success("Acceso reenviado", `Código nuevo para ${user.email}.`);
    else toast.error("No se pudo reenviar el acceso", result.message);
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

    const verb = kind === "remove" ? "eliminadas" : kind === "ban" ? "bloqueadas" : "desbloqueadas";
    const noun = done === 1 ? "cuenta" : "cuentas";
    if (failed.length === 0) toast.success(`${done} ${noun} ${verb}`);
    else
      toast.error(
        `${done} de ${targets.length} ${verb}`,
        `No se pudo con: ${failed.join(", ")}.`,
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
      toast.error("La acción no se completó", result.message);
      return;
    }
    const who = user.name || user.email;
    if (kind === "remove") toast.success("Cuenta eliminada", `${who} ya no tiene acceso.`);
    else if (kind === "ban") toast.success("Acceso bloqueado", `${who} no podrá entrar.`);
    else toast.success("Acceso devuelto", `${who} puede entrar otra vez.`);
    router.refresh();
  }

  const bulkCopy =
    pending?.scope === "bulk"
      ? {
          n: pending.users.length,
          noun: pending.users.length === 1 ? "cuenta" : "cuentas",
        }
      : null;

  const dialogCopy = pending?.scope === "bulk" && bulkCopy
    ? {
        title:
          pending.kind === "remove"
            ? `Eliminar ${bulkCopy.n} ${bulkCopy.noun}`
            : pending.kind === "ban"
              ? `Bloquear ${bulkCopy.n} ${bulkCopy.noun}`
              : `Devolver el acceso a ${bulkCopy.n} ${bulkCopy.noun}`,
        text:
          pending.kind === "remove"
            ? `Se borran ${bulkCopy.n} ${bulkCopy.noun} y no se puede deshacer. Los artículos que hayan escrito se conservan.`
            : pending.kind === "ban"
              ? `Esas ${bulkCopy.n} ${bulkCopy.noun} dejarán de poder entrar al panel. Puedes desbloquearlas después.`
              : `Esas ${bulkCopy.n} ${bulkCopy.noun} volverán a poder entrar con su contraseña de siempre.`,
        cta: pending.kind === "remove" ? "Eliminar" : pending.kind === "ban" ? "Bloquear" : "Desbloquear",
      }
    : pending?.scope === "one"
    ? pending.kind === "remove"
      ? {
          title: "Eliminar la cuenta",
          text: `Se borra la cuenta de ${pending.user.name || pending.user.email} y no se puede deshacer. Los artículos que haya escrito se conservan.`,
          cta: "Eliminar",
        }
      : pending.kind === "ban"
        ? {
            title: "Bloquear el acceso",
            text: `${pending.user.name || pending.user.email} dejará de poder entrar al panel. La cuenta se conserva y puedes desbloquearla después.`,
            cta: "Bloquear",
          }
        : {
            title: "Devolver el acceso",
            text: `${pending.user.name || pending.user.email} volverá a poder entrar con su contraseña de siempre.`,
            cta: "Desbloquear",
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
          aria-label={`Reenviar el código de acceso a ${user.email}`}
          title="Reenviar acceso"
        >
          <Icon name="resend" />
        </button>
        <button
          className={t.action}
          type="button"
          onClick={() => setPending({ scope: "one", kind: user.banned ? "unban" : "ban", user })}
          disabled={busy || self}
          aria-label={`${user.banned ? "Desbloquear" : "Bloquear"} a ${user.email}`}
          title={self ? "No puedes bloquear tu cuenta" : user.banned ? "Desbloquear" : "Bloquear"}
        >
          <Icon name={user.banned ? "unban" : "ban"} />
        </button>
        <button
          className={t.action}
          type="button"
          data-tone="danger"
          onClick={() => setPending({ scope: "one", kind: "remove", user })}
          disabled={busy || self}
          aria-label={`Eliminar la cuenta de ${user.email}`}
          title={self ? "No puedes eliminar tu cuenta" : "Eliminar"}
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
        {user.banned ? "Bloqueado" : "Activo"}
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
        {user.name || "Sin nombre"}
        {user.id === currentUserId && <span className={t.tagSelf}>Tú</span>}
      </span>
    );
  }

  return (
    <div className={t.page}>
      <header className={t.pageHead}>
        <div className={t.titleGroup}>
          <h1 className={t.pageTitle}>Usuarios</h1>
          <InfoHint label="Cómo se crean las cuentas">
            No hay registro público: las cuentas se crean aquí. Quien das de alta recibe un código
            de seis dígitos y define su propia contraseña, que nadie más llega a ver.
          </InfoHint>
        </div>
        <div className={t.search}>
          <span className={t.searchIcon}>
            <Icon name="search" size={15} />
          </span>
          <input
            className={t.searchInput}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar usuarios"
          />
        </div>
      </header>



      <div className={t.container}>
        <div className={t.toolbar}>
          <div className={t.viewToggle} role="group" aria-label="Forma de ver los usuarios">
            <button className={t.viewButton} type="button" onClick={() => setView("list")} aria-pressed={view === "list"}>
              <Icon name="list" size={15} />
              Lista
            </button>
            <button className={t.viewButton} type="button" onClick={() => setView("grid")} aria-pressed={view === "grid"}>
              <Icon name="grid" size={15} />
              Cuadrícula
            </button>
          </div>

          <button
            className={t.primary}
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <Icon name="plus" size={15} />
            Agregar usuario
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
                  {selected.size} {selected.size === 1 ? "seleccionado" : "seleccionados"}
                  <span className={t.bulkScope}>en esta página</span>
                  {skipsSelf && (
                    <span className={t.bulkNote}>Tu cuenta queda fuera de estas acciones.</span>
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
                    Bloquear
                  </button>
                  <button
                    className={t.bulkButton}
                    type="button"
                    disabled={bulkBusy || bulkTargets.length === 0}
                    onClick={() => setPending({ scope: "bulk", kind: "unban", users: bulkTargets })}
                  >
                    <Icon name="unban" />
                    Desbloquear
                  </button>
                  <button
                    className={t.bulkButton}
                    type="button"
                    data-tone="danger"
                    disabled={bulkBusy || bulkTargets.length === 0}
                    onClick={() => setPending({ scope: "bulk", kind: "remove", users: bulkTargets })}
                  >
                    <Icon name="trash" />
                    Eliminar
                  </button>
                  <button
                    className={t.bulkButton}
                    type="button"
                    data-variant="plain"
                    disabled={bulkBusy}
                    onClick={() => setSelected(new Set())}
                  >
                    Quitar selección
                  </button>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {visible.length === 0 ? (
          <p className={t.empty}>
            {query ? `Ningún usuario coincide con «${query}».` : "Todavía no hay cuentas."}
          </p>
        ) : view === "list" ? (
          <div className={t.scroller}>
            <table className={t.table}>
              <caption className={t.srOnly}>
                Personal con acceso al panel, {filtered.length} en total, página {safePage} de {totalPages}.
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
                      aria-label="Seleccionar los usuarios de esta página"
                    />
                  </th>
                  <th className={t.th} aria-sort={sortKey === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                    <button className={t.sortLink} type="button" onClick={() => sortBy("name")} data-active={sortKey === "name"}>
                      Usuario
                      <Caret dir={sortKey === "name" ? sortDir : null} />
                    </button>
                  </th>
                  <th className={t.th}>Correo</th>
                  <th className={t.th}>Estado</th>
                  <th className={t.th} aria-sort={sortKey === "createdAt" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                    <button className={t.sortLink} type="button" onClick={() => sortBy("createdAt")} data-active={sortKey === "createdAt"}>
                      Alta
                      <Caret dir={sortKey === "createdAt" ? sortDir : null} />
                    </button>
                  </th>
                  <th className={t.th}>Rol</th>
                  <th className={t.th}>
                    <span className={t.srOnly}>Acciones</span>
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
                        aria-label={`Seleccionar «${user.name || user.email}»`}
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
                    aria-label={`Seleccionar «${user.name || user.email}»`}
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
                    <span className={t.cardRowLabel}>Alta</span>
                    {stampCell(user)}
                  </div>
                  <div className={t.cardRow}>
                    <span className={t.cardRowLabel}>Rol</span>
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
          <span>Mostrar</span>
          <Select
            value={String(perPage)}
            options={PER_PAGE_OPTIONS}
            onChange={(next) => {
              setPerPage(Number(next));
              setPage(1);
            }}
            label="Usuarios por página"
          />
          <span>por página</span>
        </div>

        <nav className={t.pages} aria-label="Paginación">
          <button
            className={t.pageButton}
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Página anterior"
          >
            <Icon name="prev" />
          </button>
          {pageList(safePage, totalPages).map((entry, i) =>
            entry === "gap" ? (
              <span key={`gap-${i}`} className={t.ellipsis} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={entry}
                className={t.pageButton}
                type="button"
                onClick={() => setPage(entry)}
                aria-current={entry === safePage ? "page" : undefined}
                aria-label={`Página ${entry}`}
              >
                {entry}
              </button>
            ),
          )}
          <button
            className={t.pageButton}
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Página siguiente"
          >
            <Icon name="next" />
          </button>
        </nav>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        eyebrow="Nuevo acceso"
        title="Agregar usuario"
        width="30rem"
      >
        <form ref={formRef} className={styles.form} onSubmit={handleCreate} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={nameId}>
                Nombre
              </label>
              <input
                id={nameId}
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre y apellido"
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
                Correo
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
              La contraseña inicial es aleatoria y no se muestra a nadie: la persona define la suya
              con el código que le llega por correo.
            </p>
            <button className={t.primary} type="submit" disabled={saving}>
              {saving ? "Creando" : "Crear y enviar acceso"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        eyebrow="Confirmar"
        title={dialogCopy?.title ?? ""}
      >
        <p className={styles.dialogText}>{dialogCopy?.text}</p>
        <div className={styles.dialogFoot}>
          <button className={styles.ghost} type="button" onClick={() => setPending(null)}>
            Cancelar
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
