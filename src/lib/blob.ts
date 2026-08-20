import { put } from "@vercel/blob";
import { imageSize } from "image-size";

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
export type UploadedImage = {
  url: string;
  /* Ausentes solo si el archivo no se pudo medir. next/image las necesita para
     reservar el espacio antes de descargar la imagen y evitar que el texto
     salte cuando llega — sin ellas hay que caer a un contenedor de proporción
     fija. */
  width?: number;
  height?: number;
};

/* Las dimensiones se miden en el SERVIDOR, sobre los bytes reales, y no se le
   preguntan al navegador: un cliente puede mandar cualquier número, y aunque
   el daño sería solo visual, medir el archivo que efectivamente se guardó no
   cuesta más que confiar. */
function measure(bytes: Buffer): { width?: number; height?: number } {
  try {
    const size = imageSize(bytes);
    if (!size.width || !size.height) return {};
    /* Una imagen con orientación EXIF 5-8 viene rotada 90°: alto y ancho van
       al revés de lo que el navegador termina pintando. */
    const isRotated = typeof size.orientation === "number" && size.orientation >= 5;
    return isRotated
      ? { width: size.height, height: size.width }
      : { width: size.width, height: size.height };
  } catch {
    return {};
  }
}

export async function uploadCoverImage(file: File): Promise<UploadedImage> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadValidationError(
      `Tipo de archivo no permitido: ${file.type || "desconocido"}. Usa JPEG, PNG, WebP o AVIF.`,
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(`El archivo pesa demasiado (máximo ${MAX_SIZE_BYTES / (1024 * 1024)}MB).`);
  }

  /* Se leen los bytes una sola vez y se usan para medir Y para subir: pasar el
     File directo a put() después de haberlo leído dejaría el stream consumido. */
  const bytes = Buffer.from(await file.arrayBuffer());
  const { width, height } = measure(bytes);

  const blob = await put(`posts/${safeFileName(file.name)}`, bytes, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return { url: `/api/images/${blob.pathname}`, width, height };
}
