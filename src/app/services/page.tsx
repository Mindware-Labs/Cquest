import { redirect } from "next/navigation";

// The services experience lives on the landing page. Anyone who reaches
// /services directly (old links, bookmarks, back navigation) is sent to that
// section instead of a stranded standalone copy.
export default function ServicesPage() {
  redirect("/#services");
}
