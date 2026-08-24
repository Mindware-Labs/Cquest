import type { Locale } from "@/i18n/config";

/* Los parámetros de la URL del blog, en el idioma de la página.
   ---------------------------------------------------------------------------

   `/en/blog?categoria=onboarding` era la única parte del sitio en inglés que
   seguía hablando español, y encima en el lugar más visible que tiene una
   página: la barra de direcciones.

   La lectura acepta LOS DOS nombres en los dos idiomas, siempre. No es
   indulgencia: los enlaces en español ya publicados y compartidos tienen que
   seguir funcionando, y un filtro que se cae porque alguien pegó la URL vieja
   se ve exactamente igual que un artículo borrado. Se escribe el localizado, se
   lee cualquiera. */

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

/** El href del listado con el recorte puesto. Sin prefijo de idioma: lo agrega
 *  LocalizedLink, que es quien sabe de idiomas en el resto del sitio. */
export function blogHref(
  lang: Locale,
  { category, page }: { category?: string | null; page?: number } = {},
): string {
  const params = new URLSearchParams();
  if (category) params.set(categoryParam(lang), category);
  /* La página 1 no se escribe: es el default, y `?pagina=1` es la misma
     pantalla bajo otra URL — dos direcciones para un solo contenido es lo que
     Google llama duplicado. */
  if (page && page > 1) params.set(pageParam(lang), String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}
