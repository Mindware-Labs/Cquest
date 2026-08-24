import type { CSSProperties } from "react";
import clsx from "clsx";

// Cada esqueleto copia la caja exacta (altura/relleno) de su equivalente real en Surface.tsx: si no coincide, la página salta al llegar los datos.

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

// El ancho del título varía por índice a propósito: filas idénticas se leen como fondo, no como contenido por llegar.
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

// `SkeletonRows` (filas de 36px sin encabezado) no encaja con la tabla real (~52px con thead); es un `<div>` y no `<table>` porque no hay datos que anunciar.
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

// El `<h1>` es `sr-only` (la miga ya nombra el módulo), así que no se reserva espacio para un título que no llega. El radio es el de un CONTROL, no un valor fijo, para no dibujar esquinas más duras que el botón real.
export function SkeletonPageHeader({ withAction = true }: { withAction?: boolean }) {
  // Sin acción no hay franja, igual que en `ModulePage`: reservar espacio acá dejaba un hueco que al cargar se cerraba de golpe.
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

// El esqueleto es puramente visual (de ahí los `aria-hidden` de arriba); la carga se anuncia una sola vez acá en vez de que el lector de pantalla recorra veinte cajas vacías.
export function LoadingAnnouncement({ children = "Cargando" }: { children?: string }) {
  return (
    <p role="status" className="sr-only">
      {children}
    </p>
  );
}
