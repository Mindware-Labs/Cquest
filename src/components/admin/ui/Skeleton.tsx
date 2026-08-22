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

/* Espeja PageHeader: sin título ni bajada visibles, sólo el botón de acción. Un
   esqueleto que dibuja piezas que no van a existir hace saltar el contenido
   cuando llega. */
export function SkeletonPageHeader({ withAction = true }: { withAction?: boolean }) {
  return (
    <header className="flex flex-wrap items-center justify-end gap-2 pb-4">
      {withAction && <SkeletonLine width="8.5rem" height="2rem" className="rounded-[4px]" />}
    </header>
  );
}

/* Espeja una tarjeta de grilla con su miniatura de estructura. */
export function SkeletonCard() {
  return (
    <div className="cq-card">
      <SkeletonLine width="100%" height="4.75rem" className="rounded-[6px]" />
      <SkeletonLine width="70%" height="0.85rem" className="mt-3" />
      <SkeletonLine width="45%" height="0.7rem" className="mt-1.5" />
    </div>
  );
}

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
