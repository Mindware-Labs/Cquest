/* Compartido entre el panel (cliente) y las server actions: un archivo con
   "use server" solo puede exportar funciones async, así que las constantes
   viven aquí. */

export const APPLICATION_STATUSES = ["new", "reviewing", "shortlisted", "rejected", "hired"] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; ink: string; dot: "full" | "half" | "ring" }
> = {
  new: { label: "New", ink: "var(--brand-petroleo)", dot: "full" },
  reviewing: { label: "Reviewing", ink: "var(--brand-celeste)", dot: "half" },
  shortlisted: { label: "Shortlisted", ink: "var(--brand-verde)", dot: "full" },
  rejected: { label: "Rejected", ink: "var(--text-tertiary)", dot: "ring" },
  hired: { label: "Hired", ink: "#3d7a2a", dot: "full" },
};

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

// Mismos tonos que APPLICATION_STATUS_META.ink, pero en hex: los exports a
// Excel (exceljs) no pueden leer var(--brand-...), necesitan el valor final.
export const APPLICATION_STATUS_EXCEL_COLOR: Record<ApplicationStatus, string> = {
  new: "3F738D",
  reviewing: "74C3D5",
  shortlisted: "6AAA00",
  rejected: "6B7280",
  hired: "3D7A2A",
};
