import { redirect } from "next/navigation";
import { resolveLang } from "@/i18n/resolveLangParam";

// The services experience lives on the landing page. Anyone who reaches
// /services directly (old links, bookmarks, back navigation) is sent to that
// section instead of a stranded standalone copy.
export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  redirect(`/${lang}#services`);
}
