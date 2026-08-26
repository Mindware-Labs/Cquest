import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Contact-center operations platform, case study";

const OG = {
  title: "Contact-center operations platform",
  subtitle: "Case study — a custom platform running a full contact-center operation.",
};

export default function Image() {
  return renderOgImage(OG.title, OG.subtitle);
}
