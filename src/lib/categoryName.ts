import type { Locale } from "@/i18n/config";

/* El nombre visible de una categoría, en el idioma de la página.
   ---------------------------------------------------------------------------

   Un artículo vive en un solo idioma (PostLocale) pero su categoría era una
   sola fila con un solo nombre, así que /en/blog mostraba «Operaciones» en la
   miga, en el filtro y en el pie de un artículo escrito en inglés. Rompía justo
   el argumento por el que los artículos están separados por idioma.

   `nameEn` es opcional y el respaldo es `name`. Una categoría sin traducir
   sigue funcionando —se ve en español dentro del inglés, que es feo pero
   legible— en vez de quedarse sin etiqueta o mostrar el slug crudo. */

export type NamedCategory = { name: string; nameEn?: string | null };

export function categoryName(category: NamedCategory, lang: Locale): string {
  if (lang === "en") return category.nameEn?.trim() || category.name;
  return category.name;
}

/** Reemplaza `name` por el nombre ya resuelto, para pasarle a un componente
 *  que sólo espera `{ name }` y no tiene por qué saber que hay dos idiomas. */
export function localizeCategory<T extends NamedCategory>(
  category: T,
  lang: Locale,
): T & { name: string } {
  return { ...category, name: categoryName(category, lang) };
}
