import "server-only";
import sanitizeHtml from "sanitize-html";

/* Los bloques son la fuente de verdad; el HTML es un snapshot que se genera al
   publicar para que el sitio público no cargue el editor. */
type Block = { type?: string; content?: unknown; children?: unknown[]; props?: Record<string, unknown> };

const WORDS_PER_MINUTE = 200;

export function blocksToText(blocks: unknown): string {
  const out: string[] = [];

  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    const block = node as Block & { text?: string };
    if (typeof block.text === "string") out.push(block.text);
    if (block.content) walk(block.content);
    if (block.children) walk(block.children);
  };

  walk(blocks);
  return out.join(" ").replace(/\s+/g, " ").trim();
}

export function readingMinutes(blocks: unknown): number {
  const words = blocksToText(blocks).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

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
