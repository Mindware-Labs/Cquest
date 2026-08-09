import { redirect } from "next/navigation";
import { resolveLang } from "@/i18n/resolveLangParam";

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  redirect(`/${lang}#services`);
}
