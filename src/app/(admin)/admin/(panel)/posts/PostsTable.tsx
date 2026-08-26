"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/admin/Toaster";
import styles from "./PostsTable.module.css";

export type PostStatus = "published" | "scheduled" | "draft" | "hidden";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  cover: string | null;
  category: string;
  locale: "es" | "en";
  status: PostStatus;
  scheduledFor: string | null;
  editedAt: string;
  author: string | null;
};

type SortKey = "title" | "editedAt";
type SortDir = "asc" | "desc";

const STAGGER_LIMIT = 8;

const STATUS: Record<PostStatus, { label: string; ink: string; dot: "full" | "half" | "ring" }> = {
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

export default function PostsTable({ rows }: { rows: PostRow[] }) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("editedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const allRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const value =
        sortKey === "title"
          ? a.title.localeCompare(b.title, "es")
          : a.editedAt.localeCompare(b.editedAt);
      return sortDir === "asc" ? value : -value;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const allChecked = rows.length > 0 && selected.size === rows.length;
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

  function sortBy(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "title" ? "asc" : "desc");
  }

  function ariaSort(key: SortKey) {
    if (key !== sortKey) return "none" as const;
    return sortDir === "asc" ? ("ascending" as const) : ("descending" as const);
  }

  return (
    <div className={styles.container}>
      {selected.size > 0 && (
        <div className={styles.bulk}>
          <div className={styles.bulkInner}>
            <span className={styles.bulkCount}>
              {selected.size} {selected.size === 1 ? "seleccionado" : "seleccionados"}
              <span className={styles.bulkScope}>en esta página</span>
            </span>
            <span className={styles.bulkActions}>
              <button className={styles.bulkButton} type="button">
                Publicar
              </button>
              <button className={styles.bulkButton} type="button">
                Ocultar
              </button>
              <button className={styles.bulkButton} type="button">
                Pasar a borrador
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
            Artículos del blog, {rows.length} en esta página, ordenados por{" "}
            {sortKey === "title" ? "título" : "última edición"}.
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
              <th className={styles.th}>Idioma</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th} aria-sort={ariaSort("editedAt")}>
                <button className={styles.sortLink} type="button" onClick={() => sortBy("editedAt")} data-active={sortKey === "editedAt"}>
                  Editado
                  <Caret dir={sortKey === "editedAt" ? sortDir : null} />
                </button>
              </th>
              <th className={styles.th}>
                <span className={styles.caption}>Acciones</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={7}>
                  Todavía no hay artículos. El primero se crea desde “Nuevo artículo”.
                </td>
              </tr>
            )}

            {sorted.map((row, index) => {
              const state = STATUS[row.status];
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
                          {row.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element -- miniatura de 36px; el dominio de Blob aún no está en remotePatterns
                            <img src={row.cover} alt="" />
                          ) : (
                            <span title="Sin portada">
                              <Icon name="image" />
                            </span>
                          )}
                        </span>
                        <a className={styles.articleTitle} href={`/admin/posts/${row.id}`}>
                          {row.title}
                        </a>
                      </span>
                    </td>

                    <td className={`${styles.td} ${styles.inkCell}`}>{row.category}</td>

                    <td className={styles.td}>
                      <span className={styles.lang}>{row.locale}</span>
                    </td>

                    <td className={styles.td}>
                      <span className={styles.badge} style={{ "--badge-ink": state.ink } as React.CSSProperties}>
                        <StatusDot shape={state.dot} />
                        {state.label}
                      </span>
                      {row.status === "scheduled" && row.scheduledFor && (
                        <span className={styles.badgeDate}>{formatStamp(row.scheduledFor)}</span>
                      )}
                    </td>

                    <td className={styles.td}>
                      <span className={styles.edited}>
                        <Icon name="clock" />
                        <span className={styles.stamp}>{formatStamp(row.editedAt)}</span>
                      </span>
                      {row.author && <span className={styles.author}>{row.author}</span>}
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
                        <a
                          className={styles.action}
                          href={`/admin/posts/${row.id}`}
                          title={`Editar «${row.title}»`}
                          aria-label={`Editar «${row.title}»`}
                        >
                          <Icon name="pencil" />
                        </a>
                        <button
                          className={styles.action}
                          type="button"
                          title={row.status === "published" ? `Ocultar «${row.title}»` : `Publicar «${row.title}»`}
                          aria-label={row.status === "published" ? `Ocultar «${row.title}»` : `Publicar «${row.title}»`}
                          onClick={() =>
                            toast.info(
                              row.status === "published" ? "Ocultar aún no funciona" : "Publicar aún no funciona",
                              "La tabla del blog llega en la fase de base de datos.",
                            )
                          }
                        >
                          <Icon name={row.status === "published" ? "eyeOff" : "eye"} />
                        </button>
                        <button
                          className={styles.action}
                          type="button"
                          data-tone="danger"
                          title={`Eliminar «${row.title}»`}
                          aria-label={`Eliminar «${row.title}»`}
                          onClick={() =>
                            toast.info(
                              "Eliminar aún no funciona",
                              "La tabla del blog llega en la fase de base de datos.",
                            )
                          }
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
  );
}
