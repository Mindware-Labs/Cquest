import { ListSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return <ListSkeleton titleWidth="11rem" filters={3} tabs={6} columns={6} />;
}
