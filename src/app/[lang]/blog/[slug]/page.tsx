import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import BlockRenderer from "@/components/blog/BlockRenderer";
import PostMotion from "@/components/blog/PostMotion";
import { formatPostDate } from "@/components/blog/date";
import { resolveLang } from "@/i18n/resolveLangParam";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";
import { blockArraySchema } from "@/lib/blocks";
import { getPostBySlug } from "@/lib/posts";
import { blogPostPageGraph } from "@/lib/schema";
import { PostStatus } from "@/generated/prisma/client";

type Params = Promise<{ lang: string; slug: string }>;

const BACK_LABEL: Record<Locale, string> = { es: "Blog", en: "Blog" };

const BREADCRUMB_LABEL: Record<Locale, string> = { es: "Ruta", en: "Breadcrumb" };

/* Función y no plantilla suelta: en inglés el nombre de la categoría va al final
   y en español al medio. Concatenar cadenas sueltas daría "Más de" + nombre en
   los dos idiomas y uno de los dos quedaría mal escrito. */
const MORE_LABEL: Record<Locale, (category: string) => string> = {
  es: (category) => `Ver más artículos de ${category}`,
  en: (category) => `See more ${category} articles`,
};

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

      <PostMotion>
      <article className="pb-28 pt-32 sm:pt-36">
        <header className="mx-auto w-full max-w-[46rem] px-5 sm:px-8">
          {/* Ruta en vez de un botón "atrás": una flecha de retroceso repite lo
              que ya hace el navegador y no dice nada de dónde está uno. El
              breadcrumb ubica el artículo y da las dos salidas reales — el
              índice completo y el listado filtrado por su categoría. */}
          <nav data-post-line aria-label={BREADCRUMB_LABEL[lang]}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.82rem] font-medium text-[var(--text-tertiary)]">
              <li>
                <LocalizedLink
                  href="/blog"
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  {BACK_LABEL[lang]}
                </LocalizedLink>
              </li>
              <li aria-hidden="true" className="text-border">
                /
              </li>
              <li>
                <LocalizedLink
                  href={`/blog?categoria=${post.category.slug}`}
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  {post.category.name}
                </LocalizedLink>
              </li>
            </ol>
          </nav>

          {/* El límite en `ch` y no en `rem`: lo que hay que acotar es la
              cantidad de caracteres por línea, y eso no cambia con el tamaño de
              fuente como sí lo haría una medida fija. */}
          <h1
            data-post-title
            className="mt-6 max-w-[20ch] text-balance font-heading text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-foreground"
          >
            {post.title}
          </h1>
          <p
            data-post-line
            className="mt-6 max-w-[56ch] text-pretty text-[1.15rem] leading-[1.7] text-[var(--text-secondary)]"
          >
            {post.excerpt}
          </p>

          {/* Autor y fecha en una línea sobre una regla fina: la firma cierra la
              cabecera y separa el preámbulo del cuerpo sin meter otra caja. */}
          <div
            data-post-line
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-5 text-[0.85rem] text-[var(--text-tertiary)]"
          >
            <span className="font-medium text-[var(--text-secondary)]">{post.author.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt!.toISOString()}>
              {formatPostDate(post.publishedAt!, lang)}
            </time>
          </div>
        </header>

        {/* Portada a ancho completo (BP-6), recortada a una proporción fija: es
            la única imagen del artículo donde el encuadre lo decide el diseño y
            no la foto. */}
        <div className="mx-auto mt-10 w-full max-w-[76rem] px-5 sm:px-8">
          <div
            data-post-cover
            className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[var(--surface-sunken)]"
          >
            {/* `priority`: es la imagen más grande sobre el pliegue y casi
                siempre el LCP de la página. Sin esto entra en la cola de carga
                diferida y arrastra la métrica que el requisito de "<3s" mide. */}
            <Image
              data-post-cover-media
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
        <div data-post-body className="mx-auto mt-14 w-full max-w-[44rem] px-5 sm:px-8">
          <BlockRenderer blocks={blocks.data} />
        </div>

        {/* Final del artículo: una salida, no un muro. Quien terminó de leer
            tiene que poder seguir en algo relacionado sin volver con el botón
            del navegador. */}
        <footer className="mx-auto mt-20 w-full max-w-[46rem] px-5 sm:px-8">
          <div className="border-t border-border pt-8">
            <LocalizedLink
              href={`/blog?categoria=${post.category.slug}`}
              className="group inline-flex items-center gap-2 font-heading text-[1.05rem] font-semibold text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              {MORE_LABEL[lang](post.category.name)}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </LocalizedLink>
          </div>
        </footer>
      </article>
      </PostMotion>
    </>
  );
}
