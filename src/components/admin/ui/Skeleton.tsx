import type { CSSProperties } from "react";
import clsx from "clsx";

/* Esqueletos de carga del panel.

   La regla que gobierna todo este archivo: un esqueleto tiene que tener la MISMA
   caja que el contenido que reemplaza. Si la fila real mide 64px y el esqueleto
   58px, al llegar los datos la página salta — y ese salto es peor que no haber
   mostrado nada, porque llega justo cuando el ojo ya se apoyó en algo.

   Por eso cada pieza de acá abajo copia el padding y las alturas de su
   equivalente en Surface.tsx, y por eso ninguna inventa una forma propia. */

export function SkeletonLine({
  width = "100%",
  height = "0.85rem",
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

/* Espeja .cq-stat: placa de icono, etiqueta, cifra, pista. */
export function SkeletonStatCard() {
  return (
    <div className="cq-panel p-[1.1rem]">
      <SkeletonLine width="2.25rem" height="2.25rem" className="rounded-[8px]" />
      <SkeletonLine width="4.5rem" height="0.8rem" className="mt-3.5" />
      <SkeletonLine width="3rem" height="1.7rem" className="mt-2" />
      <SkeletonLine width="7.5rem" height="0.76rem" className="mt-2" />
    </div>
  );
}

/* Espeja la fila de lista: título arriba, metadato abajo, acción a la derecha.
   El ancho del título varía por índice a propósito — un bloque de filas idénticas
   se lee como un patrón de fondo, no como contenido que está por llegar. */
export function SkeletonRow({ index = 0 }: { index?: number }) {
  const widths = ["68%", "52%", "77%", "45%", "61%"];

  return (
    <li className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0">
      <span className="min-w-0 flex-1">
        <SkeletonLine width={widths[index % widths.length]} height="0.92rem" />
        <SkeletonLine width="9rem" height="0.78rem" className="mt-2" />
      </span>
      <SkeletonLine width="4.5rem" height="1.5rem" className="shrink-0 rounded-full" />
      <SkeletonLine width="5.5rem" height="1.85rem" className="shrink-0 rounded-[8px]" />
    </li>
  );
}

export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <ul>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonRow key={index} index={index} />
      ))}
    </ul>
  );
}

/* Espeja .cq-panel-head: una barra de título con su contador. */
export function SkeletonPanelHead() {
  return (
    <div className="cq-panel-head flex items-center justify-between gap-3 px-5 py-3">
      <SkeletonLine width="7rem" height="0.72rem" />
      <SkeletonLine width="1.75rem" height="1.1rem" className="rounded-[6px]" />
    </div>
  );
}

/* Espeja PageHeader. El título va con la altura real del h1 para que la primera
   línea de la página no se mueva ni un píxel cuando entra el contenido. */
export function SkeletonPageHeader({ withAction = true }: { withAction?: boolean }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 pb-7">
      <div className="min-w-0 flex-1">
        <SkeletonLine width="9rem" height="1.75rem" className="rounded-[8px]" />
        <SkeletonLine width="min(52ch, 100%)" height="0.92rem" className="mt-3" />
        <SkeletonLine width="min(34ch, 90%)" height="0.92rem" className="mt-2" />
      </div>
      {withAction && <SkeletonLine width="9.5rem" height="2.3rem" className="rounded-[8px]" />}
    </header>
  );
}

/* El aviso para lectores de pantalla. El esqueleto es puramente visual —de ahí
   los `aria-hidden` de arriba—, así que la carga se anuncia una sola vez acá en
   lugar de que un lector recorra veinte cajas vacías. */
export function LoadingAnnouncement({ children = "Cargando" }: { children?: string }) {
  return (
    <p role="status" className="sr-only">
      {children}
    </p>
  );
}
