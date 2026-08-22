import {
  LoadingAnnouncement,
  SkeletonLine,
  SkeletonPageHeader,
  SkeletonRows,
  SkeletonStatCard,
} from "@/components/admin/ui/Skeleton";

/* Espeja la forma real del tablero: cuatro columnas de cifra arriba, dos
   secciones a la izquierda y una al costado. Cuando llegan los datos, nada se
   mueve de lugar. */
export default function AdminHomeLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando el tablero</LoadingAnnouncement>
      <SkeletonPageHeader />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonStatCard key={index} />
        ))}
      </div>

      {/* Espeja la grilla real: volumen ancho con el reparto al costado, los dos
          en caja cerrada, y debajo las dos listas en dos columnas. */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="cq-section" data-boxed="true">
          <div className="cq-section-head">
            <SkeletonLine width="7rem" height="0.7rem" />
          </div>
          <div className="pb-5">
            <SkeletonLine width="9rem" height="2rem" />
            <SkeletonLine width="100%" height="8rem" className="mt-4 rounded-[4px]" />
          </div>
        </div>
        <div className="cq-section" data-boxed="true">
          <div className="cq-section-head">
            <SkeletonLine width="6rem" height="0.7rem" />
          </div>
          <div className="flex items-center gap-5 pb-5">
            <SkeletonLine width="7rem" height="7rem" className="shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine width="100%" height="0.8rem" />
              <SkeletonLine width="85%" height="0.8rem" />
              <SkeletonLine width="70%" height="0.8rem" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="cq-section" data-boxed="true">
          <div className="cq-section-head">
            <SkeletonLine width="6rem" height="0.7rem" />
          </div>
          <SkeletonRows count={6} />
        </div>
        <div className="cq-section" data-boxed="true">
          <div className="cq-section-head">
            <SkeletonLine width="7rem" height="0.7rem" />
          </div>
          <SkeletonRows count={6} />
        </div>
      </div>
    </div>
  );
}
