import {
  LoadingAnnouncement,
  SkeletonLine,
  SkeletonPageHeader,
  SkeletonRows,
} from "@/components/admin/ui/Skeleton";

export default function AdminPostsLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando los artículos</LoadingAnnouncement>
      <SkeletonPageHeader withAction={false} />
      {/* Espeja la barra de herramientas —filtros a la izquierda, búsqueda y
          acción a la derecha— y después las filas. Sin tarjeta alrededor,
          igual que la pantalla real. */}
      <div className="cq-table-toolbar">
        <div className="flex items-center gap-3">
          <SkeletonLine width="3.5rem" height="0.8rem" />
          <SkeletonLine width="4.5rem" height="0.8rem" />
          <SkeletonLine width="4.5rem" height="0.8rem" />
          <SkeletonLine width="3.5rem" height="0.8rem" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonLine width="9rem" height="2rem" className="rounded-[8px]" />
          <SkeletonLine width="8rem" height="2rem" className="rounded-[8px]" />
        </div>
      </div>
      <SkeletonRows count={10} />
    </div>
  );
}
