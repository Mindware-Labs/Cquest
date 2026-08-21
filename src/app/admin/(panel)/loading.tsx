import { Panel } from "@/components/admin/ui/Surface";
import {
  LoadingAnnouncement,
  SkeletonLine,
  SkeletonPageHeader,
  SkeletonPanelHead,
  SkeletonRows,
  SkeletonStatCard,
} from "@/components/admin/ui/Skeleton";

/* Espejo de page.tsx: cuatro cifras arriba, dos paneles a la izquierda y el de
   categorías al costado. Mismas columnas y mismos huecos, para que la llegada de
   los datos no reacomode la grilla. */
export default function AdminHomeLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando el inicio del panel</LoadingAnnouncement>
      <SkeletonPageHeader />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="grid gap-5">
          <Panel>
            <SkeletonPanelHead />
            <SkeletonRows count={4} />
          </Panel>
          <Panel>
            <SkeletonPanelHead />
            <SkeletonRows count={3} />
          </Panel>
        </div>

        <div className="grid content-start gap-5">
          <Panel>
            <SkeletonPanelHead />
            <div className="grid gap-3.5 px-5 py-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index}>
                  <div className="flex items-baseline justify-between gap-3">
                    <SkeletonLine width="6rem" height="0.88rem" />
                    <SkeletonLine width="1.25rem" height="0.82rem" />
                  </div>
                  <SkeletonLine height="0.4rem" className="mt-2 rounded-full" />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
