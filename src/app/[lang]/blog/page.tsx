import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import { getPublishedCategories, getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";
import FeaturedPost from "@/components/blog/FeaturedPost";
import CategoryFilter from "@/components/blog/CategoryFilter";
import BlogIndexMotion from "@/components/blog/BlogIndexMotion";

const TITLE: Record<Locale, string> = {
  en: "Blog | Center Quest",
  es: "Blog | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Notes from the operation: call center, BPO and systems development for companies in the Dominican Republic and the United States.",
  es: "Notas desde la operación: call center, BPO y desarrollo de sistemas para empresas en República Dominicana y Estados Unidos.",
};

const COPY: Record<
  Locale,
  {
    heading: string;
    latest: string;
    empty: string;
    emptyFiltered: string;
    emptyHint: string;
  }
> = {
  en: {
    heading: "Ideas and perspectives from inside the operation.",
    latest: "Latest articles",
    empty: "No articles published yet.",
    emptyFiltered: "No articles in this category yet.",
    emptyHint: "New pieces are published as the operation has something worth telling.",
  },
  es: {
    heading: "Ideas y perspectivas desde adentro de la operación.",
    latest: "Últimos artículos",
    empty: "Todavía no hay artículos publicados.",
    emptyFiltered: "Todavía no hay artículos en esta categoría.",
    emptyHint: "Publicamos cuando la operación tiene algo que valga la pena contar.",
  },
};

/* 70rem y no el contenedor de 84rem del sitio: con tres columnas de tarjeta,
   84rem deja cada portada tan ancha que el título de abajo queda flotando en
   una línea de texto muy corta contra una imagen enorme. */
const CONTAINER = "mx-auto w-full max-w-[70rem] px-5 sm:px-8";

type Params = Promise<{ lang: string }>;
type Search = Promise<{ categoria?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/blog"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const lang = await resolveLang(params);
  const { categoria } = await searchParams;

  const [categories, posts] = await Promise.all([
    getPublishedCategories(lang),
    getPublishedPosts(lang, categoria),
  ]);

  /* Un slug inexistente en la URL no es un error: se ignora y el filtro vuelve
     a "Todos", en vez de dejar la interfaz marcando algo que no existe. */
  const activeSlug = categories.some((category) => category.slug === categoria)
    ? (categoria ?? null)
    : null;

  const copy = COPY[lang];

  /* El primero de la lista encabeza la página. Se destaca también dentro de una
     categoría filtrada: ahí el "más reciente" sigue existiendo, y degradar la
     portada a una fila más de la grilla solo porque hay un filtro puesto haría
     que la página cambie de forma sin motivo.
     Con un único artículo no hay grilla: el destacado ES la página. */
  const [featured, ...rest] = posts;

  return (
    <BlogIndexMotion>
      {/* ---------- Cabecera ---------- */}
      {/* Hoja blanca de arriba abajo: sin campo de color, sin rótulo encima del
          titular. La palabra "Blog" ya está en la navegación y en el título de
          la pestaña; repetirla en un eyebrow gasta la primera línea de la
          página en decir dónde estás en vez de decir qué vas a encontrar. */}
      <header className={`${CONTAINER} pb-9 pt-32 sm:pb-11 sm:pt-40`}>
        {/* El ancho máximo en `ch` y no en `rem`: lo que hay que limitar es la
            cantidad de caracteres por línea, y eso no cambia con el tamaño de
            fuente como sí lo haría una medida fija. */}
        <h1
          data-blog-title
          className="max-w-[20ch] text-balance font-heading text-[clamp(2.4rem,5.2vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.032em] text-foreground"
        >
          {copy.heading}
        </h1>
        <p
          data-blog-lead
          className="mt-6 max-w-[58ch] text-pretty text-[1.05rem] leading-[1.75] text-[var(--text-secondary)]"
        >
          {DESCRIPTION[lang]}
        </p>
      </header>

      {/* ---------- Categorías ---------- */}
      {/* Barra pegajosa al tope: en un índice largo, un filtro que se va con el
          scroll obliga a volver arriba para cambiar de categoría. La línea
          inferior la lleva la barra y no cada pestaña, así el subrayado de la
          activa se apoya sobre un riel continuo. */}
      {categories.length > 1 && (
        <div data-blog-rail className="cq-blog-filters">
          <div className={CONTAINER}>
            <CategoryFilter categories={categories} activeSlug={activeSlug} lang={lang} />
          </div>
        </div>
      )}

      <div className={`${CONTAINER} pb-32`}>
        {posts.length === 0 ? (
          <div className="py-28 text-center sm:py-36">
            <p className="font-heading text-[1.35rem] font-semibold tracking-[-0.02em] text-foreground">
              {activeSlug ? copy.emptyFiltered : copy.empty}
            </p>
            <p className="mx-auto mt-4 max-w-[46ch] text-[0.98rem] leading-relaxed text-[var(--text-tertiary)]">
              {copy.emptyHint}
            </p>
          </div>
        ) : (
          <>
            {/* ---------- Portada ---------- */}
            <section aria-labelledby="blog-featured" className="pt-11 sm:pt-14">
              <h2 id="blog-featured" className="sr-only">
                {featured.title}
              </h2>
              <FeaturedPost post={featured} lang={lang} />
            </section>

            {/* ---------- Resto ---------- */}
            {rest.length > 0 && (
              <section aria-labelledby="blog-latest" className="mt-24 sm:mt-28">
                {/* Un rótulo chico sobre una línea, no un titular: el que manda
                    en esta zona es el título de cada artículo. */}
                <h2
                  id="blog-latest"
                  className="border-t border-border pt-8 text-[0.82rem] font-semibold text-[var(--text-tertiary)]"
                >
                  {copy.latest}
                </h2>

                {/* El salto vertical (gap-y) es casi el doble del horizontal:
                    con ambos iguales la grilla se lee como una cuadrícula de
                    cajas, y con la vertical más generosa se lee como filas de
                    artículos, que es lo que es. */}
                <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
                  {rest.map((post) => (
                    <PostCard key={post.id} post={post} lang={lang} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </BlogIndexMotion>
  );
}
