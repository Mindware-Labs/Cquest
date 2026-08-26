import { renderOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/ogImage";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;
export const alt = "Center Quest — Careers";

export default async function Image() {
  return renderOgImage(
    "Your first job, or your next one",
    "Open positions in Santo Domingo, with paid training.",
  );
}
