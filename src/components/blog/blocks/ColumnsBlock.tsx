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

/* Switch propio en vez de reusar BlockRenderer: las columnas admiten solo los
   5 bloques simples que declara columnSimpleBlockSchema, y este switch es lo
   que hace que esa restricción sea visible en el código y no solo en Zod.
   De paso evita el import circular con BlockRenderer. */
function ColumnBlock({ block }: { block: ColumnSimpleBlock }) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "list":
      return <ListBlock block={block} />;
    case "cta":
      return <CtaBlock block={block} />;
  }
}

export default function ColumnsBlock({ block }: { block: BlockOf<"columns"> }) {
  return (
    <div
      className={`grid grid-cols-1 gap-8 ${COLUMN_COUNT[block.columnCount]} ${blockSpacing(block.spacingTop, block.spacingBottom)}`}
    >
      {block.columns.map((column, columnIndex) => (
        <div key={columnIndex}>
          {column.map((child) => (
            <ColumnBlock key={child.id} block={child} />
          ))}
        </div>
      ))}
    </div>
  );
}
