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
function renderBlock(block: Block, preview: boolean) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "paragraph":
      return <ParagraphBlock block={block} />;
    /* Los tres bloques con medios son los únicos que se comportan distinto en
       una previa: los dos de imagen dibujan el hueco en vez de desaparecer, y
       el de video dibuja el hueco en vez de montar un iframe. */
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
  /* Modo previa. Lo encienden las superficies del admin que muestran cómo va a
     quedar la página —la vista previa del editor y la miniatura de una
     plantilla—, y nadie más. El artículo publicado no lo pasa nunca, así que su
     salida es byte por byte la de antes.

     La bandera vive acá y no en un contexto porque esto es un server component
     puro: pasarla como prop la deja visible en el árbol y en el tipo, que es
     exactamente lo que uno quiere de una bandera que cambia qué se ve. */
  preview = false,
}: {
  blocks: BlockArray;
  preview?: boolean;
}) {
  return (
    <>
      {/* Fragment y no <div>: un contenedor por bloque metería una caja extra
          entre el bloque y la columna de lectura, y el espaciado de PERS-1
          dejaría de colapsar como espera el flujo normal del documento. */}
      {blocks.map((block) => (
        <Fragment key={block.id}>{renderBlock(block, preview)}</Fragment>
      ))}
    </>
  );
}
