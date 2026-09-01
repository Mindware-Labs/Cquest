"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/admin/Modal";
import InfoHint from "@/components/admin/InfoHint";
import ListField from "@/components/admin/ListField";
import { useToast } from "@/components/admin/Toaster";
import {
  createDepartment,
  deleteDepartments,
  moveDepartment,
  updateDepartment,
  type DepartmentRow,
} from "@/server/departments";
import t from "@/components/admin/dataTable.module.css";
import styles from "./DepartmentsView.module.css";

const STAGGER_LIMIT = 8;

/* El ícono no se elige a mano: el selector obligaba a adivinar cómo se ve un
   nombre como "clipboard-check" sin vista previa (ese SVG vive en
   ServiceIcon.tsx, que usa clases de Tailwind que el panel no carga). Todo
   departamento nuevo usa el mismo ícono genérico; uno ya creado conserva el
   suyo, solo que ya no es editable desde aquí. */
const DEFAULT_ICON = "workflow";

const EMPTY = { shortLabel: "", label: "", icon: DEFAULT_ICON, responsibilities: [""] };

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
    case "up":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M8 12.6V3.4M4 7.4 8 3.4l4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "layers":
      return (
        <svg {...c} width={16} height={16} aria-hidden="true">
          <path d="M8 2.4 13.6 5.6 8 8.8 2.4 5.6 8 2.4Z" strokeLinejoin="round" />
          <path d="m2.4 8.4 5.6 3.2 5.6-3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m2.4 11.2 5.6 3.2 5.6-3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M8 3.4v9.2M4 8.6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export default function DepartmentsView({ departments }: { departments: DepartmentRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const shortLabelId = useId();
  const labelId = useId();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DepartmentRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [saving, startSaving] = useTransition();
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return departments;
    return departments.filter(
      (d) => d.label.toLowerCase().includes(needle) || d.shortLabel.toLowerCase().includes(needle),
    );
  }, [departments, query]);

  // La búsqueda cambia qué filas se ven, así que la selección se limpia con
  // ella: si no, quedan ids seleccionados que ya no aparecen en pantalla.
  function handleQueryChange(next: string) {
    setQuery(next);
    setSelected(new Set());
  }

  const allChecked = visible.length > 0 && visible.every((row) => selected.has(row.id));
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
    setSelected(allChecked ? new Set() : new Set(visible.map((row) => row.id)));
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(row: DepartmentRow) {
    setEditing(row);
    setForm({
      shortLabel: row.shortLabel,
      label: row.label,
      icon: row.icon,
      responsibilities: row.responsibilities.length ? row.responsibilities : [""],
    });
    setErrors({});
    setFormOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    startSaving(async () => {
      const result = editing ? await updateDepartment(editing.id, form) : await createDepartment(form);

      if (!result.ok) {
        setErrors(result.fields ?? {});
        toast.error(editing ? "Could not save" : "Could not create the department", result.message);
        formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
        return;
      }

      setFormOpen(false);
      toast.success(editing ? "Department updated" : "Department created", form.shortLabel);
      router.refresh();
    });
  }

  function askDelete(ids: string[]) {
    setPendingIds(ids);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    setBusy(true);
    const result = await deleteDepartments(pendingIds);
    setBusy(false);
    setConfirmOpen(false);

    if (!result.ok) {
      toast.error("Could not delete", result.message);
      return;
    }
    const n = pendingIds.length;
    toast.success(n === 1 ? "Department deleted" : `${n} departments deleted`, n === 1 ? pendingNames[0] : undefined);
    setSelected(new Set());
    setPendingIds([]);
    router.refresh();
  }

  async function move(row: DepartmentRow, direction: "up" | "down") {
    setBusy(true);
    const result = await moveDepartment(row.id, direction);
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not reorder", result.message);
      return;
    }
    router.refresh();
  }

  const pendingNames = departments.filter((d) => pendingIds.includes(d.id)).map((d) => d.shortLabel);

  return (
    <div className={t.page}>
      <header className={t.pageHead}>
        <div className={t.titleGroup}>
          <h1 className={t.pageTitle}>Departments</h1>
          <InfoHint label="What departments are for">
            They power the organization chart on the public Team page and the department picker
            when creating a vacancy. The order here is the order they show in both places — use
            the arrows to move one up or down.
          </InfoHint>
        </div>
        <button className={t.primary} type="button" onClick={openCreate}>
          <Icon name="plus" size={15} />
          Add department
        </button>
      </header>

      <div className={styles.container}>
        <div className={t.toolbar}>
          <div className={t.search}>
            <span className={t.searchIcon}>
              <Icon name="search" size={15} />
            </span>
            <input
              className={t.searchInput}
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search by name"
              aria-label="Search departments"
            />
          </div>
        </div>

        {selected.size > 0 && (
          <div className={styles.bulk}>
            <div className={styles.bulkInner}>
              <span className={styles.bulkCount}>{selected.size} selected</span>
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

        {visible.length === 0 ? (
          <div className={t.empty}>
            {query ? (
              `No department matches “${query}”.`
            ) : (
              <>
                No departments yet.
                <span className={styles.emptyHint}>
                  The first one becomes available on the Team page and on new vacancies.
                </span>
              </>
            )}
          </div>
        ) : (
          <div className={styles.scroller}>
            <table className={styles.table}>
              <caption className={t.srOnly}>Departments, {visible.length} in total.</caption>
              <thead>
                <tr>
                  <th className={`${styles.th} ${styles.selectCell}`}>
                    <input
                      ref={allRef}
                      className={styles.checkbox}
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      aria-label="Select every department"
                    />
                  </th>
                  <th className={styles.th}>
                    <span className={t.srOnly}>Order</span>
                  </th>
                  <th className={styles.th}>Department</th>
                  <th className={styles.th}>Responsibilities</th>
                  <th className={styles.th}>
                    <span className={t.srOnly}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row, index) => {
                  const isSelected = selected.has(row.id);
                  return (
                    <tr
                      key={row.id}
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
                          aria-label={`Select “${row.shortLabel}”`}
                        />
                      </td>
                      <td className={styles.td}>
                        <span className={styles.reorder}>
                          <button
                            className={styles.reorderButton}
                            type="button"
                            onClick={() => move(row, "up")}
                            disabled={busy || index === 0 || query !== ""}
                            aria-label={`Move “${row.shortLabel}” up`}
                            title="Move up"
                          >
                            <Icon name="up" />
                          </button>
                          <button
                            className={styles.reorderButton}
                            type="button"
                            onClick={() => move(row, "down")}
                            disabled={busy || index === visible.length - 1 || query !== ""}
                            aria-label={`Move “${row.shortLabel}” down`}
                            title="Move down"
                          >
                            <Icon name="down" />
                          </button>
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.article}>
                          <span className={styles.thumb}>
                            <Icon name="layers" />
                          </span>
                          <span>
                            <span className={styles.name}>{row.shortLabel}</span>
                            <span className={styles.fullTitle}>{row.label}</span>
                          </span>
                        </span>
                      </td>
                      <td className={styles.td}>{row.responsibilities.length}</td>
                      <td className={`${styles.td} ${styles.actionsCell}`}>
                        <span className={styles.actions}>
                          <button
                            className={styles.action}
                            type="button"
                            onClick={() => openEdit(row)}
                            aria-label={`Edit “${row.shortLabel}”`}
                            title="Edit"
                          >
                            <Icon name="pencil" />
                          </button>
                          <button
                            className={styles.action}
                            type="button"
                            data-tone="danger"
                            onClick={() => askDelete([row.id])}
                            aria-label={`Delete “${row.shortLabel}”`}
                            title="Delete"
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
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        eyebrow={editing ? "Edit" : "New department"}
        title={editing ? editing.shortLabel : "Add department"}
        width="32rem"
      >
        <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={shortLabelId}>
              Short name
            </label>
            <input
              id={shortLabelId}
              className={styles.input}
              value={form.shortLabel}
              onChange={(event) => setForm((f) => ({ ...f, shortLabel: event.target.value }))}
              placeholder="Customer Experience"
              autoComplete="off"
              required
              aria-invalid={Boolean(errors.shortLabel)}
              aria-describedby={`${shortLabelId}-help`}
            />
            <span className={styles.help} id={`${shortLabelId}-help`}>
              Shown in lists and in the department picker when creating a vacancy.
            </span>
            {errors.shortLabel && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.shortLabel}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={labelId}>
              Full title
            </label>
            <input
              id={labelId}
              className={styles.input}
              value={form.label}
              onChange={(event) => setForm((f) => ({ ...f, label: event.target.value }))}
              placeholder="Customer Experience Department"
              autoComplete="off"
              required
              aria-invalid={Boolean(errors.label)}
              aria-describedby={`${labelId}-help`}
            />
            <span className={styles.help} id={`${labelId}-help`}>
              The heading shown on the public Team page.
            </span>
            {errors.label && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.label}
              </span>
            )}
          </div>

          <ListField
            label="Responsibilities"
            help="Optional — what this department owns, shown on the public Team page."
            placeholder="One thing this department owns"
            items={form.responsibilities}
            onChange={(next) => setForm((f) => ({ ...f, responsibilities: next }))}
          />

          <div className={styles.formFoot}>
            <button className={styles.ghost} type="button" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button className={t.primary} type="submit" disabled={saving}>
              {saving ? "Saving" : editing ? "Save changes" : "Create department"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        eyebrow="Confirm"
        title={pendingIds.length === 1 ? "Delete the department" : `Delete ${pendingIds.length} departments`}
      >
        <p className={styles.dialogText}>
          {pendingIds.length === 1
            ? `“${pendingNames[0] ?? ""}” is deleted and this cannot be undone.`
            : `${pendingIds.length} departments are deleted and this cannot be undone.`}{" "}
          Vacancies using them are left without a department, and they disappear from the Team page.
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
