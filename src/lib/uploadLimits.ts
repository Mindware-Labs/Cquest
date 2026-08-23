/* Límites de subida de imágenes, compartidos por cliente y servidor.

   Viven en su propio archivo y no en lib/blob.ts porque ese importa el SDK de
   Vercel Blob y `image-size`: traerlo a un componente de cliente arrastraría
   las dos dependencias al bundle del navegador para leer dos constantes.

   El motivo de que existan en un solo lugar es más importante que el ahorro de
   bytes. El campo de subida verifica el tamaño ANTES de enviar, para no hacer
   viajar cinco megas por una conexión de oficina y recibir el rechazo al final.
   Si ese número y el del servidor se escriben por separado, se separan: alcanza
   con que alguien suba el límite del servidor y se olvide del otro para que el
   panel siga rechazando archivos que el backend ya acepta. */

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
