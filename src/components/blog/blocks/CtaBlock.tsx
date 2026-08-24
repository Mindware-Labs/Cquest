import { LocalizedLink } from "@/i18n/LocalizedLink";
import { blockSpacing, type BlockOf } from "@/lib/blocks-style";

/* El primario usa `verde-oscuro` y no el verde de marca.
   ---------------------------------------------------------------------------

   Con `bg-verde text-white` la etiqueta del botón quedaba en 2.85:1, muy por
   debajo del 4.5:1 que pide WCAG 1.4.3 para texto normal. Y no era un detalle
   de una pantalla: éste es un bloque que la redacción inserta en los artículos,
   así que el fallo se multiplicaba por cada CTA publicado.

   Se oscurece el FONDO en vez de cambiar el texto a tinta: el botón sigue
   leyéndose como el mismo verde institucional —mismo tono, solo más profundo—
   y el par blanco-sobre-verde queda en 5.28:1. Cambiar la etiqueta a tinta
   habría resuelto el contraste rompiendo el par de color que el sistema le
   asigna al CTA primario. */
const BUTTON = {
  primary: "bg-verde-oscuro text-white hover:bg-verde-oscuro/90 focus-visible:outline-verde-oscuro",
  secondary: "bg-petroleo text-white hover:bg-petroleo/90 focus-visible:outline-petroleo",
} as const;

export default function CtaBlock({ block }: { block: BlockOf<"cta"> }) {
  const buttonClass = `inline-flex items-center justify-center rounded-full px-7 py-3 text-[0.9rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${BUTTON[block.style]}`;

  return (
    <div
      className={`rounded-xl border border-border bg-[var(--surface-raised)] px-7 py-9 text-center ${blockSpacing(block.spacingTop, block.spacingBottom)}`}
    >
      <p className="font-heading text-[1.3rem] font-semibold leading-snug tracking-[-0.015em] text-foreground">
        {block.heading}
      </p>
      {block.body && (
        <p className="mx-auto mt-3 max-w-[34rem] text-pretty text-[0.98rem] leading-[1.7] text-[var(--text-secondary)]">
          {block.body}
        </p>
      )}
      <div className="mt-6">
        {/* Un destino interno pasa por LocalizedLink para llevar el prefijo de
            idioma; uno externo es un <a> normal, con rel de seguridad. */}
        {block.hrefKind === "internal" ? (
          <LocalizedLink href={block.href} className={buttonClass}>
            {block.buttonLabel}
          </LocalizedLink>
        ) : (
          <a
            href={block.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            {block.buttonLabel}
          </a>
        )}
      </div>
    </div>
  );
}
