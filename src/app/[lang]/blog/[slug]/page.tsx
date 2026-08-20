import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import BlockRenderer from "@/components/blog/BlockRenderer";
import { formatPostDate } from "@/components/blog/date";
import { resolveLang } from "@/i18n/resolveLangParam";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";
import { blockArraySchema } from "@/lib/blocks";
import { getPostBySlug } from "@/lib/posts";
import { blogPostPageGraph } from "@/lib/schema";
import { PostStatus } from "@/generated/prisma/client";

type Params = Promise<{ lang: string; slug: string }>;

type PublicPost = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;

/* Un artículo existe públicamente solo si está publicado, ya llegó su fecha, y
   pertenece al idioma de la URL. Lo último no es un detalle: sin esa condición
   /en/blog/mi-articulo serviría el texto en español bajo una URL inglesa, que
   es exactamente el contenido duplicado que Google penaliza. */
function isVisible(post: PublicPost | null, lang: Locale): post is PublicPost {
  if (!post) return false;
  if (post.locale !== lang) return false;
  if (post.status !== PostStatus.PUBLISHED) return false;
  return post.publishedAt !== null && post.publishedAt <= new Date();
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
            categoryName: post.category.name,
          },
          lang,
        )}
      />

      <article className="pb-28 pt-32 sm:pt-36">
        <header className="mx-auto w-full max-w-[44rem] px-5 sm:px-8">
          {/* Salida del artículo hacia el listado, filtrado por su categoría:
              quien terminó de leer algo de BPO probablemente quiera más de BPO,
              no el índice completo. */}
          <LocalizedLink
            href={`/blog?categoria=${post.category.slug}`}
            className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-petroleo transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
          >
            {post.category.name}
          </LocalizedLink>
          <h1 className="mt-3 text-pretty font-heading text-[clamp(2rem,4.2vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
            {post.title}
          </h1>
          <p className="mt-5 text-pretty text-[1.15rem] leading-[1.7] text-[var(--text-secondary)]">
            {post.excerpt}
          </p>
          <time
            dateTime={post.publishedAt!.toISOString()}
            className="mt-5 block text-[0.85rem] text-[var(--text-tertiary)]"
          >
            {formatPostDate(post.publishedAt!, lang)}
          </time>
        </header>

        {/* Portada a ancho completo (BP-6), recortada a una proporción fija: es
            la única imagen del artículo donde el encuadre lo decide el diseño y
            no la foto. */}
        <div className="mx-auto mt-10 w-full max-w-[76rem] px-5 sm:px-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[var(--surface-sunken)]">
            {/* `priority`: es la imagen más grande sobre el pliegue y casi
                siempre el LCP de la página. Sin esto entra en la cola de carga
                diferida y arrastra la métrica que el requisito de "<3s" mide. */}
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt}
              fill
              priority
              sizes="(max-width: 1216px) 100vw, 1216px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Columna de lectura: ~44rem es la medida cómoda para texto largo
            (RNF-3). Los bloques a ancho completo salen de acá con márgenes
            negativos propios. */}
        <div className="mx-auto mt-14 w-full max-w-[44rem] px-5 sm:px-8">
          <BlockRenderer blocks={blocks.data} />
        </div>
      </article>
    </>
  );
}
