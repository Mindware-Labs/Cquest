import {
  LoadingAnnouncement,
  SkeletonLine,
  SkeletonPageHeader,
  SkeletonTable,
} from "@/components/admin/ui/Skeleton";

export default function AdminPostsLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando los artículos</LoadingAnnouncement>
      {/* Con acción: "Nuevo artículo" ahora vive en el encabezado del módulo,
          igual que en los otros tres. Antes estaba dentro de la barra de la
          tabla y este esqueleto la dibujaba ahí. */}
      <SkeletonPageHeader />
      {/* Espeja la barra de herramientas: cuatro pestañas de filtro a la
          izquierda, campo de búsqueda y su botón a la derecha. Sin tarjeta
          alrededor, igual que la pantalla real. */}
      <div className="cq-table-toolbar">
        <div className="flex items-center gap-1">
          <SkeletonLine width="3.5rem" height="var(--p-control-h)" />
          <SkeletonLine width="5rem" height="var(--p-control-h)" />
          <SkeletonLine width="5rem" height="var(--p-control-h)" />
          <SkeletonLine width="4rem" height="var(--p-control-h)" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonLine
            width="9rem"
            height="var(--p-control-h)"
            className="rounded-[var(--p-radius-sm)]"
          />
          <SkeletonLine
            width="4.5rem"
            height="var(--p-control-h-sm)"
            className="rounded-[var(--p-radius-sm)]"
          />
        </div>
      </div>
      <SkeletonTable count={10} />
    </div>
  );
}
