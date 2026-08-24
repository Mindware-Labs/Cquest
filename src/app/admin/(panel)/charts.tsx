// Sólo el cálculo del tablero, del lado del servidor: los dibujos (<VolumeBars>, <CategoryDonut>) son componentes de cliente con interacción real, y mandarles el arreglo ya calculado evita enviar al navegador las fechas crudas de todos los artículos.

import type { VolumePoint } from "./VolumeBars";

// Arma la serie de <VolumeBars> como un acumulado (publicados ese mes y total hasta ese mes), por eso las barras suben y nunca bajan.

const MONTH_SHORT = new Intl.DateTimeFormat("es-DO", { month: "short" });
const MONTH_LONG = new Intl.DateTimeFormat("es-DO", { month: "long", year: "numeric" });

export function buildVolumeSeries(dates: Date[], now: Date, months = 12): VolumePoint[] {
  if (dates.length === 0) return [];

  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  // Lo publicado antes de la ventana no se descarta: se arrastra como piso del acumulado, si no el gráfico arrancaría en cero.
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

  // El acumulado se calcula después de contar: recorrer los meses en orden lo hace correcto aunque las fechas lleguen desordenadas.
  return [...buckets.values()].map((bucket) => {
    running += bucket.added;
    return { ...bucket, total: running };
  });
}
