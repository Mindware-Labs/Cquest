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

/* Un artículo de la grilla. Sin caja: ni borde, ni sombra, ni fondo. Lo que
   separa uno del siguiente es el aire y la imagen; el "cuadrado" que se ve es
   la portada, no un contenedor dibujado alrededor del texto.

   El extracto va RECORTADO A DOS LÍNEAS, y ese detalle es la razón por la que
   puede estar acá.

   La versión anterior no lo mostraba, con un argumento correcto: en una grilla
   de tres columnas un resumen de largo libre alarga unas tarjetas más que otras
   y la fila se desalinea sola, así que la fecha de una queda a la altura del
   texto de la vecina. Pero el requisito BP-3 pide portada, categoría, título,
   extracto y fecha, y en un listado el extracto es lo que distingue dos títulos
   parecidos antes de hacer clic.

   `line-clamp-2` resuelve las dos cosas a la vez: el extracto aparece y aporta,
   y todas las tarjetas suman exactamente el mismo alto por él —dos líneas o el
   hueco de dos líneas—, así que la grilla sigue alineada. El título conserva la
   jerarquía porque el resumen va en gris y un escalón más chico.

   La entrada la maneja BlogIndexMotion por `data-blog-card`: entra cuando la
   tarjeta llega a pantalla, no cuando carga la página.

   VARIANTE `rail`: la misma tarjeta en formato vertical, para las dos columnas
   que flanquean la portada. Cambia la proporción del recorte —vertical en vez
   de apaisado— y suelta el mínimo de dos líneas del extracto, que existe para
   alinear una FILA de tarjetas y en una columna de una sola no alinea nada.

   Es una variante y no un componente aparte a propósito: si los laterales se
   compusieran distinto dejarían de leerse como artículos de la misma lista, que
   es exactamente lo que son. */
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
        {/* Proporción fija por diseño (16/10): la grilla necesita que todas las
            imágenes ocupen lo mismo, así que el recorte lo decide la maqueta y
            `fill` alcanza sin saber las dimensiones del archivo. */}
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
          {/* h3: en la página cuelga de la sección «Últimos artículos», que es
              el h2. Saltar de h1 a h2 acá dejaría dos niveles hermanos que en
              realidad son padre e hijo. */}
          <h3 className="mt-2.5 text-pretty font-heading text-[1.15rem] font-semibold leading-[1.34] tracking-[-0.015em] text-foreground">
            {post.title}
          </h3>
          {/* `min-h` además del recorte: un extracto de UNA línea dejaría la
              tarjeta un renglón más corta que sus vecinas, que es el mismo
              desalineado que el recorte vino a evitar. Con el mínimo, el bloque
              del resumen mide dos líneas siempre. */}
          <p
            className={`mt-2 line-clamp-2 text-pretty text-[0.92rem] leading-[1.45] text-[var(--text-tertiary)] ${
              isRail ? "" : "min-h-[2.9em]"
            }`}
          >
            {post.excerpt}
          </p>
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
