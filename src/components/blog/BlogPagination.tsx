import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";
import { blogHref } from "@/lib/blogParams";

const COPY: Record<
  Locale,
  { label: string; previous: string; next: string; position: (page: number, total: number) => string }
> = {
  es: {
    label: "Paginación del blog",
    previous: "Anteriores",
    next: "Siguientes",
    position: (page, total) => `Página ${page} de ${total}`,
  },
  en: {
    label: "Blog pagination",
    previous: "Previous",
    next: "Next",
    position: (page, total) => `Page ${page} of ${total}`,
  },
};

// Antes no existía paginación: con take: 60, el artículo 61 desaparecía del sitio pero el sitemap seguía declarándolo. Enlaces y no botones, como el filtro de categorías; sin tira de números porque un blog corporativo no llega a veinte páginas.
export default function BlogPagination({
  lang,
  page,
  pageCount,
  total,
  category,
}: {
  lang: Locale;
  page: number;
  pageCount: number;
  total: number;
  category: string | null;
}) {
  // Con una sola página no se dibuja nada: una paginación deshabilitada de punta a punta solo ocuparía lugar.
  if (pageCount <= 1) return null;

  const copy = COPY[lang];
  const linkClass =
    "inline-flex items-center gap-2 text-[0.92rem] font-semibold text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";

  return (
    <nav
      aria-label={copy.label}
      className="mt-20 flex items-center justify-between gap-4 border-t border-border pt-8"
    >
      {/* Se dibuja como texto apagado y no se oculta (evita que la fila salte) ni como enlace sin href (no sería enfocable ni anunciable). */}
      {page > 1 ? (
        <LocalizedLink href={blogHref(lang, { category, page: page - 1 })} className={linkClass}>
          <Arrow direction="left" />
          {copy.previous}
        </LocalizedLink>
      ) : (
        <span className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-[var(--text-tertiary)]">
          <Arrow direction="left" />
          {copy.previous}
        </span>
      )}

      <p className="text-[0.82rem] text-[var(--text-tertiary)]">
        {copy.position(page, pageCount)}
        {/* El total va oculto (sr-only) porque un lector de pantalla que salta entre páginas no sabría cuántos artículos hay en total. */}
        <span className="sr-only"> — {total}</span>
      </p>

      {page < pageCount ? (
        <LocalizedLink href={blogHref(lang, { category, page: page + 1 })} className={linkClass}>
          {copy.next}
          <Arrow direction="right" />
        </LocalizedLink>
      ) : (
        <span className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-[var(--text-tertiary)]">
          {copy.next}
          <Arrow direction="right" />
        </span>
      )}
    </nav>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : undefined}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
