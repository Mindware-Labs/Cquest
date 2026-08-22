"use client";

import { useState } from "react";

/* Volumen publicado, en barras que suben.

   Es un ACUMULADO, no un conteo por mes: cada barra dice cuántos artículos
   había en total hasta ese mes. Por eso nunca baja, y por eso la forma se lee
   sola — una escalera pareja es ritmo sostenido, un escalón alto es una tanda,
   un tramo plano es que se dejó de publicar.

   Es cliente y no servidor porque acá sí hay interacción real: apuntar una
   barra dice de qué mes es, cuánto había acumulado y cuántos se sumaron ese
   mes. Ese tercer dato es el que un acumulado esconde, y es justamente el que
   interesa. Sin librería: el estado es un índice.

   Accesible con teclado: cada barra es un <button> de la misma tabla de datos,
   así que se recorre con tabulación y el detalle aparece al enfocar, no sólo al
   pasar el mouse. */

export type VolumePoint = {
  key: string;
  /* Etiqueta corta para el eje: "feb". */
  label: string;
  /* Etiqueta larga para el detalle: "febrero 2026". */
  full: string;
  /* Cuántos se publicaron ESE mes. */
  added: number;
  /* Cuántos había en total hasta ese mes, inclusive. */
  total: number;
};

export function VolumeBars({ data }: { data: VolumePoint[] }) {
  const [active, setActive] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="cq-ghost px-4 py-10 text-center">
        <p className="cq-body text-[var(--p-ink)]">Todavía no hay volumen que mostrar</p>
        <p className="cq-meta mt-1">Las barras aparecen con el primer artículo publicado.</p>
      </div>
    );
  }

  const peak = data[data.length - 1].total;
  const shown = active === null ? data[data.length - 1] : data[active];
  const isLive = active === null;

  return (
    /* Mismo `flex-1` que la dona: las dos tarjetas miden igual por la grilla, y
       así las dos reparten ese alto de la misma forma en vez de que una llene y
       la otra deje un hueco. */
    <div className="flex flex-1 flex-col justify-center pb-4">
      {/* La cabecera cambia con la barra apuntada. En reposo muestra el último
          mes, que es el estado que importa; al apuntar, el mes apuntado. Es la
          misma caja, así que nada se mueve de lugar al recorrer el gráfico. */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="cq-display">{shown.total}</span>
        <span className="cq-meta">
          {isLive ? "artículos publicados en total" : `acumulado a ${shown.full}`}
        </span>
        {!isLive && shown.added > 0 && (
          <span className="cq-delta" data-trend="up">
            +{shown.added}
            <span className="sr-only"> publicados ese mes</span>
          </span>
        )}
      </div>

      <div
        className="mt-4 flex h-32 items-end gap-[3px]"
        onPointerLeave={() => setActive(null)}
      >
        {data.map((point, index) => {
          const height = peak > 0 ? (point.total / peak) * 100 : 0;
          const isActive = active === index;

          return (
            <button
              key={point.key}
              type="button"
              /* Un botón por barra: se recorre con tabulación y el detalle sale
                 al enfocar. Un gráfico donde el dato sólo aparece al pasar el
                 mouse no existe para quien navega con teclado. */
              aria-label={`${point.full}: ${point.total} acumulados, ${point.added} publicados ese mes`}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              className="group flex h-full min-w-0 flex-1 cursor-default flex-col justify-end rounded-t-[var(--p-radius-xs)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
            >
              <span
                className="w-full rounded-t-[var(--p-radius-xs)] transition-[background-color,opacity] duration-[var(--p-t-micro)]"
                style={{
                  /* Mínimo de 3px para que un mes sin publicaciones siga
                     teniendo presencia: sin eso el eje se interrumpe y parece
                     que faltara el mes, no que fuera cero. */
                  height: `max(3px, ${height.toFixed(1)}%)`,
                  background: "var(--p-accent)",
                  /* Al apuntar una, las demás se atenúan en vez de que la
                     apuntada se oscurezca. Resalta sin cambiar el color del
                     dato, que es lo que hay que poder comparar. */
                  opacity: active === null || isActive ? 1 : 0.35,
                }}
              />
            </button>
          );
        })}
      </div>

      <div aria-hidden="true" className="mt-2 flex gap-[3px] border-t border-[var(--p-line)] pt-2">
        {data.map((point, index) => (
          <span
            key={point.key}
            className="cq-ident min-w-0 flex-1 truncate text-center transition-colors duration-[var(--p-t-micro)]"
            style={{
              color: active === index ? "var(--p-ink)" : undefined,
            }}
          >
            {point.label}
          </span>
        ))}
      </div>

      {/* El dato real, para quien no ve el dibujo. */}
      <table className="sr-only">
        <caption>Volumen acumulado de artículos publicados por mes</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col">Publicados ese mes</th>
            <th scope="col">Acumulado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.key}>
              <th scope="row">{point.full}</th>
              <td>{point.added}</td>
              <td>{point.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
