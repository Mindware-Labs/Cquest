"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import InfoHint from "@/components/admin/InfoHint";
import { useToast } from "@/components/admin/Toaster";
import { slugify } from "@/lib/slugify";
import {
  createCategory,
  deleteCategories,
  updateCategory,
  type CategoryRow,
} from "@/server/categories";
import t from "@/components/admin/dataTable.module.css";
import { PER_PAGE_OPTIONS, pageList } from "@/components/admin/pagination";
import { useDebouncedSearch, useTableParams } from "@/components/admin/useTableParams";
import styles from "./CategoriesView.module.css";

type SortKey = "name" | "createdAt";
type SortDir = "asc" | "desc";

const STAGGER_LIMIT = 8;

const EMPTY = { name: "", description: "" };

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

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
    case "pencil":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M11.2 2.6 13.4 4.8 5.6 12.6 2.6 13.4l.8-3z" strokeLinejoin="round" />
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
  categories: CategoryRow[];
  total: number;
  page: number;
  perPage: number;
  sortKey: SortKey;
  sortDir: SortDir;
  query: string;
};

export default function CategoriesView({
  categories,
  total,
  page,
  perPage,
  sortKey,
  sortDir,
  query,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const reduced = useReducedMotion() ?? false;
  const formRef = useRef<HTMLFormElement>(null);
  const allRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const descriptionId = useId();

  const [view, setView] = useState<"list" | "grid">("list");
  const { pending, setParams } = useTableParams();
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

  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [saving, startSaving] = useTransition();
  const [busy, setBusy] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const visible = categories;

  const allChecked = visible.length > 0 && visible.every((c) => selected.has(c.id));
  const someChecked = visible.some((c) => selected.has(c.id)) && !allChecked;

  // indeterminate no es un atributo: solo se fija por JavaScript.
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someChecked;
  }, [someChecked]);

  // Al editar se conserva el slug existente: se muestra, no se recalcula.
  const previewSlug = editing ? editing.slug : slugify(form.name);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(row: CategoryRow) {
    setEditing(row);
    setForm({ name: row.name, description: row.description ?? "" });
    setErrors({});
    setFormOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    startSaving(async () => {
      const result = editing ? await updateCategory(editing.id, form) : await createCategory(form);

      if (!result.ok) {
        setErrors(result.fields ?? {});
        toast.error(editing ? "Could not save" : "Could not create the category", result.message);
        formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
        return;
      }

      setFormOpen(false);
      toast.success(editing ? "Category updated" : "Category created", form.name);
      router.refresh();
    });
  }

  async function confirmDelete() {
    setBusy(true);
    const result = await deleteCategories(pendingIds);
    setBusy(false);
    setConfirmOpen(false);

    if (!result.ok) {
      toast.error("Could not delete", result.message);
      return;
    }
    const n = pendingIds.length;
    toast.success(`${n} ${n === 1 ? "category deleted" : "categories deleted"}`);
    setSelected(new Set());
    setPendingIds([]);
    router.refresh();
  }

  function askDelete(ids: string[]) {
    setPendingIds(ids);
    setConfirmOpen(true);
  }

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
      for (const c of visible) {
        if (allChecked) next.delete(c.id);
        else next.add(c.id);
      }
      return next;
    });
  }

  function sortBy(key: SortKey) {
    const dir = key === sortKey ? (sortDir === "asc" ? "desc" : "asc") : key === "name" ? "asc" : "desc";
    navigate({ sort: key, dir, page: 1 });
  }

  function rowActions(row: CategoryRow) {
    return (
      <span className={t.actions}>
        <button
          className={t.action}
          type="button"
          onClick={() => openEdit(row)}
          aria-label={`Edit “${row.name}”`}
          title="Edit"
        >
          <Icon name="pencil" />
        </button>
        <button
          className={t.action}
          type="button"
          data-tone="danger"
          onClick={() => askDelete([row.id])}
          aria-label={`Delete “${row.name}”`}
          title="Delete"
        >
          <Icon name="trash" />
        </button>
      </span>
    );
  }

  const pendingNames = categories.filter((c) => pendingIds.includes(c.id)).map((c) => c.name);

  return (
    <div className={t.page}>
      <header className={t.pageHead}>
        <div className={t.titleGroup}>
          <h1 className={t.pageTitle}>Categories</h1>
          <InfoHint label="What categories are for">
            They group articles and feed the filters on the public blog. The slug is the part that
            shows in the URL, so it is best left alone once published.
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
            placeholder="Search by name or slug"
            aria-label="Search categories"
          />
        </div>
      </header>

      <div className={t.container}>
        <div className={t.toolbar}>
          <div className={t.viewToggle} role="group" aria-label="Category view mode">
            <button className={t.viewButton} type="button" onClick={() => setView("list")} aria-pressed={view === "list"}>
              <Icon name="list" size={15} />
              List
            </button>
            <button className={t.viewButton} type="button" onClick={() => setView("grid")} aria-pressed={view === "grid"}>
              <Icon name="grid" size={15} />
              Grid
            </button>
          </div>

          <button className={t.primary} type="button" onClick={openCreate}>
            <Icon name="plus" size={15} />
            Add category
          </button>
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
                  {selected.size} {selected.size === 1 ? "selected" : "selected"}
                  <span className={t.bulkScope}>on this page</span>
                </span>
                <span className={t.bulkActions}>
                  <button
                    className={t.bulkButton}
                    type="button"
                    data-tone="danger"
                    onClick={() => askDelete([...selected])}
                  >
                    <Icon name="trash" />
                    Delete
                  </button>
                  <button
                    className={t.bulkButton}
                    type="button"
                    data-variant="plain"
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
          <div className={t.empty}>
            {query ? (
              `No category matches “${query}”.`
            ) : (
              <>
                No categories yet.
                <span className={styles.emptyHint}>
                  The first one defines how articles are grouped on the blog.
                </span>
              </>
            )}
          </div>
        ) : view === "list" ? (
          <div className={t.scroller}>
            <table className={t.table}>
              <caption className={t.srOnly}>
                Blog categories, {total} in total, page {page} of {totalPages}.
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
                      aria-label="Select the categories on this page"
                    />
                  </th>
                  <th className={t.th} aria-sort={sortKey === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                    <button className={t.sortLink} type="button" onClick={() => sortBy("name")} data-active={sortKey === "name"}>
                      Category
                      <Caret dir={sortKey === "name" ? sortDir : null} />
                    </button>
                  </th>
                  <th className={t.th}>Slug</th>
                  <th className={t.th} aria-sort={sortKey === "createdAt" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                    <button className={t.sortLink} type="button" onClick={() => sortBy("createdAt")} data-active={sortKey === "createdAt"}>
                      Created
                      <Caret dir={sortKey === "createdAt" ? sortDir : null} />
                    </button>
                  </th>
                  <th className={t.th}>
                    <span className={t.srOnly}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`${t.row} ${t.enter}`}
                    style={{ "--i": Math.min(index, STAGGER_LIMIT) } as React.CSSProperties}
                    data-selected={selected.has(row.id)}
                  >
                    <td className={`${t.td} ${t.selectCell}`}>
                      <input
                        className={t.checkbox}
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggle(row.id)}
                        aria-label={`Select “${row.name}”`}
                      />
                    </td>
                    <td className={t.td}>
                      <span className={styles.name}>{row.name}</span>
                      {row.description && <span className={styles.description}>{row.description}</span>}
                    </td>
                    <td className={t.td}>
                      <span className={styles.slug}>/{row.slug}</span>
                    </td>
                    <td className={`${t.td} ${t.nowrap}`}>{dateFormat.format(new Date(row.createdAt))}</td>
                    <td className={`${t.td} ${t.actionsCell}`}>{rowActions(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={t.grid}>
            {visible.map((row, index) => (
              <article
                key={row.id}
                className={`${t.card} ${t.enter}`}
                style={{ "--i": Math.min(index, STAGGER_LIMIT) } as React.CSSProperties}
                data-selected={selected.has(row.id)}
              >
                <div className={t.cardHead}>
                  <input
                    className={t.checkbox}
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggle(row.id)}
                    aria-label={`Select “${row.name}”`}
                  />
                  <span className={t.cardIdentity}>
                    <span className={styles.name}>{row.name}</span>
                    <span className={t.cardMeta}>/{row.slug}</span>
                  </span>
                </div>

                {row.description && <p className={styles.cardDescription}>{row.description}</p>}

                <div className={t.cardFoot}>
                  <span className={styles.count}>
                    {dateFormat.format(new Date(row.createdAt))}
                  </span>
                  {rowActions(row)}
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
            label="Categories per page"
          />
          <span>per page</span>
        </div>

        <nav className={t.pages} aria-label="Pagination">
          <button
            className={t.pageButton}
            type="button"
            onClick={() => navigate({ page: Math.max(1, page - 1) })}
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
            disabled={page === totalPages || pending}
            aria-label="Next page"
          >
            <Icon name="next" />
          </button>
        </nav>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        eyebrow={editing ? "Edit" : "New category"}
        title={editing ? editing.name : "Add category"}
        width="32rem"
      >
        <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={nameId}>
              Name
            </label>
            <input
              id={nameId}
              className={styles.input}
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              placeholder="Call Center"
              autoComplete="off"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={`${nameId}-url`}
            />
            {/* La URL se muestra, no se edita: el usuario no tiene por qué inventarla. */}
            <span className={styles.help} id={`${nameId}-url`}>
              {editing ? "URL fixed since creation:" : "Will be published at:"}{" "}
              <span className={styles.slug}>/blog/{previewSlug || "…"}</span>
            </span>
            {errors.name && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.name}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={descriptionId}>
              Description <span className={styles.optional}>optional</span>
            </label>
            <textarea
              id={descriptionId}
              className={styles.textarea}
              value={form.description}
              onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
              rows={3}
              maxLength={240}
              placeholder="One line about what this category groups."
            />
          </div>

          <div className={styles.formFoot}>
            <button className={styles.ghost} type="button" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button className={t.primary} type="submit" disabled={saving}>
              {saving ? "Saving" : editing ? "Save changes" : "Create category"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        eyebrow="Confirm"
        title={
          pendingIds.length === 1
            ? "Delete the category"
            : `Delete ${pendingIds.length} categories`
        }
      >
        <p className={styles.dialogText}>
          {pendingIds.length === 1
            ? `“${pendingNames[0] ?? ""}” is deleted and this cannot be undone.`
            : `${pendingIds.length} categories are deleted and this cannot be undone.`}{" "}
          Articles using them will be left without a category.
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
    </div>
  );
}
