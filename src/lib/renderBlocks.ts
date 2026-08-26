import "server-only";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { sanitizePostHtml } from "@/lib/blocks";

/* En su propio módulo: guardar un borrador solo necesita contar palabras, y no
   tiene por qué arrastrar todo BlockNote al cargar la server action. */
const MEDIA_TYPES = ["image", "video", "audio", "file"];

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
