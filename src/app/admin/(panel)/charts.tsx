/* Gráficos del tablero.

   SVG propio y renderizado en el servidor. `recharts` pesa ~100 kB comprimido,
   se envía al cliente, exige "use client" en cualquier pantalla que lo use y
   trae su propio sistema de color y tipografía que habría que envolver para que
   respete los tokens. Esto son doscientas líneas, no manda un byte de
   JavaScript y lee las variables directo.

   Regla que cumplen los dos: el dibujo va `aria-hidden` y al lado siempre hay
   una tabla real, oculta a la vista, con los mismos números. Un gráfico que
   sólo existe como dibujo no se puede leer con un lector de pantalla ni copiar
   a una planilla. */

const SERIES = [
  "var(--p-series-1)",
  "var(--p-series-2)",
  "var(--p-series-3)",
  "var(--p-series-4)",
  "var(--p-series-5)",
];

const PERCENT = new Intl.NumberFormat("es-DO", { style: "percent", maximumFractionDigits: 1 });

import type { VolumePoint } from "./VolumeBars";

/* ===========================================================================
   SERIE DE VOLUMEN
   ===========================================================================
   Arma los datos que dibuja <VolumeBars>. Es una función pura y vive del lado
   del servidor: el componente que la pinta es de cliente, y mandarle el arreglo
   ya calculado evita enviar las fechas crudas de todos los artículos al
   navegador para recalcular ahí lo mismo.

   Devuelve un ACUMULADO: cada mes lleva cuántos se publicaron ese mes y cuántos
   había en total hasta ese mes. Por eso las barras suben y nunca bajan. */

const MONTH_SHORT = new Intl.DateTimeFormat("es-DO", { month: "short" });
const MONTH_LONG = new Intl.DateTimeFormat("es-DO", { month: "long", year: "numeric" });

export function buildVolumeSeries(dates: Date[], now: Date, months = 12): VolumePoint[] {
  if (dates.length === 0) return [];

  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  /* Lo publicado ANTES de la ventana no se descarta: se arrastra como piso del
     acumulado. Si se ignorara, un archivo de 200 artículos con un año flojo
     arrancaría el gráfico en cero y diría que no existe nada anterior. */
  let running = dates.filter((date) => date < start).length;

  const buckets = new Map<string, VolumePoint>();

  for (let index = 0; index < months; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    buckets.set(`${date.getFullYear()}-${date.getMonth()}`, {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: MONTH_SHORT.format(date).replace(".", ""),
      full: MONTH_LONG.format(date),
      added: 0,
      total: 0,
    });
  }

  for (const date of dates) {
    const bucket = buckets.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (bucket) bucket.added += 1;
  }

  /* El acumulado se calcula recién acá, después de contar: recorrer los meses en
     orden y sumar es lo que hace que la escalera sea correcta aunque las fechas
     hayan llegado desordenadas. */
  return [...buckets.values()].map((bucket) => {
    running += bucket.added;
    return { ...bucket, total: running };
  });
}

/* ===========================================================================
   DONA POR CATEGORÍA
   ===========================================================================
   Dona y no torta: el agujero del centro no es estético, es donde va el total.
   Y el total es el dato que una torta nunca da — sin él hay porcentajes sin
   referencia.

   Se muestran cinco categorías como máximo y el resto se agrupa en "Otras". No
   es un límite arbitrario: pasadas cinco porciones, las últimas quedan tan
   finas que no se distinguen entre sí ni se les puede apuntar. */

export type Slice = { name: string; count: number };

const MAX_SLICES = 5;

export function CategoryDonut({ data }: { data: Slice[] }) {
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

  return (
    /* `justify-center` y `flex-1`: la tarjeta mide lo mismo que la de volumen
       por la grilla, así que el contenido se centra en ese alto en vez de
       quedar pegado arriba con un hueco abajo. */
    <div className="flex flex-1 flex-col justify-center pb-5">
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative shrink-0">
          {/* 10rem para empatar la altura del gráfico de barras (8rem de barras
              más su cifra y su eje). Una dona chica al lado de un gráfico alto
              se lee como el dato secundario, y el reparto por categoría no lo
              es: responde una pregunta distinta, no una menos importante.

              El trazo sube de 6 a 7 con el radio: manteniéndolo en 6, la dona
              grande queda como un anillo fino y las porciones chicas se vuelven
              hilos imposibles de distinguir. */}
          <svg aria-hidden="true" viewBox="0 0 40 40" className="size-[10rem]">
            {arcs.map((arc) => (
              <circle
                key={arc.name}
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth="7"
                strokeDasharray={arc.dash}
                strokeDashoffset={arc.offset}
              />
            ))}
          </svg>

          {/* El total, en el agujero. Es la razón de que sea dona. */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="cq-display leading-none">{total}</span>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-2">
          {arcs.map((arc) => (
            <li key={arc.name} className="flex items-center gap-2">
              {/* La muestra de color es cuadrada y va pegada al nombre. Sin ella
                  la leyenda obliga a comparar porciones por posición. */}
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-[var(--p-radius-xs)]"
                style={{ background: arc.color }}
              />
              <span className="cq-body min-w-0 flex-1 truncate text-[var(--p-ink)]">
                {arc.name}
              </span>
              <span className="cq-ident shrink-0">{arc.count}</span>
              {/* El porcentaje además del valor: uno responde "cuántos" y el
                  otro "qué parte del total", y son preguntas distintas. */}
              <span className="cq-ident w-12 shrink-0 text-right text-[var(--p-line-strong)]">
                {PERCENT.format(arc.count / total)}
              </span>
            </li>
          ))}
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
