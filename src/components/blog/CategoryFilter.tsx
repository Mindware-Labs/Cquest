import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";

const ALL_LABEL: Record<Locale, string> = { es: "Todos", en: "All" };
const NAV_LABEL: Record<Locale, string> = { es: "Filtrar por categoría", en: "Filter by category" };

/* Filtro por categoría (BP-2). Enlaces reales, no botones con estado: cada
   filtro es una URL que se puede compartir, marcar y rastrear, y funciona sin
   JavaScript. Un <select> con onChange no tendría ninguna de esas tres cosas. */
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
    /* Texto plano y no pastillas: en una hoja sin color, una fila de pastillas
       rellenas sería el elemento más pesado de la página y ganaría por encima
       de los títulos, que es lo que en un índice tiene que ganar. Lo activo se
       marca con peso y con negro pleno; lo inactivo, en gris. */
    <nav
      aria-label={NAV_LABEL[lang]}
      /* El padding derecho extra deja la última categoría fuera del desvanecido:
         sin él, con pocas categorías que entran todas, la máscara igual apagaba
         la última y parecía un recorte y no una señal de scroll. */
      className="cq-blog-rail -mx-5 flex gap-7 pl-5 pr-12 sm:-mx-8 sm:pl-8 sm:pr-14 md:mx-0 md:px-0"
    >
      {options.map((option) => {
        const isActive = option.slug === activeSlug;
        return (
          <LocalizedLink
            key={option.slug ?? "all"}
            href={option.slug ? `/blog?categoria=${option.slug}` : "/blog"}
            aria-current={isActive ? "page" : undefined}
            className={`relative shrink-0 whitespace-nowrap py-4 text-[0.92rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
              isActive
                ? "font-semibold text-foreground"
                : "font-medium text-[var(--text-tertiary)] hover:text-foreground"
            }`}
          >
            {option.name}
            {/* La línea la dibuja un hijo y no un border-bottom en el enlace:
                así el ancho del subrayado no depende del padding y la fila
                completa mantiene la misma altura esté activa o no. */}
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
