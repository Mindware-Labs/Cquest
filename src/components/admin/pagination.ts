import type { SelectOption } from "./Select";

export const PER_PAGE_OPTIONS: SelectOption[] = [10, 25, 50].map((n) => ({
  value: String(n),
  label: String(n),
}));

/* Ventana con elipsis: con veinte números la fila de paginación pesa más que la
   tabla. Siempre están la primera, la última y el entorno de la actual. */
export function pageList(current: number, total: number): (number | "gap")[] {
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
