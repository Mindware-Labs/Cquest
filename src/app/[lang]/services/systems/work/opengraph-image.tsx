import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";
import { resolveLang } from "@/i18n/resolveLangParam";
import type { Locale } from "@/i18n/config";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Contact-center operations platform, case study";

const OG: Record<Locale, { title: string; subtitle: string }> = {
  en: {
    title: "Contact-center operations platform",
    subtitle: "Case study — a custom platform running a full contact-center operation.",
  },
  es: {
    title: "Plataforma de contact center",
    subtitle: "Caso de éxito — una plataforma a la medida que gestiona toda una operación de contact center.",
  },
};

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return renderOgImage(OG[lang].title, OG[lang].subtitle);
}
