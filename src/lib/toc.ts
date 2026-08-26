import { slugify } from "@/lib/slugify";

export type TocEntry = { id: string; label: string };

/* El HTML guardado no trae anclas: el saneador no deja pasar `id`, así que se
   inyectan al leer. Solo h2 — un índice con tres niveles compite con el texto. */
export function withHeadingIds(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const used = new Set<string>();

  const out = html.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs: string, inner: string) => {
    const label = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!label) return match;

    const root = slugify(label) || `section-${toc.length + 1}`;
    let id = root;
    for (let i = 2; used.has(id); i++) id = `${root}-${i}`;
    used.add(id);

    toc.push({ id, label });
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });

  return { html: out, toc };
}
