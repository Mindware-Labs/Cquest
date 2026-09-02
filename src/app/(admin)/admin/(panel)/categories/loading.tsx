import { ListSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return <ListSkeleton title="compact" titleWidth="8rem" columns={3} rows={6} />;
}
