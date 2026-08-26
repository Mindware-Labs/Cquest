import "server-only";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { sanitizePostHtml } from "@/lib/blocks";

/* En su propio módulo: guardar un borrador solo necesita contar palabras, y no
   tiene por qué arrastrar todo BlockNote al cargar la server action. */
export async function renderBlocks(blocks: unknown): Promise<string> {
  const editor = ServerBlockNoteEditor.create();
  // Lossy y no FullHTML: el completo arrastra las manijas de redimensionado.
  const html = await editor.blocksToHTMLLossy(blocks as never);
  return sanitizePostHtml(html);
}
