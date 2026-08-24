import { del, put } from "@vercel/blob";
import { imageSize } from "image-size";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";

// Límite y tipos comparten fuente con el campo de subida del cliente en lib/uploadLimits.ts: estaban duplicados y habían divergido (cliente 8MB, servidor 5MB).
const MAX_SIZE_BYTES = MAX_UPLOAD_BYTES;
const ALLOWED_TYPES: readonly string[] = ALLOWED_IMAGE_TYPES;

export class UploadValidationError extends Error {}

function safeFileName(name: string): string {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
  return `${Date.now()}${ext}`;
}

// El store es Private en Vercel Blob, así que devolvemos una ruta relativa a /api/images/[...path] (la única con el token) en vez de la URL directa.
export type UploadedImage = {
  url: string;
  // Ausentes solo si el archivo no se pudo medir; next/image las necesita para reservar espacio y evitar salto de layout.
  width?: number;
  height?: number;
};

// Se miden en el servidor sobre los bytes reales, no se le preguntan al navegador: un cliente podría mandar cualquier número.
function measure(bytes: Buffer): { width?: number; height?: number } {
  try {
    const size = imageSize(bytes);
    if (!size.width || !size.height) return {};
    // Orientación EXIF 5-8 viene rotada 90°: alto y ancho van al revés de lo que el navegador termina pintando.
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

  // Se leen los bytes una sola vez para medir Y subir: leer el File dos veces dejaría el stream consumido en la segunda.
  const bytes = Buffer.from(await file.arrayBuffer());
  const { width, height } = measure(bytes);

  const blob = await put(`posts/${safeFileName(file.name)}`, bytes, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return { url: `/api/images/${blob.pathname}`, width, height };
}

// Recolección de huérfanas: al guardar se compara el conjunto de imágenes antes/después y lo que salió se borra; al eliminar, sale todo. Sin esto, borrar o reemplazar una imagen la dejaba huérfana en el store para siempre.

export const IMAGE_ROUTE_PREFIX = "/api/images/";

// Devuelve null para cualquier cosa que no sea una subida nuestra: nunca se le pide a del() que borre algo cuyo origen no controlamos.
export function blobPathnameFromUrl(url: string): string | null {
  if (!url.startsWith(IMAGE_ROUTE_PREFIX)) return null;
  const pathname = url.slice(IMAGE_ROUTE_PREFIX.length);
  // Solo el prefijo posts/ que escribe uploadCoverImage(); un pathname con ".." no sale de acá.
  if (!pathname.startsWith("posts/") || pathname.includes("..")) return null;
  return pathname;
}

// Nunca lanza: una imagen huérfana sin borrar es un costo, pero fallar acá no debe tumbar el guardado del artículo. El error se registra para barrer después.
export async function deleteUploads(urls: Iterable<string>): Promise<void> {
  const pathnames = [...new Set(urls)]
    .map(blobPathnameFromUrl)
    .filter((pathname): pathname is string => pathname !== null);

  if (pathnames.length === 0) return;

  try {
    // Una sola llamada con el arreglo entero: del() acepta lote, evita un viaje por imagen.
    await del(pathnames);
  } catch (error) {
    console.error("No se pudieron borrar imágenes huérfanas:", pathnames, error);
  }
}

// Diferencia de dos conjuntos, centralizada para que actualizar/borrar/cambiar portada no la deriven cada una a su manera.
export function orphanedUrls(before: Iterable<string>, after: Iterable<string>): string[] {
  const kept = new Set(after);
  return [...new Set(before)].filter((url) => !kept.has(url));
}
