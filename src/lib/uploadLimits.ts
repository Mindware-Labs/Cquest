// Aparte de lib/blob.ts (que importa el SDK de Vercel Blob e image-size) para no arrastrar esas dependencias al bundle del cliente sólo por dos constantes. Un solo lugar evita que cliente y servidor se desincronicen en el límite.

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** Para el atributo `accept` de un <input type="file">. */
export const ACCEPT_ATTRIBUTE = ALLOWED_IMAGE_TYPES.join(",");

export function formatUploadSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
