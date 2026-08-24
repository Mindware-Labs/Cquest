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

// Server component puro (sin estado) para que el editor del admin lo reuse como vista previa sin mantener una segunda versión. Sin `default` en el switch: un tipo nuevo en blocks.ts rompe la compilación acá hasta escribirle su caso.
function renderBlock(block: Block, preview: boolean) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    // Los tres bloques con medios se comportan distinto en previa: imagen/galería dibujan el hueco, video dibuja el hueco en vez de montar un iframe.
    case "image":
      return <ImageBlock block={block} preview={preview} />;
    case "gallery":
      return <GalleryBlock block={block} preview={preview} />;
    case "video":
      return <VideoBlock block={block} preview={preview} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "list":
      return <ListBlock block={block} />;
    case "table":
      return <TableBlock block={block} />;
    case "cta":
      return <CtaBlock block={block} />;
    case "columns":
      return <ColumnsBlock block={block} preview={preview} />;
    case "divider":
      return <DividerBlock block={block} />;
  }
}

export default function BlockRenderer({
  blocks,
  // Modo previa: solo lo encienden la vista previa del editor y la miniatura de plantilla; el artículo publicado nunca lo pasa. Prop y no contexto porque esto es un server component puro.
  preview = false,
}: {
  blocks: BlockArray;
  preview?: boolean;
}) {
  return (
    <>
      {/* Fragment y no <div>: un contenedor por bloque rompería el colapso de márgenes que espera el flujo normal del documento. */}
      {blocks.map((block) => (
        <Fragment key={block.id}>{renderBlock(block, preview)}</Fragment>
      ))}
    </>
  );
}
