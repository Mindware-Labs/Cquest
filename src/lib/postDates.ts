/* Las dos conversiones de fecha del editor de artículos.
   ---------------------------------------------------------------------------

   Viven aparte de lib/posts.ts a propósito: ese módulo importa Prisma, y estas
   son funciones puras que se pueden probar sin levantar una base ni un pool de
   conexiones. Son además la parte del módulo con más forma de romperse en
   silencio —una hora corrida cuatro puestos no lanza ninguna excepción, sólo
   publica un artículo cuando no debía— así que es justo la que tiene que tener
   pruebas.

   La zona es la de la operación. El panel entero ya formatea en
   America/Santo_Domingo (la tabla del admin y formatPostDate del blog), así que
   la fecha que se escribe en el editor se interpreta ahí y no en la zona del
   navegador de quien la escribe: si alguien programa desde Madrid para "el
   lunes a las 8", tiene que salir a las 8 de Santo Domingo, que es cuando lo
   lee el público.

   Offset fijo y no una librería de zonas: República Dominicana no aplica
   horario de verano desde 1974, así que -04:00 vale todo el año. */

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

/** De la fecha guardada al valor que espera `<input type="datetime-local">`.
 *
 *  La conversión la hace Intl y no un `toISOString().slice(0, 16)`: eso último
 *  daría la hora UTC, o sea cuatro horas corridas respecto de lo que se
 *  escribió. Programar para las 8 y volver a abrir el editor mostrando las 12
 *  es la clase de detalle que hace que nadie vuelva a confiar en el campo. */
export function toEditorDateTime(date: Date | null | undefined): string {
  if (!date) return "";
  const parts = Object.fromEntries(
    EDITOR_DATE_PARTS.formatToParts(date).map((part) => [part.type, part.value]),
  );
  /* `en-CA` da el día en formato ISO (2026-09-01), que es exactamente lo que el
     input pide; se compone a mano igual para no depender del separador que el
     locale elija para la hora.

     `hour12: false` produce "24" para la medianoche en algunos motores en vez
     de "00", y "2026-09-01T24:00" no es un valor válido para el input. */
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`;
}

/** El camino de vuelta: "2026-09-01T08:30" del input a un Date real, leyendo la
 *  hora como la de la operación. Devuelve null si el valor no es una fecha. */
export function fromEditorDateTime(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  /* El input puede mandar segundos si el navegador los muestra ("08:30:00").
     Se aceptan los dos largos en vez de asumir uno. */
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed);
  if (!withSeconds) return null;

  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  const date = new Date(`${normalized}${OPERATION_UTC_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}
