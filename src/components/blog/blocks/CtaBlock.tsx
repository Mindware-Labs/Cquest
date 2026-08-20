import { LocalizedLink } from "@/i18n/LocalizedLink";
import { blockSpacing, type BlockOf } from "@/lib/blocks-style";

const BUTTON = {
  primary: "bg-verde text-white hover:bg-verde/90 focus-visible:outline-verde",
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
