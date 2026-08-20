import { ALIGN, blockSpacing, type BlockOf } from "@/lib/blocks-style";

/* Nunca h1: ese lo usa el título del artículo. El admin elige entre h2/h3/h4,
   así la jerarquía del documento no se puede romper desde el editor. */
const LEVEL_STYLE = {
  h2: "text-[clamp(1.5rem,3vw,1.95rem)] leading-[1.15] tracking-[-0.02em]",
  h3: "text-[clamp(1.25rem,2.4vw,1.5rem)] leading-[1.2] tracking-[-0.015em]",
  h4: "text-[1.1rem] leading-[1.3] tracking-[-0.01em]",
} as const;

const WEIGHT = {
  regular: "font-normal",
  medium: "font-semibold",
} as const;

export default function HeadingBlock({ block }: { block: BlockOf<"heading"> }) {
  const Tag = block.level;

  return (
    <Tag
      className={`font-heading text-foreground ${LEVEL_STYLE[block.level]} ${WEIGHT[block.weight]} ${ALIGN[block.align]} ${blockSpacing(block.spacingTop, block.spacingBottom)}`}
    >
      {block.text}
    </Tag>
  );
}
