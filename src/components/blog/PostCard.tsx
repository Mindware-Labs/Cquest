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

// Sin caja (ni borde, sombra o fondo): lo que separa una tarjeta de otra es el aire y la imagen. El extracto va recortado a 2 líneas (line-clamp-2) para que todas las tarjetas sumen el mismo alto y la grilla no se desalinee. Variante "rail" (columnas laterales de la portada) y no un componente aparte: si se compusieran distinto dejarían de leerse como artículos de la misma lista.
export default function PostCard({
  post,
  lang,
  variant = "grid",
}: {
  post: PostCardPost;
  lang: Locale;
  variant?: "grid" | "rail";
}) {
  const isRail = variant === "rail";

  return (
    <article data-blog-card className="group">
      <LocalizedLink
        href={`/blog/${post.slug}`}
        className="block rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        {/* Proporción fija (16/10): la grilla necesita que todas las imágenes ocupen lo mismo, así que fill alcanza sin saber las dimensiones del archivo. */}
        <div
          className={`relative overflow-hidden rounded-[12px] bg-[var(--surface-sunken)] ${
            isRail ? "aspect-[16/10] lg:aspect-[3/4]" : "aspect-[16/10]"
          }`}
        >
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt}
            fill
            sizes={
              isRail
                ? "(max-width: 1024px) 100vw, 240px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            }
            className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
          />
        </div>

        <div className="mt-5">
          <p className="text-[0.78rem] font-medium leading-none text-[var(--text-tertiary)]">
            {post.category.name}
          </p>
          {/* h3: cuelga de la sección «Últimos artículos» (h2); saltar de h1 a h2 acá dejaría hermanos que en realidad son padre e hijo. */}
          <h3 className="mt-2.5 text-pretty font-heading text-[1.15rem] font-semibold leading-[1.34] tracking-[-0.015em] text-foreground">
            {post.title}
          </h3>
          {/* min-h además del recorte: un extracto de una sola línea dejaría la tarjeta más corta que sus vecinas, el mismo desalineado que el recorte evita. */}
          <p
            className={`mt-2 line-clamp-2 text-pretty text-[0.92rem] leading-[1.45] text-[var(--text-tertiary)] ${
              isRail ? "" : "min-h-[2.9em]"
            }`}
          >
            {post.excerpt}
          </p>
          {/* Regla trazada de izquierda a derecha al hover (no un text-decoration encendido): ancho propio, no el del título, para que no salte entre tarjetas de una o dos líneas. */}
          <span
            aria-hidden
            className="mt-3 block h-px w-full max-w-[3.5rem] origin-left scale-x-0 bg-foreground transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100"
          />
          {post.publishedAt && (
            <time
              dateTime={post.publishedAt.toISOString()}
              className="mt-3 block text-[0.8rem] leading-none text-[var(--text-tertiary)]"
            >
              {formatPostDate(post.publishedAt, lang)}
            </time>
          )}
        </div>
      </LocalizedLink>
    </article>
  );
}
