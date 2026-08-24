"use client";

import { useState } from "react";

// Dona (no torta) por categoría: el agujero central muestra el total, y al apuntar/fijar una porción muestra su detalle ahí mismo (no en un tooltip flotante, que taparía lo que se compara y no funciona con teclado).
// Sin librería (recharts pesa ~100kB y trae su propio sistema de color): el estado es sólo un índice.
// El dibujo es `aria-hidden`; al lado hay una tabla real oculta con los mismos números, y la leyenda son botones tabulables, para que sea accesible.

const SERIES = [
  "var(--p-series-1)",
  "var(--p-series-2)",
  "var(--p-series-3)",
  "var(--p-series-4)",
  "var(--p-series-5)",
];

const PERCENT = new Intl.NumberFormat("es-DO", { style: "percent", maximumFractionDigits: 1 });

export type Slice = { name: string; count: number };

// Cinco porciones y el resto en "Otras": pasadas cinco, las últimas quedan tan finas que no se distinguen ni se les puede apuntar.
const MAX_SLICES = 5;

export function CategoryDonut({ data }: { data: Slice[] }) {
  // Dos estados y no uno: fusionar hovered y pinned haría que retirar el mouse borre la selección fijada.
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const withValues = data.filter((slice) => slice.count > 0);
  const total = withValues.reduce((sum, slice) => sum + slice.count, 0);

  if (total === 0) {
    return (
      <div className="cq-ghost px-4 py-10 text-center">
        <p className="cq-body text-[var(--p-ink)]">Ninguna categoría tiene artículos</p>
        <p className="cq-meta mt-1">El reparto aparece cuando se publique el primero.</p>
      </div>
    );
  }

  const sorted = [...withValues].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const restTotal = rest.reduce((sum, slice) => sum + slice.count, 0);

  const slices = [
    ...top.map((slice, index) => ({ ...slice, color: SERIES[index] })),
    ...(restTotal > 0
      ? [{ name: `Otras (${rest.length})`, count: restTotal, color: "var(--p-series-rest)" }]
      : []),
  ];

  // Un círculo por porción con `stroke-dasharray`, no arcos calculados a mano: el navegador resuelve la curva.
  const radius = 15.9155; // circunferencia = 100, así el dasharray es el %
  let offset = 25; // arranca arriba, a las 12, no a las 3

  const arcs = slices.map((slice) => {
    const percent = (slice.count / total) * 100;
    const arc = { ...slice, percent, dash: `${percent} ${100 - percent}`, offset };
    offset -= percent;
    return arc;
  });

  // Lo apuntado gana sobre lo fijado: recorrer otras porciones las muestra; al soltar, vuelve la fija.
  const active = hovered ?? pinned;
  const shown = active === null ? null : arcs[active];

  function toggle(index: number) {
    setPinned((current) => (current === index ? null : index));
  }

  return (
    // La tarjeta mide lo mismo que la de volumen por la grilla, así que se centra en ese alto en vez de quedar con un hueco abajo.
    <div
      className="flex flex-1 flex-col justify-center pb-5"
      onPointerLeave={() => setHovered(null)}
      // Escape suelta la selección fijada sin obligar a acertarle otra vez a la porción.
      onKeyDown={(event) => {
        if (event.key === "Escape" && pinned !== null) setPinned(null);
      }}
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative shrink-0">
          {/* 10rem para empatar la altura del gráfico de barras: una dona chica al lado se leería como dato secundario. */}
          <svg aria-hidden="true" viewBox="0 0 40 40" className="size-[10rem] overflow-visible">
            {arcs.map((arc, index) => {
              const isActive = active === index;
              const isDimmed = active !== null && !isActive;

              return (
                <circle
                  key={arc.name}
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  // La porción activa engorda en vez de cambiar de color: el color es la identidad de la categoría en la leyenda.
                  strokeWidth={isActive ? 8.6 : 7}
                  strokeDasharray={arc.dash}
                  strokeDashoffset={arc.offset}
                  opacity={isDimmed ? 0.28 : 1}
                  className="cursor-pointer transition-[opacity,stroke-width] duration-[var(--p-t-micro)]"
                  onPointerEnter={() => setHovered(index)}
                  onClick={() => toggle(index)}
                />
              );
            })}
          </svg>

          {/* El agujero usa siempre la misma caja (total o detalle) para que nada se mueva al recorrer. */}
          <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
            <span className="cq-display block leading-none">{shown ? shown.count : total}</span>
            <span className="cq-meta mt-1 block max-w-[6.5rem] truncate">
              {shown ? PERCENT.format(shown.count / total) : "en total"}
            </span>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-1">
          {arcs.map((arc, index) => {
            const isActive = active === index;
            const isPinned = pinned === index;

            return (
              <li key={arc.name}>
                <button
                  type="button"
                  // Botón (no fila muerta): la leyenda recorre el gráfico sin mouse; aria-pressed anuncia la fijación a un lector.
                  aria-pressed={isPinned}
                  aria-label={`${arc.name}: ${arc.count} ${
                    arc.count === 1 ? "artículo" : "artículos"
                  }, ${PERCENT.format(arc.count / total)} del total`}
                  onPointerEnter={() => setHovered(index)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  onClick={() => toggle(index)}
                  data-active={isActive ? "true" : undefined}
                  className="cq-legend-row"
                >
                  {/* La muestra de color va pegada al nombre: sin ella la leyenda obliga a comparar por posición. */}
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-[var(--p-radius-xs)] transition-transform duration-[var(--p-t-micro)]"
                    style={{
                      background: arc.color,
                      transform: isActive ? "scale(1.15)" : undefined,
                    }}
                  />
                  <span className="cq-body min-w-0 flex-1 truncate text-left text-[var(--p-ink)]">
                    {arc.name}
                  </span>
                  <span className="cq-ident shrink-0">{arc.count}</span>
                  {/* El porcentaje además del valor: "cuántos" y "qué parte del total" son preguntas distintas. */}
                  <span className="cq-ident w-12 shrink-0 text-right text-[var(--p-line-strong)]">
                    {PERCENT.format(arc.count / total)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <table className="sr-only">
        <caption>Artículos por categoría</caption>
        <thead>
          <tr>
            <th scope="col">Categoría</th>
            <th scope="col">Artículos</th>
            <th scope="col">Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {arcs.map((arc) => (
            <tr key={arc.name}>
              <th scope="row">{arc.name}</th>
              <td>{arc.count}</td>
              <td>{PERCENT.format(arc.count / total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
