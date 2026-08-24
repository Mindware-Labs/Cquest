import { describe, expect, it } from "vitest";
import { blobPathnameFromUrl, orphanedUrls } from "./blob";

/* La recolección de imágenes huérfanas borra archivos. Un falso positivo acá
   deja una imagen rota en un artículo publicado, así que la regla tiene que ser
   estricta en la dirección correcta: ante la duda, no se borra. */

describe("blobPathnameFromUrl", () => {
  it("traduce la ruta pública al pathname del store", () => {
    expect(blobPathnameFromUrl("/api/images/posts/1724000000-abc.jpg")).toBe(
      "posts/1724000000-abc.jpg",
    );
  });

  it("no toca nada fuera de la carpeta de artículos", () => {
    /* Hoy sólo se sube a `posts/`, pero el día que el store guarde otra cosa
       —un adjunto de una postulación, un export— esta función no puede ser el
       camino por el que se borra. */
    expect(blobPathnameFromUrl("/api/images/private/nomina.pdf")).toBeNull();
  });

  it("rechaza una URL externa", () => {
    expect(blobPathnameFromUrl("https://otro-sitio.com/posts/foto.jpg")).toBeNull();
    expect(blobPathnameFromUrl("")).toBeNull();
  });

  it("rechaza un intento de subir de directorio", () => {
    expect(blobPathnameFromUrl("/api/images/posts/../../secretos.json")).toBeNull();
  });
});

describe("orphanedUrls", () => {
  it("devuelve sólo lo que dejó de estar referenciado", () => {
    expect(orphanedUrls(["a", "b", "c"], ["b"])).toEqual(["a", "c"]);
  });

  it("no marca nada cuando el artículo no cambió sus imágenes", () => {
    expect(orphanedUrls(["a", "b"], ["b", "a"])).toEqual([]);
  });

  it("no se confunde con la misma imagen repetida", () => {
    /* Una imagen puede aparecer dos veces en un artículo. Si se quita UNA de
       las dos apariciones, el archivo sigue en uso y no puede borrarse. */
    expect(orphanedUrls(["a", "a"], ["a"])).toEqual([]);
  });

  it("marca todo cuando el artículo se borró entero", () => {
    expect(orphanedUrls(["a", "b"], [])).toEqual(["a", "b"]);
  });
});
