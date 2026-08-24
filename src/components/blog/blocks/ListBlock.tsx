import { blockSpacing, type BlockOf } from "@/lib/blocks-style";

export default function ListBlock({ block }: { block: BlockOf<"list"> }) {
  const Tag = block.ordered ? "ol" : "ul";
  const spacing = blockSpacing(block.spacingTop, block.spacingBottom);
  const itemClass = "relative pl-7 text-[1.02rem] leading-[1.75] text-[var(--text-secondary)]";

  /* Una lista numerada usa el contador nativo del navegador: sigue siendo una
     lista ordenada para un lector de pantalla, no números dibujados a mano. */
  if (block.ordered) {
    return (
      <ol className={`ml-5 list-decimal space-y-2.5 marker:font-semibold marker:text-petroleo ${spacing}`}>
        {block.items.map((item, index) => (
          <li key={index} className="pl-1 text-[1.02rem] leading-[1.75] text-[var(--text-secondary)]">
            {item}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <Tag className={`space-y-2.5 ${spacing}`}>
      {block.items.map((item, index) => (
        <li key={index} className={itemClass}>
          {block.markerStyle === "check" ? (
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              /* `verde-oscuro`: el tilde es un icono que porta significado —dice
                 "cumplido"— así que cae bajo WCAG 1.4.11, que pide 3:1 contra
                 el fondo. El verde de marca daba 2.85:1. */
              className="absolute left-0 top-[0.42em] h-4 w-4 text-verde-oscuro"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10.5 8 14.5 16 5.5" />
            </svg>
          ) : (
            <span
              aria-hidden
              className="absolute left-1 top-[0.72em] h-1.5 w-1.5 rounded-full bg-celeste"
            />
          )}
          {item}
        </li>
      ))}
    </Tag>
  );
}
