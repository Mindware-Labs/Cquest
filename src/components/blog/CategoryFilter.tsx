import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";
import { blogHref } from "@/lib/blogParams";

const ALL_LABEL: Record<Locale, string> = { es: "Todos", en: "All" };
const NAV_LABEL: Record<Locale, string> = { es: "Filtrar por categoría", en: "Filter by category" };

// Filtro por categoría (BP-2): enlaces reales y no un <select> con onChange, para que cada filtro sea una URL compartible y funcione sin JavaScript.
export default function CategoryFilter({
  categories,
  activeSlug,
  lang,
}: {
  categories: ReadonlyArray<{ id: number; name: string; slug: string }>;
  activeSlug: string | null;
  lang: Locale;
}) {
  /* Con una sola categoría el filtro no filtra nada: se omite. */
  if (categories.length < 2) return null;

  const options = [
    { slug: null, name: ALL_LABEL[lang] },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    // Texto plano y no pastillas: en una hoja sin color, pastillas rellenas ganarían visualmente por encima de los títulos.
    <nav
      aria-label={NAV_LABEL[lang]}
      // El padding derecho extra deja la última categoría fuera del desvanecido: sin él la máscara apagaba la última aunque entraran todas.
      className="cq-blog-rail -mx-5 flex gap-7 pl-5 pr-12 sm:-mx-8 sm:pl-8 sm:pr-14 md:mx-0 md:px-0"
    >
      {options.map((option) => {
        const isActive = option.slug === activeSlug;
        return (
          <LocalizedLink
            key={option.slug ?? "all"}
            // El nombre del parámetro también se traduce (evita "?categoria=" en una URL inglesa); cambiar de categoría vuelve a la página 1 a propósito, porque la página 3 de una categoría no es la de otra.
            href={blogHref(lang, { category: option.slug })}
            aria-current={isActive ? "page" : undefined}
            className={`relative shrink-0 whitespace-nowrap py-4 text-[0.92rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
              isActive
                ? "font-semibold text-foreground"
                : "font-medium text-[var(--text-tertiary)] hover:text-foreground"
            }`}
          >
            {option.name}
            {/* La línea es un hijo y no un border-bottom: así el ancho no depende del padding y la fila mantiene su altura esté activa o no. */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 -bottom-px h-[2px] bg-foreground transition-opacity duration-200 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
          </LocalizedLink>
        );
      })}
    </nav>
  );
}
