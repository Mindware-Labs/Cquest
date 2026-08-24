import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostArticle from "@/components/blog/PostArticle";
import { resolveLang } from "@/i18n/resolveLangParam";
import { blockArraySchema } from "@/lib/blocks";
import { getPostBySlug } from "@/lib/posts";
import { PREVIEW_PARAM, verifyPreviewToken } from "@/lib/previewToken";

// Ruta propia, no ?preview= en la página pública: leer searchParams ahí la volvería dinámica para todos los visitantes, no sólo estas tres personas del panel. Token: HMAC del id firmado con el secreto de sesión, vence en una semana; rotar el secreto revoca todos los enlaces vivos.

type Params = Promise<{ lang: string; slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

// Sin noindex, un enlace compartido por chat o pegado en un ticket puede terminar rastreado y el borrador acaba en Google.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BlogPostPreviewPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const lang = await resolveLang(params);
  const token = firstParam((await searchParams)[PREVIEW_PARAM]);

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // El idioma se exige incluso con token: verlo bajo la URL equivocada mostraría una previa que no se parece a lo publicado.
  if (post.locale !== lang) notFound();

  // 404 y no 403: un "no autorizado" confirmaría que el artículo existe, y el slug de un borrador es información que no se quiere dar.
  if (!verifyPreviewToken(token, post.id)) notFound();

  const blocks = blockArraySchema.safeParse(post.content);
  if (!blocks.success) notFound();

  // Sin relacionados ni datos estructurados: declararle a Google un BlogPosting que responde 404 sin token es un dato que no puede verificar.
  return <PostArticle post={post} blocks={blocks.data} lang={lang} isPreview />;
}
