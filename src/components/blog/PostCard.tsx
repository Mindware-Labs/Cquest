import Image from "next/image";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import type { Locale } from "@/i18n/config";
import { formatPostDate } from "./date";

type PostCardPost = {
  slug: string;
  title: string;
  coverImageUrl: string;
  coverImageAlt: string;
  publishedAt: Date | null;
  category: { name: string };
};

/* Un artículo de la grilla. Sin caja: ni borde, ni sombra, ni fondo. Lo que
   separa uno del siguiente es el aire y la imagen; el "cuadrado" que se ve es
   la portada, no un contenedor dibujado alrededor del texto.

   Sin extracto a propósito. En una grilla de tres columnas el resumen alarga
   las tarjetas, las desalinea entre sí cuando los títulos ocupan distinto
   número de líneas, y compite con lo único que hay que leer para decidir si
   entrar: el título. El extracto vive en la portada, donde hay ancho para él.

   La entrada la maneja BlogIndexMotion por `data-blog-card`: entra cuando la
   tarjeta llega a pantalla, no cuando carga la página. */
export default function PostCard({ post, lang }: { post: PostCardPost; lang: Locale }) {
  return (
    <article data-blog-card className="group">
      <LocalizedLink
        href={`/blog/${post.slug}`}
        className="block rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        {/* Proporción fija por diseño (16/10): la grilla necesita que todas las
            imágenes ocupen lo mismo, así que el recorte lo decide la maqueta y
            `fill` alcanza sin saber las dimensiones del archivo. */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-[var(--surface-sunken)]">
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
          />
        </div>

        <div className="mt-5">
          <p className="text-[0.78rem] font-medium leading-none text-[var(--text-tertiary)]">
            {post.category.name}
          </p>
          {/* h3: en la página cuelga de la sección «Últimos artículos», que es
              el h2. Saltar de h1 a h2 acá dejaría dos niveles hermanos que en
              realidad son padre e hijo. */}
          <h3 className="mt-2.5 text-pretty font-heading text-[1.15rem] font-semibold leading-[1.34] tracking-[-0.015em] text-foreground">
            {post.title}
          </h3>
          {/* La regla se dibuja de izquierda a derecha al pasar el puntero. Es
              el subrayado de un enlace, pero trazado en vez de encendido: dice
              lo mismo que un `text-decoration` y se lee como un gesto y no como
              un cambio de estilo. Ancho propio, no el del título, para que no
              salte entre una tarjeta de una línea y otra de dos. */}
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
