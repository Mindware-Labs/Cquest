import { Fragment } from "react";
import type { Block, BlockArray } from "@/lib/blocks";
import HeadingBlock from "./blocks/HeadingBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import ImageBlock from "./blocks/ImageBlock";
import GalleryBlock from "./blocks/GalleryBlock";
import VideoBlock from "./blocks/VideoBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import ListBlock from "./blocks/ListBlock";
import TableBlock from "./blocks/TableBlock";
import CtaBlock from "./blocks/CtaBlock";
import ColumnsBlock from "./blocks/ColumnsBlock";
import DividerBlock from "./blocks/DividerBlock";

/* Server component puro y sin estado: entra un arreglo de bloques ya validado,
   sale JSX. Esa es la condición para que el editor del admin pueda usar este
   mismo renderer como vista previa (PERS-5) en vez de mantener una segunda
   versión que se desincroniza.

   El switch no lleva `default`: como Block es un discriminated union, agregar
   un tipo nuevo en blocks.ts rompe la compilación acá hasta que se le escriba
   su caso. Un `default` silenciaría justo ese aviso. */
function renderBlock(block: Block) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "gallery":
      return <GalleryBlock block={block} />;
    case "video":
      return <VideoBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "list":
      return <ListBlock block={block} />;
    case "table":
      return <TableBlock block={block} />;
    case "cta":
      return <CtaBlock block={block} />;
    case "columns":
      return <ColumnsBlock block={block} />;
    case "divider":
      return <DividerBlock block={block} />;
  }
}

export default function BlockRenderer({ blocks }: { blocks: BlockArray }) {
  return (
    <>
      {/* Fragment y no <div>: un contenedor por bloque metería una caja extra
          entre el bloque y la columna de lectura, y el espaciado de PERS-1
          dejaría de colapsar como espera el flujo normal del documento. */}
      {blocks.map((block) => (
        <Fragment key={block.id}>{renderBlock(block)}</Fragment>
      ))}
    </>
  );
}
