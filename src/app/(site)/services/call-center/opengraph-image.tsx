import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Call Center";

const OG = {
  title: "Call Center",
  subtitle: "Inbound and outbound contact-center operations across every channel.",
};

export default function Image() {
  return renderOgImage(OG.title, OG.subtitle);
}
