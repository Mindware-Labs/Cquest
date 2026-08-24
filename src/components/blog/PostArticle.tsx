import Image from "next/image";
import BlockRenderer from "@/components/blog/BlockRenderer";
import PostMotion from "@/components/blog/PostMotion";
import PostCard from "@/components/blog/PostCard";
import ShareLinks from "@/components/blog/ShareLinks";
import { formatPostDate } from "@/components/blog/date";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";
import type { Block } from "@/lib/blocks";
import { blogHref } from "@/lib/blogParams";
import { localizeCategory, type NamedCategory } from "@/lib/categoryName";
import { readingTimeLabel } from "@/lib/readingTime";

// Vive aparte de la página porque la previa usa su propia ruta (/blog/[slug]/preview) en vez de un searchParam: leer searchParams en el Server Component volvería dinámica (sin caché) también a la página pública, la más visitada del blog. Las dos rutas renderizan esto mismo, así que la previa nunca se desincroniza de lo publicado.

const BACK_LABEL: Record<Locale, string> = { es: "Blog", en: "Blog" };
const BREADCRUMB_LABEL: Record<Locale, string> = { es: "Ruta", en: "Breadcrumb" };
const RELATED_LABEL: Record<Locale, string> = { es: "Sigue leyendo", en: "Keep reading" };

const PREVIEW_NOTICE: Record<Locale, string> = {
  es: "Previsualización — este artículo todavía no es público.",
  en: "Preview — this article is not public yet.",
};

// Función y no plantilla suelta: el nombre de la categoría va en distinta posición en cada idioma, así que concatenar cadenas sueltas lo escribiría mal en uno de los dos.
const MORE_LABEL: Record<Locale, (category: string) => string> = {
  es: (category) => `Ver más artículos de ${category}`,
  en: (category) => `See more ${category} articles`,
};

export type ArticlePost = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  publishedAt: Date | null;
  author: { name: string };
  category: NamedCategory & { slug: string };
};

export type RelatedPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  publishedAt: Date | null;
  category: NamedCategory;
};

export default function PostArticle({
  post,
  blocks,
  lang,
  isPreview = false,
  related = [],
}: {
  post: ArticlePost;
  blocks: Block[];
  lang: Locale;
  isPreview?: boolean;
  related?: RelatedPost[];
}) {
  const category = localizeCategory(post.category, lang);
  const categoryHref = blogHref(lang, { category: post.category.slug });
  const publishedAt = post.publishedAt;

  return (
    <PostMotion>
      <article className="pb-28 pt-32 sm:pt-36">
        {/* El aviso de previa va arriba de todo: quien abre el enlace debe saber en la primera línea que el público todavía no ve esto. */}
        {isPreview && (
          <div className="mx-auto mb-10 w-full max-w-[46rem] px-5 sm:px-8">
            <p
              role="status"
              className="rounded-lg border border-dashed border-border bg-[var(--surface-sunken)] px-4 py-3 text-[0.85rem] font-medium text-[var(--text-secondary)]"
            >
              {PREVIEW_NOTICE[lang]}
            </p>
          </div>
        )}

        <header className="mx-auto w-full max-w-[46rem] px-5 sm:px-8">
          {/* Breadcrumb en vez de botón "atrás": ubica el artículo y da las dos salidas reales (índice completo y listado por categoría). */}
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
                  href={categoryHref}
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                >
                  {category.name}
                </LocalizedLink>
              </li>
            </ol>
          </nav>

          {/* Límite en ch y no rem: hay que acotar caracteres por línea, no un ancho fijo que no escala con el tamaño de fuente. */}
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

          {/* El tiempo de lectura va acá y no al final: la pregunta que contesta (¿lo leo ahora?) se hace antes de empezar. */}
          <div
            data-post-line
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5 text-[0.85rem] text-[var(--text-tertiary)]"
          >
            <span className="font-medium text-[var(--text-secondary)]">{post.author.name}</span>
            {publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={publishedAt.toISOString()}>
                  {formatPostDate(publishedAt, lang)}
                </time>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{readingTimeLabel(blocks, lang)}</span>

            {/* No se comparte una previa: sería publicar un borrador por la puerta de atrás. */}
            {!isPreview && (
              <span className="ms-auto">
                <ShareLinks lang={lang} title={post.title} path={`/${lang}/blog/${post.slug}`} />
              </span>
            )}
          </div>
        </header>

        {/* Portada a ancho completo (BP-6), única imagen del artículo donde el encuadre lo decide el diseño y no la foto. */}
        <div className="mx-auto mt-10 w-full max-w-[76rem] px-5 sm:px-8">
          <div
            data-post-cover
            className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[var(--surface-sunken)]"
          >
            {/* priority: casi siempre es el LCP de la página; sin esto entra en carga diferida y arrastra la métrica de "<3s". */}
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

        {/* Columna de lectura: ~44rem es la medida cómoda para texto largo (RNF-3); los bloques a ancho completo usan márgenes negativos propios. */}
        <div data-post-body className="mx-auto mt-14 w-full max-w-[44rem] px-5 sm:px-8">
          <BlockRenderer blocks={blocks} />
        </div>

        {/* Final del artículo: una salida, no un muro; se puede seguir en algo relacionado sin usar el botón atrás. */}
        <footer className="mx-auto mt-20 w-full max-w-[46rem] px-5 sm:px-8">
          <div className="border-t border-border pt-8">
            <LocalizedLink
              href={categoryHref}
              className="group inline-flex items-center gap-2 font-heading text-[1.05rem] font-semibold text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              {MORE_LABEL[lang](category.name)}
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

        {/* Sólo si hay algo real que ofrecer; getRelatedPosts completa con lo más reciente del idioma cuando la categoría no alcanza. */}
        {related.length > 0 && (
          <section
            aria-labelledby="post-related"
            className="mx-auto mt-24 w-full max-w-[70rem] px-5 sm:px-8"
          >
            <h2
              id="post-related"
              className="border-t border-border pt-8 text-[0.82rem] font-semibold text-[var(--text-tertiary)]"
            >
              {RELATED_LABEL[lang]}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard
                  key={item.id}
                  post={{ ...item, category: localizeCategory(item.category, lang) }}
                  lang={lang}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </PostMotion>
  );
}
