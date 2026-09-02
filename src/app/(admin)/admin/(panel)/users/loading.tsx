import { ListSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return <ListSkeleton title="compact" titleWidth="5rem" columns={4} rows={6} />;
}
