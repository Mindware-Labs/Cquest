import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";
import { resolveLang } from "@/i18n/resolveLangParam";
import type { Locale } from "@/i18n/config";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Call Center";

const OG: Record<Locale, { title: string; subtitle: string }> = {
  en: { title: "Call Center", subtitle: "Inbound and outbound contact-center operations across every channel." },
  es: { title: "Call Center", subtitle: "Operaciones de contact center inbound y outbound en todos los canales." },
};

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return renderOgImage(OG[lang].title, OG[lang].subtitle);
}
