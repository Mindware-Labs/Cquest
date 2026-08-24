import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import PostArticle from "@/components/blog/PostArticle";
import { resolveLang } from "@/i18n/resolveLangParam";
import type { Locale } from "@/i18n/config";
import { blockArraySchema } from "@/lib/blocks";
import { categoryName } from "@/lib/categoryName";
import { getPostBySlug, getRelatedPosts, isPubliclyVisible } from "@/lib/posts";
import { blogPostPageGraph } from "@/lib/schema";

type Params = Promise<{ lang: string; slug: string }>;

type PublicPost = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;

/* Esta página NO lee `searchParams`, y es a propósito.
   ---------------------------------------------------------------------------

   La previsualización de borradores vive en su propia ruta (./preview) en vez
   de un `?preview=` acá. Leer `searchParams` en un Server Component lo vuelve
   dinámico: la página de cada artículo pasaría a consultar la base en cada
   visita en lugar de servirse desde caché. Pagar eso en la página más visitada
   del blog, para habilitar algo que usan tres personas del panel, es el peor
   intercambio posible.

   El plazo de revalidación es lo que hace que un artículo PROGRAMADO aparezca
   solo cuando llega su hora. La invalidación por evento no sirve para eso:
   nadie guarda nada en el momento en que el reloj cruza la fecha. Cinco minutos
   es el retraso máximo entre la hora programada y el artículo visible. */
export const revalidate = 300;

/* Un artículo existe públicamente solo si está publicado, ya llegó su fecha, y
   pertenece al idioma de la URL. Lo último no es un detalle: sin esa condición
   /en/blog/mi-articulo serviría el texto en español bajo una URL inglesa, que
   es exactamente el contenido duplicado que Google penaliza. */
function isVisible(post: PublicPost | null, lang: Locale): post is PublicPost {
  return post !== null && isPubliclyVisible(post, lang);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lang = await resolveLang(params);
  const post = await getPostBySlug(slug);
  if (!isVisible(post, lang)) return {};

  /* Cae al título/extracto del artículo cuando el admin no cargó los campos
     SEO — un artículo sin metadata es peor que uno con la metadata obvia. */
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;

  return {
    title: `${title} | Center Quest`,
    description,
    /* Canonical sola, sin hreflang: el artículo existe en un solo idioma y no
       tiene traducción. localeAlternates() declararía /es y /en como versiones
       equivalentes del mismo contenido, y una de las dos ni siquiera existe.
       Tiene que coincidir con lo que emite el sitemap para estos mismos URLs. */
    alternates: { canonical: `/${lang}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: [post.coverImageUrl],
      /* El autor, que faltaba. `article:author` es lo que usan LinkedIn y
         Facebook para atribuir la nota al escribirla en un muro. */
      authors: [post.author.name],
    },
    /* Sin esto, X/Twitter dibuja la tarjeta chica con la imagen recortada a un
       cuadrado al costado en vez de la portada a ancho completo. */
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.coverImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const lang = await resolveLang(params);

  const post = await getPostBySlug(slug);
  if (!isVisible(post, lang)) notFound();

  /* El contenido se valida al leerlo, no solo al guardarlo: la columna es Json
     y un artículo escrito con una versión vieja del schema podría no encajar.
     Si no valida, el artículo no existe para el público en vez de reventar la
     página con un error de render. */
  const blocks = blockArraySchema.safeParse(post.content);
  if (!blocks.success) notFound();

  const related = await getRelatedPosts({
    id: post.id,
    locale: post.locale,
    categoryId: post.categoryId,
  });

  return (
    <>
      <JsonLd
        data={blogPostPageGraph(
          {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            coverImageUrl: post.coverImageUrl,
            publishedAt: post.publishedAt!,
            updatedAt: post.updatedAt,
            categoryName: categoryName(post.category, lang),
          },
          lang,
        )}
      />
      <PostArticle post={post} blocks={blocks.data} lang={lang} related={related} />
    </>
  );
}
