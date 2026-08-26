import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Request a service quote";

export default function Image() {
  return renderOgImage("Request your quote", "Get a tailored proposal in under a minute.");
}
