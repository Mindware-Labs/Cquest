import { ALIGN, blockSpacing, type BlockOf } from "@/lib/blocks-style";

/* Tres registros de cuerpo, no tres tamaños libres: "lead" es la entradilla
   que abre una sección, "muted" la nota al margen. El admin elige intención,
   no tipografía. */
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
      {/* El texto llega en plano desde el editor — sin HTML — así que los
          saltos de línea del admin se respetan acá en vez de perderse. */}
      {block.text.split("\n").map((line, index) => (
        <span key={index}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </p>
  );
}
