import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";
import { resolveLang } from "@/i18n/resolveLangParam";
import type { Locale } from "@/i18n/config";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Systems Development";

const OG: Record<Locale, { title: string; subtitle: string }> = {
  en: { title: "Systems Development", subtitle: "Custom systems for operations." },
  es: { title: "Desarrollo de Sistemas", subtitle: "Sistemas a la medida para operaciones." },
};

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return renderOgImage(OG[lang].title, OG[lang].subtitle);
}
