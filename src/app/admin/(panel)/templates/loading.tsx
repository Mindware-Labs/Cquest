import {
  LoadingAnnouncement,
  SkeletonCard,
  SkeletonPageHeader,
  SkeletonRows,
  SkeletonSectionHead,
} from "@/components/admin/ui/Skeleton";

export default function AdminTemplatesLoading() {
  return (
    <div>
      <LoadingAnnouncement>Cargando las plantillas</LoadingAnnouncement>
      <SkeletonPageHeader />

      <div className="grid gap-8">
        <div>
          <SkeletonSectionHead />
          <div className="grid gap-3 pb-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
        <div>
          <SkeletonSectionHead />
          <SkeletonRows count={3} />
        </div>
      </div>
    </div>
  );
}
