import { del, put } from "@vercel/blob";
import { imageSize } from "image-size";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";

/* El límite y los tipos salen de lib/uploadLimits.ts, que también lee el campo
   de subida del editor. Estaban escritos dos veces —acá y en el cliente— y ya
   habían divergido: el cliente dejaba pasar 8MB y este rechazaba a los 5, así
   que un archivo de 6 viajaba entero para morir en el servidor. */
const MAX_SIZE_BYTES = MAX_UPLOAD_BYTES;
const ALLOWED_TYPES: readonly string[] = ALLOWED_IMAGE_TYPES;

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

/* ---------------------------------------------------------------------------
   Recolección de huérfanas
   ---------------------------------------------------------------------------

   Borrar un artículo borraba la fila y dejaba sus archivos en el store para
   siempre. Lo mismo al cambiar la portada o quitar un bloque de imagen: el
   archivo viejo quedaba sin nadie que lo referenciara y sin forma de saber cuál
   era. Con el tiempo eso es una factura que sólo sube.

   La regla es una sola y vive del lado del que ESCRIBE: al guardar, se compara
   el conjunto de imágenes que el artículo tenía contra el que va a tener, y lo
   que salió se borra. Al eliminar, sale todo.
--------------------------------------------------------------------------- */

export const IMAGE_ROUTE_PREFIX = "/api/images/";

/** Traduce la ruta pública que guardamos en la base al pathname del store.
 *  Devuelve null para cualquier cosa que no sea una subida nuestra — nunca se
 *  le pide a `del()` que borre algo cuyo origen no controlamos. */
export function blobPathnameFromUrl(url: string): string | null {
  if (!url.startsWith(IMAGE_ROUTE_PREFIX)) return null;
  const pathname = url.slice(IMAGE_ROUTE_PREFIX.length);
  /* `posts/` es el único prefijo que escribe uploadCoverImage(). Un pathname
     con `..` o apuntando a otra carpeta no sale de acá: no se borra. */
  if (!pathname.startsWith("posts/") || pathname.includes("..")) return null;
  return pathname;
}

/** Borra del store las imágenes que ya nadie referencia.
 *
 *  Nunca lanza. Una imagen huérfana que no se pudo borrar es un costo; una
 *  excepción acá haría fallar el guardado del artículo, que es el trabajo real.
 *  El fallo se registra para poder barrer después. */
export async function deleteUploads(urls: Iterable<string>): Promise<void> {
  const pathnames = [...new Set(urls)]
    .map(blobPathnameFromUrl)
    .filter((pathname): pathname is string => pathname !== null);

  if (pathnames.length === 0) return;

  try {
    /* Una sola llamada con el arreglo entero: `del()` acepta lote, y borrar
       nueve imágenes de una galería de a una son nueve viajes. */
    await del(pathnames);
  } catch (error) {
    console.error("No se pudieron borrar imágenes huérfanas:", pathnames, error);
  }
}

/** Las imágenes que estaban y ya no están. Es la diferencia de dos conjuntos,
 *  escrita acá para que las tres acciones que la necesitan (actualizar, borrar,
 *  cambiar portada) no la vuelvan a derivar cada una a su manera. */
export function orphanedUrls(before: Iterable<string>, after: Iterable<string>): string[] {
  const kept = new Set(after);
  return [...new Set(before)].filter((url) => !kept.has(url));
}
