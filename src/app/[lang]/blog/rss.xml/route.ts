import { blockArraySchema, extractText } from "@/lib/blocks";
import { categoryName } from "@/lib/categoryName";
import { isLocale, type Locale } from "@/i18n/config";
import { getAllPublishedPosts } from "@/lib/posts";

// Un feed por idioma: uno solo mezclado le entregaría a un lector en inglés artículos en español. XML a mano y no una librería: son treinta líneas de un formato congelado desde 2003.

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example").replace(/\/$/, "");

const TITLE: Record<Locale, string> = {
  es: "Blog de Center Quest",
  en: "Center Quest Blog",
};

const DESCRIPTION: Record<Locale, string> = {
  es: "Notas desde la operación: call center, BPO y desarrollo de sistemas.",
  en: "Notes from the operation: call center, BPO and systems development.",
};

const LANG_TAG: Record<Locale, string> = { es: "es-DO", en: "en-US" };

// Sin escapar estos caracteres, un título con "&" o comillas rompe el documento XML entero, no solo ese artículo.
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// RFC 822, no ISO 8601: es lo que exige RSS 2.0, incluso para un feed en español.
function rfc822(date: Date): string {
  return date.toUTCString();
}

// Se recalcula cada hora y no en cada request: un lector de feeds no necesita el artículo al segundo.
export const revalidate = 3600;

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) {
    return new Response("Not found", { status: 404 });
  }
  const lang: Locale = raw;

  const posts = await getAllPublishedPosts(lang);
  const feedUrl = `${SITE_URL}/${lang}/blog/rss.xml`;

  const items = posts
    .map((post) => {
      // El extracto es el resumen curado; el texto del artículo es el respaldo, recortado para que el feed no cargue el artículo entero.
      const parsed = blockArraySchema.safeParse(post.content);
      const description =
        post.excerpt || (parsed.success ? extractText(parsed.data).slice(0, 280) : "");

      const url = `${SITE_URL}/${lang}/blog/${post.slug}`;

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        // isPermaLink="false": el guid identifica el artículo aunque su URL cambie; si fuera la URL, renombrar el slug lo mostraría como nuevo otra vez.
        `      <guid isPermaLink="false">centerquest-post-${post.id}</guid>`,
        `      <pubDate>${rfc822(post.publishedAt!)}</pubDate>`,
        `      <category>${escapeXml(categoryName(post.category, lang))}</category>`,
        `      <dc:creator>${escapeXml(post.author.name)}</dc:creator>`,
        `      <description>${escapeXml(description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escapeXml(TITLE[lang])}</title>`,
    `    <link>${SITE_URL}/${lang}/blog</link>`,
    `    <description>${escapeXml(DESCRIPTION[lang])}</description>`,
    `    <language>${LANG_TAG[lang]}</language>`,
    // atom:link rel="self" dice dónde vive el feed: los validadores lo exigen y los agregadores lo usan para no duplicar suscripciones.
    `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    posts[0]?.publishedAt ? `    <lastBuildDate>${rfc822(posts[0].publishedAt)}</lastBuildDate>` : "",
    items,
    "  </channel>",
    "</rss>",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
