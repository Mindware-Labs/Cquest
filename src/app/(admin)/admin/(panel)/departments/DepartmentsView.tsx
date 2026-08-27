"use client";

import { useId, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
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

/* Mismo set que ServiceIcon (src/components/services/ServiceIcon.tsx): son
   los únicos íconos que el sitio sabe dibujar. Sin vista previa en vivo acá
   porque ese componente usa clases de Tailwind, que el panel no carga. */
const ICON_OPTIONS = [
  "headset",
  "trend",
  "banknote",
  "gauge",
  "userplus",
  "shield",
  "clipboard-check",
  "wrench",
  "settings",
  "layers",
  "database",
  "messages",
  "layout",
  "chart",
  "workflow",
  "brain",
  "code",
  "phone",
  "mail",
  "share",
  "flag-mountain",
  "eye",
  "diamond",
].map((value) => ({
  value,
  label: value
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" "),
}));

const EMPTY = { shortLabel: "", label: "", icon: "workflow", responsibilities: [""] };

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
  const [pendingRow, setPendingRow] = useState<DepartmentRow | null>(null);
  const [saving, startSaving] = useTransition();
  const [busy, setBusy] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return departments;
    return departments.filter(
      (d) => d.label.toLowerCase().includes(needle) || d.shortLabel.toLowerCase().includes(needle),
    );
  }, [departments, query]);

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

  function askDelete(row: DepartmentRow) {
    setPendingRow(row);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!pendingRow) return;
    setBusy(true);
    const result = await deleteDepartments([pendingRow.id]);
    setBusy(false);
    setConfirmOpen(false);

    if (!result.ok) {
      toast.error("Could not delete", result.message);
      return;
    }
    toast.success("Department deleted", pendingRow.shortLabel);
    setPendingRow(null);
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
        <div className={t.search}>
          <span className={t.searchIcon}>
            <Icon name="search" size={15} />
          </span>
          <input
            className={t.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            aria-label="Search departments"
          />
        </div>
      </header>

      <div className={t.container}>
        <div className={t.toolbar}>
          <span />
          <button className={t.primary} type="button" onClick={openCreate}>
            <Icon name="plus" size={15} />
            Add department
          </button>
        </div>

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
          <div className={t.scroller}>
            <table className={t.table}>
              <caption className={t.srOnly}>Departments, {visible.length} in total.</caption>
              <thead>
                <tr>
                  <th className={t.th}>
                    <span className={t.srOnly}>Order</span>
                  </th>
                  <th className={t.th}>Department</th>
                  <th className={t.th}>Icon</th>
                  <th className={t.th}>Responsibilities</th>
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
                  >
                    <td className={t.td}>
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
                    <td className={t.td}>
                      <span className={styles.name}>{row.shortLabel}</span>
                      <span className={styles.fullTitle}>{row.label}</span>
                    </td>
                    <td className={t.td}>
                      <span className={styles.iconChip}>{ICON_OPTIONS.find((o) => o.value === row.icon)?.label ?? row.icon}</span>
                    </td>
                    <td className={t.td}>{row.responsibilities.length}</td>
                    <td className={`${t.td} ${t.actionsCell}`}>
                      <span className={t.actions}>
                        <button
                          className={t.action}
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label={`Edit “${row.shortLabel}”`}
                          title="Edit"
                        >
                          <Icon name="pencil" />
                        </button>
                        <button
                          className={t.action}
                          type="button"
                          data-tone="danger"
                          onClick={() => askDelete(row)}
                          aria-label={`Delete “${row.shortLabel}”`}
                          title="Delete"
                        >
                          <Icon name="trash" />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
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

          <div className={styles.field}>
            <span className={styles.label}>Icon</span>
            <Select
              value={form.icon}
              options={ICON_OPTIONS}
              onChange={(next) => setForm((f) => ({ ...f, icon: next }))}
              label="Icon"
              width="100%"
            />
          </div>

          <ListField
            label="Responsibilities"
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

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} eyebrow="Confirm" title="Delete the department">
        <p className={styles.dialogText}>
          {pendingRow && `“${pendingRow.shortLabel}” is deleted and this cannot be undone.`} Vacancies using it are
          left without a department, and it disappears from the Team page.
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
