import { ALIGN, blockSpacing, type BlockOf } from "@/lib/blocks-style";

// Tres registros de cuerpo, no tamaños libres: el admin elige intención ("lead" entradilla, "muted" nota al margen), no tipografía.
const VARIANT = {
  body: "text-[1.02rem] leading-[1.8] text-[var(--text-secondary)]",
  lead: "text-[1.18rem] leading-[1.7] text-foreground",
  muted: "text-[0.94rem] leading-[1.7] text-[var(--text-tertiary)]",
} as const;

export default function ParagraphBlock({ block }: { block: BlockOf<"paragraph"> }) {
  return (
    <p
      className={`text-pretty ${VARIANT[block.variant]} ${ALIGN[block.align]} ${blockSpacing(block.spacingTop, block.spacingBottom)}`}
    >
      {/* El texto llega en plano (sin HTML): los saltos de línea se reconstruyen acá en vez de perderse. */}
      {block.text.split("\n").map((line, index) => (
        <span key={index}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </p>
  );
}
