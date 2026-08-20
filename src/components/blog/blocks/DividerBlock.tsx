import { blockSpacing, type BlockOf } from "@/lib/blocks-style";

export default function DividerBlock({ block }: { block: BlockOf<"divider"> }) {
  const spacing = blockSpacing(block.spacingTop, block.spacingBottom);

  /* "space" es una pausa, no una separación semántica: un <hr> invisible le
     anunciaría a un lector de pantalla un cambio de tema que no existe. */
  if (block.style === "space") {
    return <div aria-hidden className={spacing} />;
  }

  return <hr className={`border-0 border-t border-border ${spacing}`} />;
}
