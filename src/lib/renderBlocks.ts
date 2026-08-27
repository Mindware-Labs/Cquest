import "server-only";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import sanitizeHtml from "sanitize-html";

/* En su propio módulo: guardar un borrador solo necesita contar palabras, y no
   tiene por qué arrastrar todo BlockNote al cargar la server action. */
const MEDIA_TYPES = ["image", "video", "audio", "file"];

/* Solo el vocabulario que produce BlockNote. Aunque no emita scripts, el pegado
   desde otra web entra por su parser de HTML y podría traer un href hostil. */
const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "p", "strong", "em", "u", "s", "code", "pre",
  "ul", "ol", "li", "blockquote", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td", "br", "hr", "span", "div",
];

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      figure: ["data-text-alignment", "data-preview-width"],
      "*": ["data-level", "data-text-color", "data-background-color", "class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    /* Red de seguridad para lo que no pasa por el filtro de bloques: un <img>
       pegado desde fuera sin src es el mismo cuadro roto. */
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
    // Un enlace externo sin noopener deja al destino manipular la pestaña origen.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}

/* Un bloque de medios sin archivo sale como <img> sin src, que el navegador
   pinta como imagen rota. Se descarta antes de renderizar: el hueco no aporta
   nada y el texto sigue de largo. */
function withoutEmptyMedia(blocks: unknown): unknown {
  if (!Array.isArray(blocks)) return blocks;

  return blocks
    .filter((block) => {
      if (!block || typeof block !== "object") return true;
      const { type, props } = block as { type?: string; props?: { url?: string } };
      if (!type || !MEDIA_TYPES.includes(type)) return true;
      return Boolean(props?.url?.trim());
    })
    .map((block) =>
      block && typeof block === "object" && Array.isArray((block as { children?: unknown[] }).children)
        ? { ...block, children: withoutEmptyMedia((block as { children: unknown[] }).children) }
        : block,
    );
}

export async function renderBlocks(blocks: unknown): Promise<string> {
  const editor = ServerBlockNoteEditor.create();
  // Lossy y no FullHTML: el completo arrastra las manijas de redimensionado.
  const html = await editor.blocksToHTMLLossy(withoutEmptyMedia(blocks) as never);
  return sanitizePostHtml(html);
}
