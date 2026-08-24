/* Datos de los gráficos del tablero.

   Acá quedó sólo el cálculo. Los dos dibujos —<VolumeBars> y <CategoryDonut>—
   viven en sus propios archivos y son componentes de cliente: los dos tienen
   interacción real —apuntar una barra, resaltar una porción— y esto no.

   Que la aritmética viva aparte y del lado del servidor es lo que evita mandar
   al navegador las fechas crudas de todos los artículos para recalcular ahí lo
   mismo que ya se sabe al renderizar. */

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
