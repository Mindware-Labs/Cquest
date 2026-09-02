import { ListSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return <ListSkeleton titleWidth="10rem" filters={4} tabs={6} columns={6} />;
}
