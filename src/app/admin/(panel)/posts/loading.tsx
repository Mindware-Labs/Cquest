import { Panel } from "@/components/admin/ui/Surface";
import {
  LoadingAnnouncement,
  SkeletonLine,
  SkeletonPageHeader,
  SkeletonRows,
} from "@/components/admin/ui/Skeleton";

/* La barra de filtros se dibuja con las cuatro pastillas que van a aparecer.
   Es la parte de la pantalla que llega antes en la percepción del que opera —
   sabe que hay filtros incluso antes de poder usarlos. */
export default function AdminPostsLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando los artículos</LoadingAnnouncement>
      <SkeletonPageHeader />

      <Panel>
        <div className="cq-panel-head flex flex-wrap items-center gap-2 px-3 py-2.5">
          <SkeletonLine width="4.5rem" height="1.85rem" className="rounded-[8px]" />
          <SkeletonLine width="6.5rem" height="1.85rem" className="rounded-[8px]" />
          <SkeletonLine width="6rem" height="1.85rem" className="rounded-[8px]" />
          <SkeletonLine width="5.25rem" height="1.85rem" className="rounded-[8px]" />
        </div>
        <SkeletonRows count={6} />
      </Panel>
    </div>
  );
}
