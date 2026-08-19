import { put } from "@vercel/blob";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export class UploadValidationError extends Error {}

function safeFileName(name: string): string {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
  return `${Date.now()}${ext}`;
}

/** Sube la portada de un artículo a Vercel Blob y devuelve la ruta que hay
 *  que guardar en Post.coverImageUrl. El store quedó creado como Private en
 *  el dashboard (no se puede cambiar después) — la URL que devuelve Vercel
 *  para un blob privado no sirve el archivo directo, exige el token. Por eso
 *  esto no expone esa URL: devuelve una ruta relativa a /api/images/[...path],
 *  nuestra propia Function, que es la única con el token y retransmite el
 *  archivo al navegador como si fuera público. Relativa a propósito — no un
 *  dominio fijo: así funciona igual en local, preview y producción. */
export async function uploadCoverImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadValidationError(
      `Tipo de archivo no permitido: ${file.type || "desconocido"}. Usa JPEG, PNG, WebP o AVIF.`,
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(`El archivo pesa demasiado (máximo ${MAX_SIZE_BYTES / (1024 * 1024)}MB).`);
  }

  const blob = await put(`posts/${safeFileName(file.name)}`, file, {
    access: "private",
    addRandomSuffix: true,
  });

  return `/api/images/${blob.pathname}`;
}
