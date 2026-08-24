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

// Esta página NO lee searchParams a propósito (la previa de borradores vive en ./preview): leerlo volvería dinámica la página más visitada del blog. revalidate=300 es el retraso máximo hasta que un artículo PROGRAMADO se hace visible.
export const revalidate = 300;

// Incluye el idioma de la URL: sin esa condición /en/blog/x podría servir el texto en español, que es contenido duplicado que Google penaliza.
function isVisible(post: PublicPost | null, lang: Locale): post is PublicPost {
  return post !== null && isPubliclyVisible(post, lang);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lang = await resolveLang(params);
  const post = await getPostBySlug(slug);
  if (!isVisible(post, lang)) return {};

  // Cae al título/extracto del artículo si el admin no cargó los campos SEO: peor un artículo sin metadata que con la obvia.
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;

  return {
    title: `${title} | Center Quest`,
    description,
    // Canonical sola, sin hreflang: el artículo no tiene traducción, y localeAlternates() declararía /es y /en como equivalentes cuando uno no existe.
    alternates: { canonical: `/${lang}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: [post.coverImageUrl],
      // article:author es lo que usan LinkedIn y Facebook para atribuir la nota al compartirla.
      authors: [post.author.name],
    },
    // Sin esto, X/Twitter dibuja la tarjeta chica con la imagen recortada en vez de la portada a ancho completo.
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

  // Se valida al leerlo, no solo al guardarlo: la columna es Json y un artículo con schema viejo podría no encajar. Si no valida, 404 en vez de reventar el render.
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
