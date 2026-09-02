import { ListSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return <ListSkeleton titleWidth="8.5rem" filters={2} tabs={5} columns={5} thumb />;
}
