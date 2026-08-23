import type { CSSProperties } from "react";
import clsx from "clsx";

/* Esqueletos de carga.

   La regla que gobierna todo el archivo: un esqueleto tiene que tener la MISMA
   caja que el contenido que reemplaza. Si la fila real mide 36px y el esqueleto
   30px, al llegar los datos la página salta — y ese salto es peor que no haber
   mostrado nada, porque llega justo cuando el ojo ya se apoyó en algo.

   Por eso cada pieza copia las alturas y el relleno de su equivalente en
   Surface.tsx, y ninguna inventa una forma propia. Esqueletos y no un spinner:
   el esqueleto ya dibuja la forma de lo que viene; un spinner informa que algo
   pasa y después reacomoda la página entera. */

export function SkeletonLine({
  width = "100%",
  height = "0.75rem",
  className,
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx("cq-skeleton block", className)}
      style={{ width, height } as CSSProperties}
    />
  );
}

/* Espeja el canto de sección: la cifra grande y su etiqueta, sobre la regla. */
export function SkeletonSectionHead() {
  return (
    <div className="cq-section">
      <div className="cq-section-head">
        <div className="flex items-end gap-3">
          <SkeletonLine width="2.4rem" height="1.9rem" />
          <SkeletonLine width="6rem" height="0.7rem" className="mb-2" />
        </div>
      </div>
    </div>
  );
}

/* Espeja la columna de cifra del tablero. */
export function SkeletonStatCard() {
  return (
    <div className="cq-stat">
      <SkeletonLine width="4.5rem" height="0.7rem" />
      <SkeletonLine width="3rem" height="2rem" className="mt-2" />
      <SkeletonLine width="7.5rem" height="0.75rem" className="mt-2" />
    </div>
  );
}

/* Espeja la fila de datos. El ancho del título varía por índice a propósito: un
   bloque de filas idénticas se lee como una trama de fondo, no como contenido
   que está por llegar. */
export function SkeletonRow({ index = 0 }: { index?: number }) {
  const widths = ["58%", "44%", "67%", "38%", "51%"];

  return (
    <li className="flex h-9 items-center gap-3 border-b border-[var(--p-line)] last:border-b-0">
      <SkeletonLine width="1.25rem" height="0.7rem" className="shrink-0" />
      <span className="min-w-0 flex-1">
        <SkeletonLine width={widths[index % widths.length]} height="0.8rem" />
      </span>
      <SkeletonLine width="4rem" height="0.7rem" className="shrink-0" />
      <SkeletonLine width="5rem" height="0.7rem" className="hidden shrink-0 sm:block" />
    </li>
  );
}

export function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <ul>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonRow key={index} index={index} />
      ))}
    </ul>
  );
}

/* Espeja la TABLA de artículos, que no es una lista de filas planas.

   `SkeletonRows` dibujaba `<li>` de 36px sin encabezado, y la tabla real tiene
   un `<thead>` pegado y filas de unos 52px —miniatura de 32px más dos líneas de
   texto—. Sobre diez filas eso es un salto de más de 150px justo cuando el ojo
   ya se apoyó en algo, y en la pantalla más visitada del panel.

   Es un `<div>` y no una `<table>`: no hay datos que anunciar, y una tabla vacía
   con `aria-hidden` en el medio de un árbol es más ruido que ayuda. */
export function SkeletonTable({ count = 10 }: { count?: number }) {
  const widths = ["58%", "44%", "67%", "38%", "51%"];

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-[var(--p-line)] bg-[var(--p-surface-sunken)] px-3 py-2">
        <SkeletonLine width="0.9rem" height="0.9rem" className="shrink-0" />
        <SkeletonLine width="4rem" height="0.65rem" className="flex-1" />
        <SkeletonLine width="4rem" height="0.65rem" className="hidden shrink-0 sm:block" />
        <SkeletonLine width="3rem" height="0.65rem" className="hidden shrink-0 sm:block" />
        <SkeletonLine width="4.5rem" height="0.65rem" className="shrink-0" />
      </div>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-[var(--p-line)] px-3 py-2 last:border-b-0"
        >
          <SkeletonLine width="0.9rem" height="0.9rem" className="shrink-0" />
          <SkeletonLine
            width="2rem"
            height="2rem"
            className="shrink-0 rounded-[var(--p-radius-xs)]"
          />
          <span className="min-w-0 flex-1">
            <SkeletonLine width={widths[index % widths.length]} height="0.8rem" />
            <SkeletonLine width="30%" height="0.65rem" className="mt-1.5" />
          </span>
          <SkeletonLine width="4rem" height="0.7rem" className="hidden shrink-0 sm:block" />
          <SkeletonLine
            width="4.5rem"
            height="1.25rem"
            className="shrink-0 rounded-[var(--p-radius-full)]"
          />
        </div>
      ))}
    </div>
  );
}

/* Espeja el encabezado de ModulePage: la acción sola contra el margen derecho.

   Las dos barras de título se fueron con el `<h1>` visible, que ahora es
   `sr-only` porque la miga de la barra superior ya nombra el módulo. Reservar
   espacio para un texto que no va a llegar nunca es el mismo salto que el
   esqueleto existe para evitar, sólo que al revés.

   El radio es el de un CONTROL —el botón que reemplaza— y no `4px` escrito a
   mano: dibujaba una caja de esquinas más duras que el botón que llegaba. */
export function SkeletonPageHeader({ withAction = true }: { withAction?: boolean }) {
  /* Sin acción no hay franja, igual que en `ModulePage`: el módulo que no pasa
     `actions` no dibuja encabezado, así que reservarle 16px acá dejaba un hueco
     que al cargar se cerraba de golpe y subía la página entera. */
  if (!withAction) return null;

  return (
    <header className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 pb-4">
      {(
        <SkeletonLine
          width="8.5rem"
          height="var(--p-control-h)"
          className="rounded-[var(--p-radius-sm)]"
        />
      )}
    </header>
  );
}

/* `SkeletonCard` se fue con su único consumidor. Espejaba la grilla de tarjetas
   de Plantillas, que ahora es una lista: un esqueleto sin contenido al que
   espejar no es una pieza disponible, es una segunda forma de dibujar la misma
   pantalla esperando que alguien la use y quede distinta de la real. */

/* El esqueleto es puramente visual —de ahí los `aria-hidden` de arriba—, así
   que la carga se anuncia una sola vez acá en lugar de que un lector de
   pantalla recorra veinte cajas vacías. */
export function LoadingAnnouncement({ children = "Cargando" }: { children?: string }) {
  return (
    <p role="status" className="sr-only">
      {children}
    </p>
  );
}
