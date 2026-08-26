"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PER_PAGE_OPTIONS, pageList } from "@/components/admin/pagination";
import { useTableParams } from "@/components/admin/useTableParams";
import Select from "@/components/admin/Select";
import t from "@/components/admin/dataTable.module.css";
import { useToast } from "@/components/admin/Toaster";
import { deletePosts, setPostStatus, type PostListRow } from "@/server/posts";
import styles from "./PostsTable.module.css";

type Badge = "published" | "scheduled" | "draft" | "hidden";

/* Programado no se guarda: es publicado con fecha futura. Derivarlo evita un
   cron que voltee estados y un estado más que mantener sincronizado. */
function badgeOf(row: PostListRow, now: number): Badge {
  if (row.status !== "published") return row.status;
  return row.publishedAt && new Date(row.publishedAt).getTime() > now ? "scheduled" : "published";
}

type SortKey = "title" | "updatedAt";
type SortDir = "asc" | "desc";

const STAGGER_LIMIT = 8;

const STATUS: Record<Badge, { label: string; ink: string; dot: "full" | "half" | "ring" }> = {
  published: { label: "Publicado", ink: "var(--brand-verde)", dot: "full" },
  scheduled: { label: "Programado", ink: "var(--brand-petroleo)", dot: "half" },
  draft: { label: "Borrador", ink: "var(--brand-celeste)", dot: "full" },
  hidden: { label: "Oculto", ink: "var(--text-tertiary)", dot: "ring" },
};

