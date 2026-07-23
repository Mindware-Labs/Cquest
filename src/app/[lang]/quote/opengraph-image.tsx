import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";
import { resolveLang } from "@/i18n/resolveLangParam";
import type { Locale } from "@/i18n/config";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Request a service quote";

const OG: Record<Locale, { title: string; subtitle: string }> = {
  en: { title: "Request your quote", subtitle: "Get a tailored proposal in under a minute." },
  es: { title: "Solicita tu cotización", subtitle: "Recibe una propuesta a tu medida en menos de un minuto." },
};

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return renderOgImage(OG[lang].title, OG[lang].subtitle);
}
