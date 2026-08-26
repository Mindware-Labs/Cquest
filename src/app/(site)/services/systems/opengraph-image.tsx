import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Systems Development";

const OG = {
  title: "Systems Development",
  subtitle: "Custom systems for operations.",
};

export default function Image() {
  return renderOgImage(OG.title, OG.subtitle);
}
