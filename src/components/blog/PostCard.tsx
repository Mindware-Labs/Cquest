import Image from "next/image";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";
import { formatPostDate } from "./date";

type PostCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  publishedAt: Date | null;
  category: { name: string };
};

export default function PostCard({ post, lang }: { post: PostCardPost; lang: Locale }) {
  return (
    <article className="group">
      <LocalizedLink
        href={`/blog/${post.slug}`}
        className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petroleo"
      >
        {/* Proporción fija por diseño (16/10): la grilla necesita tarjetas de
            la misma altura, así que el recorte lo decide la maqueta y `fill`
            alcanza sin saber las dimensiones del archivo. */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[var(--surface-sunken)]">
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
            className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
          />
        </div>

        <div className="mt-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-petroleo">
            {post.category.name}
          </p>
          <h2 className="mt-2 text-pretty font-heading text-[1.25rem] font-semibold leading-snug tracking-[-0.015em] text-foreground">
            {post.title}
          </h2>
          <p className="mt-2.5 text-pretty text-[0.95rem] leading-[1.7] text-[var(--text-secondary)]">
            {post.excerpt}
          </p>
          {post.publishedAt && (
            <time
              dateTime={post.publishedAt.toISOString()}
              className="mt-3 block text-[0.8rem] text-[var(--text-tertiary)]"
            >
              {formatPostDate(post.publishedAt, lang)}
            </time>
          )}
        </div>
      </LocalizedLink>
    </article>
  );
}
