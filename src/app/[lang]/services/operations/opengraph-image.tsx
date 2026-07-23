import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";
import { resolveLang } from "@/i18n/resolveLangParam";
import type { Locale } from "@/i18n/config";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Operations (BPO)";

const OG: Record<Locale, { title: string; subtitle: string }> = {
  en: { title: "Operations (BPO)", subtitle: "Repeatable work, run accurately at volume." },
  es: { title: "Operaciones (BPO)", subtitle: "Trabajo repetible, ejecutado con precisión a gran volumen." },
};

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return renderOgImage(OG[lang].title, OG[lang].subtitle);
}
