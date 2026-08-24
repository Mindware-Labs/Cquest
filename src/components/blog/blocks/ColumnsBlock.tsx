import type { ColumnSimpleBlock } from "@/lib/blocks";
import { blockSpacing, type BlockOf } from "@/lib/blocks-style";
import HeadingBlock from "./HeadingBlock";
import ParagraphBlock from "./ParagraphBlock";
import ImageBlock from "./ImageBlock";
import ListBlock from "./ListBlock";
import CtaBlock from "./CtaBlock";

const COLUMN_COUNT = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
} as const;

// Switch propio en vez de reusar BlockRenderer: las columnas admiten solo los 5 bloques de columnSimpleBlockSchema, y esto evita el import circular con BlockRenderer.
function ColumnBlock({ block, preview }: { block: ColumnSimpleBlock; preview: boolean }) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    // Único de los cinco que cambia en previa; la bandera baja por todo el switch para no olvidarla si se agrega otro bloque con medios.
    case "image":
      return <ImageBlock block={block} preview={preview} />;
    case "list":
      return <ListBlock block={block} />;
    case "cta":
      return <CtaBlock block={block} />;
  }
}

export default function ColumnsBlock({
  block,
  preview = false,
}: {
  block: BlockOf<"columns">;
  preview?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-8 ${COLUMN_COUNT[block.columnCount]} ${blockSpacing(block.spacingTop, block.spacingBottom)}`}
    >
      {block.columns.map((column, columnIndex) => (
        <div key={columnIndex}>
          {column.map((child) => (
            <ColumnBlock key={child.id} block={child} preview={preview} />
          ))}
        </div>
      ))}
    </div>
  );
}
