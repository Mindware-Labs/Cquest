import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";
import { resolveLang } from "@/i18n/resolveLangParam";
import { OG_TITLE } from "./layout";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest";

// Reuses the exact tagline already defined for <meta property="og:title">
// in layout.tsx (just the "Center Quest — " prefix split off, since that
// becomes the image's own heading line instead).
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  const tagline = OG_TITLE[lang].replace(/^Center Quest\s*—\s*/, "");
  return renderOgImage("Center Quest", tagline);
}
