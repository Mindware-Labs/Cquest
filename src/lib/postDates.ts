// Funciones puras (aparte de lib/posts.ts, que importa Prisma) para poder probarlas sin base de datos. La zona es la de la operación: la fecha se interpreta en America/Santo_Domingo y no en la del navegador de quien la escribe. Offset fijo y no una librería de zonas porque RD no aplica horario de verano desde 1974.
export const OPERATION_TIME_ZONE = "America/Santo_Domingo";
export const OPERATION_UTC_OFFSET = "-04:00";

const EDITOR_DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: OPERATION_TIME_ZONE,
});

/** De la fecha guardada al valor que espera `<input type="datetime-local">`. Usa Intl y no `toISOString()`, que daría la hora UTC en vez de la de la operación. */
export function toEditorDateTime(date: Date | null | undefined): string {
  if (!date) return "";
  const parts = Object.fromEntries(
    EDITOR_DATE_PARTS.formatToParts(date).map((part) => [part.type, part.value]),
  );
  // `hour12: false` produce "24" para la medianoche en algunos motores, y "2026-09-01T24:00" no es válido para el input.
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`;
}

/** El camino de vuelta: del input a un Date real, leyendo la hora como la de la operación. Devuelve null si no es una fecha válida. */
export function fromEditorDateTime(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // El input puede mandar segundos si el navegador los muestra ("08:30:00"); se aceptan los dos largos.
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed);
  if (!withSeconds) return null;

  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  const date = new Date(`${normalized}${OPERATION_UTC_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}
