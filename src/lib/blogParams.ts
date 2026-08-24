import type { Locale } from "@/i18n/config";

// La lectura acepta los dos nombres en los dos idiomas: los enlaces en español ya publicados tienen que seguir funcionando aunque se escriba el localizado.
const CATEGORY_PARAM: Record<Locale, string> = { es: "categoria", en: "category" };
const PAGE_PARAM: Record<Locale, string> = { es: "pagina", en: "page" };

export function categoryParam(lang: Locale): string {
  return CATEGORY_PARAM[lang];
}

export function pageParam(lang: Locale): string {
  return PAGE_PARAM[lang];
}

export type BlogSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function readCategory(search: BlogSearchParams, lang: Locale): string | undefined {
  const value = first(search[categoryParam(lang)]) ?? first(search[CATEGORY_PARAM.es]) ?? first(search[CATEGORY_PARAM.en]);
  return value?.trim() || undefined;
}

export function readPage(search: BlogSearchParams, lang: Locale): number {
  const raw = first(search[pageParam(lang)]) ?? first(search[PAGE_PARAM.es]) ?? first(search[PAGE_PARAM.en]);
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** El href del listado con el recorte puesto, sin prefijo de idioma: lo agrega LocalizedLink. */
export function blogHref(
  lang: Locale,
  { category, page }: { category?: string | null; page?: number } = {},
): string {
  const params = new URLSearchParams();
  if (category) params.set(categoryParam(lang), category);
  // Página 1 no se escribe: `?pagina=1` sería contenido duplicado para Google.
  if (page && page > 1) params.set(pageParam(lang), String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}
