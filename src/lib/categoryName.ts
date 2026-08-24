import type { Locale } from "@/i18n/config";

// `nameEn` es opcional con respaldo en `name`: una categoría sin traducir se ve en español dentro del inglés en vez de quedarse sin etiqueta.
export type NamedCategory = { name: string; nameEn?: string | null };

export function categoryName(category: NamedCategory, lang: Locale): string {
  if (lang === "en") return category.nameEn?.trim() || category.name;
  return category.name;
}

/** Reemplaza `name` por el nombre ya resuelto, para un componente que sólo espera `{ name }` sin saber que hay dos idiomas. */
export function localizeCategory<T extends NamedCategory>(
  category: T,
  lang: Locale,
): T & { name: string } {
  return { ...category, name: categoryName(category, lang) };
}
