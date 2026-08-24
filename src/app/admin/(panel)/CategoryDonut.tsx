"use client";

import { useState } from "react";

/* Dona por categoría, interactiva.

   Dona y no torta: el agujero del centro no es estético, es donde va el total.
   Y el total es el dato que una torta nunca da — sin él hay porcentajes sin
   referencia.

   Es cliente porque acá hay interacción real, del mismo tipo que ofrece un
   tablero de BI y por las mismas razones:

   1. RESALTADO CRUZADO. Apuntar una porción atenúa las demás y marca su fila en
      la leyenda; apuntar la fila hace lo mismo con la porción. Las dos mitades
      del gráfico son el mismo dato mostrado de dos formas, así que tienen que
      responder juntas o el ojo tiene que emparejarlas a mano por color.

   2. EL CENTRO ES EL DETALLE. Al apuntar, el agujero deja de mostrar el total y
      muestra esa categoría: cuántos y qué parte. Ese es el "tooltip" — y va en
      el centro y no flotando junto al cursor a propósito: una caja que sigue al
      puntero tapa justo las porciones que uno está comparando, y con teclado no
      tiene dónde aparecer.

   3. SELECCIÓN QUE SE QUEDA. Un clic fija la porción y el detalle no se va al
      retirar el mouse, que es lo que hace falta para leer la cifra, mirar otra
      cosa y volver. Otro clic —o Escape— la suelta.

   Sin librería: el estado es un índice. `recharts` pesa ~100 kB comprimidos y
   trae su propio sistema de color y tipografía que habría que envolver para que
   respete los tokens; esto son doscientas líneas que leen las variables directo.

   Regla que no se negocia: el dibujo va `aria-hidden` y al lado hay una tabla
   real, oculta a la vista, con los mismos números. Un gráfico que sólo existe
   como dibujo no se puede leer con un lector de pantalla ni copiar a una
   planilla. La leyenda, además, son botones: se recorre con tabulación y el
   detalle aparece al enfocar, no sólo al pasar el mouse. */

const SERIES = [
  "var(--p-series-1)",
  "var(--p-series-2)",
  "var(--p-series-3)",
  "var(--p-series-4)",
  "var(--p-series-5)",
];

const PERCENT = new Intl.NumberFormat("es-DO", { style: "percent", maximumFractionDigits: 1 });

export type Slice = { name: string; count: number };

/* Cinco porciones y el resto agrupado en "Otras". No es un límite arbitrario:
   pasadas cinco, las últimas quedan tan finas que no se distinguen entre sí ni
   se les puede apuntar. */
const MAX_SLICES = 5;

export function CategoryDonut({ data }: { data: Slice[] }) {
  /* Dos estados y no uno: `hovered` es lo que se está apuntando y `pinned` lo
     que quedó fijado con un clic. Fusionarlos haría que retirar el mouse borre
     la selección, que es exactamente lo que la selección existe para evitar. */
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

  /* La dona se dibuja con UN círculo por porción y `stroke-dasharray`, no con
     arcos calculados a mano: el navegador resuelve la curva, no hay
     trigonometría que revisar, y el grosor sale del trazo. El desfase acumulado
     es lo que encadena una porción con la siguiente. */
  const radius = 15.9155; /* circunferencia = 100, así el dasharray es el % */
  let offset = 25; /* arranca arriba, a las 12, no a las 3 */

  const arcs = slices.map((slice) => {
    const percent = (slice.count / total) * 100;
    const arc = { ...slice, percent, dash: `${percent} ${100 - percent}`, offset };
    offset -= percent;
    return arc;
  });

  /* Lo apuntado gana sobre lo fijado: con una porción fija, recorrer las otras
     tiene que mostrar la que se recorre. Al soltar el puntero vuelve la fija. */
  const active = hovered ?? pinned;
  const shown = active === null ? null : arcs[active];

  function toggle(index: number) {
    setPinned((current) => (current === index ? null : index));
  }

  return (
    /* `justify-center` y `flex-1`: la tarjeta mide lo mismo que la de volumen
       por la grilla, así que el contenido se centra en ese alto en vez de
       quedar pegado arriba con un hueco abajo. */
    <div
      className="flex flex-1 flex-col justify-center pb-5"
      onPointerLeave={() => setHovered(null)}
      /* Escape suelta la selección. Es la salida que espera cualquiera que haya
         fijado algo sin querer, y no obliga a acertarle otra vez a la porción. */
      onKeyDown={(event) => {
        if (event.key === "Escape" && pinned !== null) setPinned(null);
      }}
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative shrink-0">
          {/* 10rem para empatar la altura del gráfico de barras (8rem de barras
              más su cifra y su eje). Una dona chica al lado de un gráfico alto
              se lee como el dato secundario, y el reparto por categoría no lo
              es: responde una pregunta distinta, no una menos importante. */}
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
                  /* La porción activa engorda en vez de cambiar de color: el
                     color ES la identidad de la categoría en la leyenda, y
                     alterarlo al resaltar rompe justamente el emparejamiento
                     que el resaltado existe para ayudar. */
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

          {/* El agujero: total en reposo, detalle de la porción al apuntarla.
              Misma caja siempre, así nada se mueve de lugar al recorrer. */}
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
                  /* Botón y no una fila muerta: la leyenda es el control con el
                     que se recorre el gráfico sin mouse. `aria-pressed` dice si
                     esta categoría quedó fijada — sin él, la selección existe
                     sólo como un cambio de fondo que un lector no anuncia. */
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
                  {/* La muestra de color va pegada al nombre. Sin ella la
                      leyenda obliga a comparar porciones por posición. */}
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
                  {/* El porcentaje además del valor: uno responde "cuántos" y
                      el otro "qué parte del total", y son preguntas distintas. */}
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
