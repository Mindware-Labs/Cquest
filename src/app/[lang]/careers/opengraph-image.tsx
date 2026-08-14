import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";
import { resolveLang } from "@/i18n/resolveLangParam";
import type { Locale } from "@/i18n/config";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Careers";

const OG: Record<Locale, { title: string; subtitle: string }> = {
  en: {
    title: "Your first job, or your next one",
    subtitle: "Open positions in Santo Domingo, with paid training.",
  },
  es: {
    title: "Tu primer empleo, o el siguiente",
    subtitle: "Vacantes abiertas en Santo Domingo, con capacitación pagada.",
  },
};

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return renderOgImage(OG[lang].title, OG[lang].subtitle);
}
