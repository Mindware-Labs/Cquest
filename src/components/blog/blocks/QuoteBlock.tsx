import { blockSpacing, type BlockOf } from "@/lib/blocks-style";

export default function QuoteBlock({ block }: { block: BlockOf<"quote"> }) {
  const isLarge = block.style === "large";

  return (
    <figure className={blockSpacing(block.spacingTop, block.spacingBottom)}>
      <blockquote
        className={
          isLarge
            ? "text-pretty text-center font-heading text-[clamp(1.35rem,3vw,1.75rem)] font-medium leading-[1.4] tracking-[-0.015em] text-foreground"
            : "border-l-2 border-celeste pl-6 text-pretty text-[1.08rem] leading-[1.7] text-foreground"
        }
      >
        {block.text}
      </blockquote>
      {(block.attributionName || block.attributionRole) && (
        <figcaption
          className={`mt-4 text-[0.85rem] text-[var(--text-tertiary)] ${isLarge ? "text-center" : "pl-6"}`}
        >
          {block.attributionName && (
            <span className="font-semibold text-petroleo">{block.attributionName}</span>
          )}
          {block.attributionName && block.attributionRole && " — "}
          {block.attributionRole}
        </figcaption>
      )}
    </figure>
  );
}
