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

  const options = [{ slug: null, name: ALL_LABEL[lang] }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <nav aria-label={NAV_LABEL[lang]} className="mt-8 flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.slug === activeSlug;
        return (
          <LocalizedLink
            key={option.slug ?? "all"}
            href={option.slug ? `/blog?categoria=${option.slug}` : "/blog"}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-[0.82rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo ${
              isActive
                ? "border-petroleo bg-petroleo text-white"
                : "border-border text-[var(--text-secondary)] hover:border-petroleo hover:text-foreground"
            }`}
          >
            {option.name}
          </LocalizedLink>
        );
      })}
    </nav>
  );
}
