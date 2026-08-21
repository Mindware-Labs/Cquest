import { Panel } from "@/components/admin/ui/Surface";
import {
  LoadingAnnouncement,
  SkeletonLine,
  SkeletonPageHeader,
  SkeletonPanelHead,
  SkeletonRows,
} from "@/components/admin/ui/Skeleton";

/* Dos columnas, igual que la página: la lista a la izquierda y el alta al
   costado. El formulario de alta no se esqueletiza campo por campo —es una caja
   corta y fija—, alcanza con reservar su altura. */
export default function AdminCategoriesLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando las categorías</LoadingAnnouncement>
      <SkeletonPageHeader withAction={false} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Panel>
          <SkeletonPanelHead />
          <SkeletonRows count={5} />
        </Panel>

        <Panel>
          <SkeletonPanelHead />
          <div className="px-5 py-4">
            <SkeletonLine width="4rem" height="0.72rem" />
            <SkeletonLine height="2.65rem" className="mt-2 rounded-[8px]" />
            <SkeletonLine height="2.3rem" className="mt-4 rounded-[8px]" />
          </div>
          <div className="border-t border-border px-5 py-3">
            <SkeletonLine width="80%" height="0.8rem" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
