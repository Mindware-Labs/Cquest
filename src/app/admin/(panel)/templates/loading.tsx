import { LoadingAnnouncement, SkeletonLine } from "@/components/admin/ui/Skeleton";

/* Espeja `templates/page.tsx` caja por caja: la barra de herramientas y la
   grilla de tarjetas, con las MISMAS medidas.

   Sin `SkeletonPageHeader`: esta pantalla ancla su acción primaria dentro de la
   barra, así que no tiene franja de módulo. Reservar espacio para una franja que
   no va a llegar nunca es el mismo salto que el esqueleto existe para evitar,
   sólo que al revés.

   La lámina de cada tarjeta se reserva ENTERA —8.5rem, el alto de `.cq-thumb`—
   en vez de dibujarle barritas adentro. La miniatura real es una página de papel
   con filete y sombra; imitarla con barras de esqueleto reintroduciría
   exactamente la ambigüedad que la miniatura nueva vino a resolver. Acá el
   esqueleto es un bloque liso, y cuando llegan los datos aparece un documento. */

const NAME_WIDTHS = ["58%", "42%", "67%", "38%", "51%", "46%", "62%", "35%"];

export default function AdminTemplatesLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando las plantillas</LoadingAnnouncement>

      <div className="cq-table-toolbar">
        <div className="flex flex-wrap items-center gap-3">
          {["3.5rem", "6rem", "5.5rem"].map((width) => (
            <SkeletonLine key={width} width={width} height="var(--p-control-h)" />
          ))}
        </div>
        <SkeletonLine
          width="11rem"
          height="var(--p-control-h)"
          className="rounded-[var(--p-radius-sm)]"
        />
        <SkeletonLine
          width="8.5rem"
          height="var(--p-control-h)"
          className="rounded-[var(--p-radius-sm)]"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="cq-tcard">
            <SkeletonLine width="100%" height="10rem" className="rounded-none" />
            <div className="cq-tcard-body">
              <SkeletonLine width={NAME_WIDTHS[index % NAME_WIDTHS.length]} height="0.95rem" />
              <SkeletonLine width="70%" height="0.75rem" className="mt-1.5" />
              <div className="cq-tcard-foot">
                <SkeletonLine
                  width="4.5rem"
                  height="var(--p-control-h-sm)"
                  className="rounded-[var(--p-radius-sm)]"
                />
                <SkeletonLine
                  width="var(--p-control-h-sm)"
                  height="var(--p-control-h-sm)"
                  className="rounded-[var(--p-radius-sm)]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
