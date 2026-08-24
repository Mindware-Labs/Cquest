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

/* Paginación del blog público.
   ---------------------------------------------------------------------------

   Antes no existía: el listado tenía un `take: 60` y el artículo número 61
   desaparecía del sitio mientras el sitemap seguía declarándolo.

   Enlaces y no botones, igual que el filtro de categorías: cada página es una
   URL propia, se comparte, se abre en pestaña nueva y el botón de atrás hace lo
   que se espera. Y funciona sin una línea de JavaScript.

   Sin tira de números. Un blog corporativo no llega a veinte páginas, y una
   fila de dígitos para elegir entre tres es más controles que contenido. El
   texto del medio dice dónde estás, que es la única pregunta que la tira de
   números contesta de verdad. */
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
  /* Con una sola página no se dibuja nada. Una paginación deshabilitada de
     punta a punta ocupa lugar para decir que no hay nada que paginar. */
  if (pageCount <= 1) return null;

  const copy = COPY[lang];
  const linkClass =
    "inline-flex items-center gap-2 text-[0.92rem] font-semibold text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";

  return (
    <nav
      aria-label={copy.label}
      className="mt-20 flex items-center justify-between gap-4 border-t border-border pt-8"
    >
      {/* El extremo se dibuja como texto apagado y no se oculta: un control que
          aparece y desaparece hace saltar la fila entera de un lado a otro. Y
          no es un enlace sin href — un enlace sin destino no es enfocable ni
          anunciable, y no tiene por qué serlo. */}
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
        {/* El total va oculto y no impreso: en pantalla el número de página ya
            ubica, pero un lector de pantalla que salta entre páginas se queda
            sin saber cuántos artículos hay en total. */}
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