const stamp = new Intl.DateTimeFormat("es-DO", {
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
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}, ${get("hour")}:${get("minute")}`;
}

/* La forma del punto distingue los estados sin depender del color: es la prueba
   barata para daltonismo y lo que hace legible la columna en blanco y negro. */
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
    case "clock":
      return (
        <svg {...c} aria-hidden="true">
          <circle cx="8" cy="8" r="5.8" />
          <path d="M8 4.8V8l2.2 1.4" strokeLinecap="round" />
        </svg>
      );
    case "image":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <rect x="2.2" y="3.2" width="11.6" height="9.6" />
          <path d="m2.2 10.6 3-2.6 3.2 2.8 2.4-2 3 2.4" strokeLinejoin="round" />
          <circle cx="5.8" cy="6.2" r="0.9" />
        </svg>
      );
    case "external":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M9.4 2.6h4v4M13.4 2.6 7.6 8.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.4 9.6v3.8H2.6V3.6h3.8" strokeLinecap="round" strokeLinejoin="round" />
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
    case "alert":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M8 2 14.6 13.4H1.4L8 2Z" strokeLinejoin="round" />
          <path d="M8 6.4v3.2M8 11.6v.6" strokeLinecap="round" />
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
  rows: PostListRow[];
  total: number;
  page: number;
  perPage: number;
  sortKey: SortKey;
  sortDir: SortDir;
};

export default function PostsTable({ rows, total, page, perPage, sortKey, sortDir }: Props) {
  const toast = useToast();
  const router = useRouter();
  const { pending, setParams } = useTableParams();
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());

  async function toggleVisibility(row: PostListRow) {
    setBusy(true);
    const next = row.status === "published" ? "hidden" : "published";
    const result = await setPostStatus(row.id, next);
    setBusy(false);
    if (!result.ok) {
      toast.error("No se pudo cambiar el estado", result.message);
      return;
    }
    toast.success(next === "published" ? "Artículo publicado" : "Artículo oculto", row.title);
    router.refresh();
  }

  async function removeSelected(ids: string[]) {
    setBusy(true);
    const result = await deletePosts(ids);
    setBusy(false);
    if (!result.ok) {
      toast.error("No se pudo eliminar", result.message);
      return;
    }
    toast.success(`${ids.length} ${ids.length === 1 ? "artículo eliminado" : "artículos eliminados"}`);
    setSelected(new Set());
    router.refresh();
  }
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  /* Cada cambio de página u orden es una navegación: el servidor vuelve a
     consultar con los parámetros nuevos y devuelve solo esas filas. */
  function navigate(next: Record<string, string | number>) {
    setSelected(new Set());
    setParams(next);
  }

  const allChecked = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const someChecked = selected.size > 0 && !allChecked;

  // indeterminate no es un atributo: solo se fija por JavaScript.
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

  /* La selección no cruza de página: la barra de acciones dice "en esta página"
     y borrar en bloque filas que ya no se ven es la forma fácil de equivocarse. */
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

  return (
    <>
      <div className={styles.container}>
      {selected.size > 0 && (
        <div className={styles.bulk}>
          <div className={styles.bulkInner}>
            <span className={styles.bulkCount}>
              {selected.size} {selected.size === 1 ? "seleccionado" : "seleccionados"}
              <span className={styles.bulkScope}>en esta página</span>
            </span>
            <span className={styles.bulkActions}>
              <button
                className={styles.bulkButton}
                type="button"
                data-tone="danger"
                disabled={busy}
                onClick={() => void removeSelected([...selected])}
              >
                Eliminar
              </button>
              <button
                className={styles.bulkButton}
                type="button"
                data-variant="plain"
                onClick={() => setSelected(new Set())}
              >
                Quitar selección
              </button>
            </span>
          </div>
        </div>
      )}

      <div className={styles.scroller}>
        <table className={styles.table}>
          <caption className={styles.caption}>
            Artículos del blog, {rows.length} en esta página de {total}, página {page} de{" "}
            {totalPages}, ordenados por {sortKey === "title" ? "título" : "última edición"}.
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
                  aria-label="Seleccionar todos los artículos de esta página"
                />
              </th>
              <th className={styles.th} aria-sort={ariaSort("title")}>
                <button className={styles.sortLink} type="button" onClick={() => sortBy("title")} data-active={sortKey === "title"}>
                  Artículo
                  <Caret dir={sortKey === "title" ? sortDir : null} />
                </button>
              </th>
              <th className={styles.th}>Categoría</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th} aria-sort={ariaSort("updatedAt")}>
                <button className={styles.sortLink} type="button" onClick={() => sortBy("updatedAt")} data-active={sortKey === "updatedAt"}>
                  Editado
                  <Caret dir={sortKey === "updatedAt" ? sortDir : null} />
                </button>
              </th>
              <th className={styles.th}>
                <span className={styles.caption}>Acciones</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={6}>
                  Todavía no hay artículos. El primero se crea desde “Nuevo artículo”.
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
                        aria-label={`Seleccionar «${row.title}»`}
                      />
                    </td>

                    <td className={`${styles.td} ${styles.titleCell}`}>
                      <span className={styles.article}>
                        <span className={styles.thumb}>
                          {row.coverUrl ? (
                            <Image src={row.coverUrl} alt="" width={36} height={36} />
                          ) : (
                            <span title="Sin portada">
                              <Icon name="image" />
                            </span>
                          )}
                        </span>
                        <Link className={styles.articleTitle} href={`/admin/posts/${row.id}`}>
                          {row.title}
                        </Link>
                      </span>
                    </td>

                    <td className={`${styles.td} ${styles.inkCell}`}>{row.categoryName ?? "Sin categoría"}</td>

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
                        {row.status === "published" ? (
                          <a
                            className={styles.action}
                            href={`/es/blog/${row.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title={`Abrir «${row.title}» en el blog`}
                            aria-label={`Abrir «${row.title}» en el blog`}
                          >
                            <Icon name="external" />
                          </a>
                        ) : (
                          <a
                            className={styles.action}
                            href={`/es/blog/${row.slug}/preview`}
                            title={`Previsualizar «${row.title}»`}
                            aria-label={`Previsualizar «${row.title}»`}
                          >
                            <Icon name="eye" />
                          </a>
                        )}
                        <Link
                          className={styles.action}
                          href={`/admin/posts/${row.id}`}
                          title={`Editar «${row.title}»`}
                          aria-label={`Editar «${row.title}»`}
                        >
                          <Icon name="pencil" />
                        </Link>
                        <button
                          className={styles.action}
                          type="button"
                          title={row.status === "published" ? `Ocultar «${row.title}»` : `Publicar «${row.title}»`}
                          aria-label={row.status === "published" ? `Ocultar «${row.title}»` : `Publicar «${row.title}»`}
                          disabled={busy}
                          onClick={() => void toggleVisibility(row)}
                        >
                          <Icon name={row.status === "published" ? "eyeOff" : "eye"} />
                        </button>
                        <button
                          className={styles.action}
                          type="button"
                          data-tone="danger"
                          title={`Eliminar «${row.title}»`}
                          aria-label={`Eliminar «${row.title}»`}
                          disabled={busy}
                          onClick={() => void removeSelected([row.id])}
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
          <span>Mostrar</span>
          <Select
            value={String(perPage)}
            options={PER_PAGE_OPTIONS}
            onChange={(next) => changePerPage(Number(next))}
            label="Artículos por página"
          />
          <span>por página</span>
        </div>

        <nav className={t.pages} aria-label="Paginación">
          <button
            className={t.pageButton}
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 1 || pending}
            aria-label="Página anterior"
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
                aria-label={`Página ${entry}`}
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
            aria-label="Página siguiente"
          >
            <Icon name="next" />
          </button>
        </nav>
      </div>
    </>
  );
}
