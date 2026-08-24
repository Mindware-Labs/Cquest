import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostArticle from "@/components/blog/PostArticle";
import { resolveLang } from "@/i18n/resolveLangParam";
import { blockArraySchema } from "@/lib/blocks";
import { getPostBySlug } from "@/lib/posts";
import { PREVIEW_PARAM, verifyPreviewToken } from "@/lib/previewToken";

/* Previsualización de un artículo que todavía no es público.
   ---------------------------------------------------------------------------

   Antes no existía, y la alternativa real que quedaba era publicar, mandar el
   enlace y esconderlo después — o sea sacar a la web algo que nadie revisó.

   Ruta propia y no un `?preview=` sobre la página pública: leer `searchParams`
   allá la volvería dinámica y cada artículo consultaría la base en cada visita.
   Acá el costo de ser dinámico no importa, porque a esta ruta entran tres
   personas del panel y nadie más.

   Renderiza el MISMO componente que la página pública, así que lo que se
   revisa es literalmente lo que se va a publicar — que es el único requisito
   que una previa tiene que cumplir.

   El token es un HMAC del id del artículo firmado con el secreto de sesión:
   autoriza este artículo y nada más, vence en una semana, y revocar todos los
   enlaces vivos es rotar el secreto. */

type Params = Promise<{ lang: string; slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

/* Un borrador NO se indexa, y esto es lo que lo garantiza. Sin el noindex, un
   enlace compartido por chat o pegado en un ticket puede terminar rastreado, y
   entonces el borrador acaba en Google — que es exactamente lo que estos
   enlaces existen para evitar. */
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

  /* El idioma se exige incluso con token: el artículo se renderiza con las
     etiquetas de su propia página, y verlo bajo la URL equivocada mostraría una
     previa que no se parece a lo que se va a publicar. */
  if (post.locale !== lang) notFound();

  /* Sin token válido esta ruta no existe. Un 404 y no un 403: decir "no
     autorizado" confirma que el artículo existe, y el slug de un borrador puede
     ser información que todavía no se quiere dar. */
  if (!verifyPreviewToken(token, post.id)) notFound();

  const blocks = blockArraySchema.safeParse(post.content);
  if (!blocks.success) notFound();

  /* Sin relacionados y sin datos estructurados: lo que se está revisando es el
     artículo, no la navegación, y declararle a Google un BlogPosting que
     responde 404 a cualquiera sin token es ofrecerle un dato que no puede
     verificar. */
  return <PostArticle post={post} blocks={blocks.data} lang={lang} isPreview />;
}
