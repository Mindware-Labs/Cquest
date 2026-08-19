/* NFD + strip de diacriticos: "Atencion al cliente" -> "atencion-al-cliente"
   sin depender de una libreria aparte para un reemplazo de acentos. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
