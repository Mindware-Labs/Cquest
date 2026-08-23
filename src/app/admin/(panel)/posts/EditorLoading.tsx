import { LoadingAnnouncement, SkeletonLine } from "@/components/admin/ui/Skeleton";

/* Las dos rutas del editor —crear y editar— no tenían `loading.tsx`. La de
   edición corre tres consultas en paralelo antes de pintar nada, así que al
   entrar desde la tabla la pantalla se quedaba con el artículo anterior hasta
   que llegaba el nuevo: ninguna señal de que algo estaba pasando, en la
   transición más lenta del panel.

   Es un archivo compartido y no dos copias porque el editor es el mismo en
   ambas rutas; lo único que cambia es qué se está esperando.

   Espeja la anatomía real: barra pegada con salida, título y los dos botones de
   guardado; la sección de datos en dos columnas; y el lienzo con su riel de
   propiedades a la derecha en pantalla ancha. */
export default function EditorLoading({ title }: { title: string }) {
  return (
    <div>
      <LoadingAnnouncement>{title}</LoadingAnnouncement>

      <div className="-mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--p-line)] px-4 py-2.5 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <SkeletonLine
            width="var(--p-control-h)"
            height="var(--p-control-h)"
            className="rounded-[var(--p-radius-sm)]"
          />
          <SkeletonLine width="8rem" height="0.95rem" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonLine
            width="8.5rem"
            height="var(--p-control-h)"
            className="rounded-[var(--p-radius-sm)]"
          />
          <SkeletonLine
            width="5.5rem"
            height="var(--p-control-h)"
            className="rounded-[var(--p-radius-sm)]"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <SkeletonLine width="5rem" height="0.7rem" />
            <SkeletonLine
              width="100%"
              height="var(--p-control-h)"
              className="mt-2 rounded-[var(--p-radius-sm)]"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_19rem]">
        <div className="grid gap-3">
          {["6rem", "4.5rem", "9rem", "5rem"].map((height, index) => (
            <SkeletonLine
              key={index}
              width="100%"
              height={height}
              className="rounded-[var(--p-radius-md)]"
            />
          ))}
        </div>
        <SkeletonLine
          width="100%"
          height="16rem"
          className="hidden rounded-[var(--p-radius-md)] lg:block"
        />
      </div>
    </div>
  );
}
