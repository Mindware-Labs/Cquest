import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";
import { resolveLang } from "@/i18n/resolveLangParam";
import { brandLine } from "@/components/footer/data";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest";

// The same sentence layout.tsx builds og:title from and the footer sets as
// its closing statement, read straight from the source this time — the brand
// name is the image's own heading line, so there is no prefix to strip.
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return renderOgImage("Center Quest", brandLine(lang));
}
