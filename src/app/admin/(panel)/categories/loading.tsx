import { LoadingAnnouncement, SkeletonLine, SkeletonPageHeader } from "@/components/admin/ui/Skeleton";

export default function AdminCategoriesLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando las categorías</LoadingAnnouncement>
      <SkeletonPageHeader withAction={false} />

      {/* Espeja la grilla real de tarjetas, no una lista: si el esqueleto
          dibuja filas y llegan tarjetas, la página se rearma entera a la vista. */}
      <div className="cq-section" data-boxed="true">
        <div className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="cq-card">
              <SkeletonLine width="60%" height="0.95rem" />
              <SkeletonLine width="40%" height="0.75rem" className="mt-2" />
              <SkeletonLine width="3.5rem" height="2rem" className="mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
