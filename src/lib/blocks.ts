import "server-only";

/* Los bloques son la fuente de verdad; el HTML es un snapshot que se genera al
   publicar para que el sitio público no cargue el editor.
   Sin dependencias externas a propósito: readingMinutes lo usa cada guardado
   de borrador (savePost), y savePost no tiene por qué arrastrar sanitize-html
   ni BlockNote solo por vivir en el mismo módulo que ellos — ver renderBlocks.ts. */
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
