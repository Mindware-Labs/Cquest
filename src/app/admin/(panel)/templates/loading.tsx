import { Panel } from "@/components/admin/ui/Surface";
import {
  LoadingAnnouncement,
  SkeletonLine,
  SkeletonPageHeader,
  SkeletonPanelHead,
  SkeletonRows,
} from "@/components/admin/ui/Skeleton";

/* Las plantillas base se dibujan como tarjetas en grilla y las del equipo como
   filas, porque así se ven cuando llegan. Un esqueleto que usa una sola forma
   para dos listas distintas promete algo que después no aparece. */
export default function AdminTemplatesLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando las plantillas</LoadingAnnouncement>
      <SkeletonPageHeader />

      <div className="grid gap-5">
        <Panel>
          <SkeletonPanelHead />
          <ul className="grid gap-4 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <li key={index} className="cq-panel p-3">
                <SkeletonLine height="5.5rem" className="rounded-[8px]" />
                <SkeletonLine width="72%" height="0.9rem" className="mt-3" />
                <SkeletonLine width="54%" height="0.76rem" className="mt-2" />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <SkeletonPanelHead />
          <SkeletonRows count={3} />
        </Panel>
      </div>
    </div>
  );
}
