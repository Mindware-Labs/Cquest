import Image from "next/image";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";
import { formatPostDate } from "./date";

type FeaturedPostData = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  publishedAt: Date | null;
  category: { name: string };
};

/* La portada: el artículo más reciente del listado (o de la categoría filtrada).
   Misma anatomía que una tarjeta de la grilla —imagen arriba, categoría, título,
   fecha— pero a ancho completo y con el título al doble de tamaño. La jerarquía
   sale de la escala, no de un tratamiento distinto: si la portada se compusiera
   de otra forma dejaría de leerse como el primero de la misma lista. */
export default function FeaturedPost({
  post,
  lang,
}: {
  post: FeaturedPostData;
  lang: Locale;
}) {
  return (
    <article className="group">
      <LocalizedLink
        href={`/blog/${post.slug}`}
        className="block rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-foreground"
      >
        {/* `data-blog-cover` es la ventana que se abre; `data-blog-cover-media`
            es la imagen que vuelve de una escala mayor por detrás. Van en dos
            elementos distintos porque el recorte y la escala tienen que poder
            moverse en sentidos opuestos. */}
        <div
          data-blog-cover
          className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-[var(--surface-sunken)] sm:aspect-[2/1]"
        >
          <Image
            data-blog-cover-media
            src={post.coverImageUrl}
            alt={post.coverImageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1120px"
            className="object-cover transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover:scale-[1.02]"
          />
        </div>

        <div className="mt-8 max-w-[46rem]">
          <p
            data-blog-featured-line
            className="text-[0.78rem] font-medium leading-none text-[var(--text-tertiary)]"
          >
            {post.category.name}
          </p>
          <h2
            data-blog-featured-line
            className="mt-3.5 text-pretty font-heading text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-foreground transition-opacity duration-200 group-hover:opacity-70"
          >
            {post.title}
          </h2>
          <p
            data-blog-featured-line
            className="mt-4 max-w-[62ch] text-pretty text-[1.02rem] leading-[1.7] text-[var(--text-secondary)]"
          >
            {post.excerpt}
          </p>
          {post.publishedAt && (
            <time
              data-blog-featured-line
              dateTime={post.publishedAt.toISOString()}
              className="mt-5 block text-[0.85rem] leading-none text-[var(--text-tertiary)]"
            >
              {formatPostDate(post.publishedAt, lang)}
            </time>
          )}
        </div>
      </LocalizedLink>
    </article>
  );
}
