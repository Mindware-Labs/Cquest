import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import { getPublishedCategories, getPublishedPosts } from "@/lib/posts";
import { localizeCategory } from "@/lib/categoryName";
import { blogHref, readCategory, readPage, type BlogSearchParams } from "@/lib/blogParams";
import PostCard from "@/components/blog/PostCard";
import FeaturedPost from "@/components/blog/FeaturedPost";
import CategoryFilter from "@/components/blog/CategoryFilter";
import BlogPagination from "@/components/blog/BlogPagination";
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
    page: (page: number, total: number) => string;
  }
> = {
  en: {
    heading: "Ideas and perspectives from inside the operation.",
    latest: "Latest articles",
    empty: "No articles published yet.",
    emptyFiltered: "No articles in this category yet.",
    emptyHint: "New pieces are published as the operation has something worth telling.",
    page: (page, total) => `Page ${page} of ${total}`,
  },
  es: {
    heading: "Ideas y perspectivas desde adentro de la operación.",
    latest: "Últimos artículos",
    empty: "Todavía no hay artículos publicados.",
    emptyFiltered: "Todavía no hay artículos en esta categoría.",
    emptyHint: "Publicamos cuando la operación tiene algo que valga la pena contar.",
    page: (page, total) => `Página ${page} de ${total}`,
  },
};

// Sin el número de página en el <title>, varias URLs comparten titular y Google las trata como duplicados.
const PAGE_SUFFIX: Record<Locale, (page: number) => string> = {
  es: (page) => ` — Página ${page}`,
  en: (page) => ` — Page ${page}`,
};

// 70rem y no el contenedor de 84rem del sitio: con tres columnas, 84rem deja cada portada demasiado ancha para su título.
const CONTAINER = "mx-auto w-full max-w-[70rem] px-5 sm:px-8";

type Params = Promise<{ lang: string }>;
type Search = Promise<BlogSearchParams>;

// revalidatePath no sirve para artículos programados (nadie guarda nada cuando el reloj cruza la fecha); este plazo es el retraso máximo hasta que aparecen.
export const revalidate = 300;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> {
  const lang = await resolveLang(params);
  const search = await searchParams;
  const page = readPage(search, lang);
  const category = readCategory(search, lang);

  // El canonical apunta a la propia página, no a /blog: cada página tiene artículos distintos, colapsarlas le diría a Google que el resto no existe.
  const suffix = page > 1 ? PAGE_SUFFIX[lang](page) : "";
  const canonicalPath = blogHref(lang, { category, page });

  return {
    title: `${TITLE[lang]}${suffix}`,
    description: DESCRIPTION[lang],
    alternates:
      page > 1 || category
        ? { canonical: `/${lang}${canonicalPath}` }
        : localeAlternates(lang, "/blog"),
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
  const search = await searchParams;
  const categoria = readCategory(search, lang);
  const requestedPage = readPage(search, lang);

  const [rawCategories, { posts, page, pageCount, total }] = await Promise.all([
    getPublishedCategories(lang),
    getPublishedPosts(lang, categoria, requestedPage),
  ]);

  // El orden alfabético se recalcula DESPUÉS de traducir: si no, una lista en inglés sale desordenada.
  const categories = rawCategories
    .map((category) => localizeCategory(category, lang))
    .sort((a, b) => a.name.localeCompare(b.name, lang));

  // Un slug inexistente en la URL no es un error: se ignora y el filtro vuelve a "Todos".
  const activeSlug = categories.some((category) => category.slug === categoria)
    ? (categoria ?? null)
    : null;

  const copy = COPY[lang];

  // Con una sola categoría CategoryFilter devuelve null; hace falta saberlo antes para decidir qué elemento carga el hueco bajo el navbar.
  const hasFilters = categories.length > 1;

  // El destacado sólo existe en la primera página: agrandar el primero de cualquier otra inventaría una jerarquía que no existe.
  const isFirstPage = page === 1;
  const [featured, ...rest] = posts;

  // Portada en trío (destacado + 2 laterales) para no empujar todo fuera de la primera pantalla; sólo se arma con 3+ posts, si no la columna lateral quedaría vacía.
  const hasTrio = isFirstPage && posts.length >= 3;
  const rail = hasTrio ? rest.slice(0, 2) : [];
  const grid = isFirstPage ? rest.slice(hasTrio ? 2 : 0) : posts;

  return (
    <BlogIndexMotion>
      {/* Feed declarado en el <head>: lo encuentran solos el botón de suscripción del navegador y los lectores de feeds. */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={TITLE[lang]}
        href={`/${lang}/blog/rss.xml`}
      />

      {/* Categorías arriba del titular: mantiene la primera pantalla compacta. Sticky para no obligar a volver arriba a cambiar de categoría. */}
      {/* Hueco bajo el navbar en MARGEN y no en relleno: el relleno de un elemento sticky viaja con él y lo volvería un bloque de 8rem al quedar fijo. */}
      {hasFilters && (
        <div data-blog-rail className="cq-blog-filters mt-28 sm:mt-32">
          <div className={CONTAINER}>
            <CategoryFilter categories={categories} activeSlug={activeSlug} lang={lang} />
          </div>
        </div>
      )}

      {/* Sin eyebrow "Blog": ya está en la navegación y el título de la pestaña, repetirlo gastaría la primera línea. Título y bajada en dos columnas desde escritorio para no sumar renglones apilados. */}
      <header
        // Sin barra de categorías, este encabezado es el primer elemento y le toca despejar el navbar fijo.
        className={`${CONTAINER} grid items-end gap-x-12 gap-y-5 pb-8 sm:pb-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] ${
          hasFilters ? "pt-10 sm:pt-12" : "pt-28 sm:pt-32"
        }`}
      >
        {/* Ancho máximo en ch, no rem: limita caracteres por línea, algo que no cambia con el tamaño de fuente. */}
        <h1
          data-blog-title
          className="max-w-[20ch] text-balance font-heading text-[clamp(2.1rem,4.4vw,3.3rem)] font-semibold leading-[1.06] tracking-[-0.032em] text-foreground"
        >
          {copy.heading}
        </h1>
        <p
          data-blog-lead
          className="max-w-[52ch] text-pretty text-[1rem] leading-[1.7] text-[var(--text-secondary)] lg:pb-2"
        >
          {DESCRIPTION[lang]}
        </p>
      </header>

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
            {isFirstPage && featured && (
              <section aria-labelledby="blog-featured" className="pt-9 sm:pt-11">
                <h2 id="blog-featured" className="sr-only">
                  {featured.title}
                </h2>

                {/* items-start y no stretch: estirar cada artículo a la altura del más alto abriría huecos con el texto. En móvil se apila con el destacado primero; la grilla lo recoloca en escritorio. */}
                {hasTrio ? (
                  <div className="grid gap-x-7 gap-y-12 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.62fr)_minmax(0,0.74fr)] lg:items-start">
                    <div className="order-2 lg:order-1">
                      <PostCard
                        post={{ ...rail[0], category: localizeCategory(rail[0].category, lang) }}
                        lang={lang}
                        variant="rail"
                      />
                    </div>

                    <div className="order-1 lg:order-2">
                      <FeaturedPost
                        post={{ ...featured, category: localizeCategory(featured.category, lang) }}
                        lang={lang}
                      />
                    </div>

                    <div className="order-3">
                      <PostCard
                        post={{ ...rail[1], category: localizeCategory(rail[1].category, lang) }}
                        lang={lang}
                        variant="rail"
                      />
                    </div>
                  </div>
                ) : (
                  <FeaturedPost
                    post={{ ...featured, category: localizeCategory(featured.category, lang) }}
                    lang={lang}
                  />
                )}
              </section>
            )}

            {grid.length > 0 && (
              <section
                aria-labelledby="blog-latest"
                // Menos aire que antes: con la franja de tres, el corte ya lo da el cambio de composición.
                className={isFirstPage ? "mt-16 sm:mt-20" : "pt-11 sm:pt-14"}
              >
                {/* Rótulo chico, no titular: el que manda en esta zona es el título de cada artículo. */}
                <h2
                  id="blog-latest"
                  className="border-t border-border pt-8 text-[0.82rem] font-semibold text-[var(--text-tertiary)]"
                >
                  {copy.latest}
                </h2>

                {/* gap-y casi el doble del horizontal: con ambos iguales se lee como cuadrícula de cajas en vez de filas de artículos. */}
                <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
                  {grid.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{ ...post, category: localizeCategory(post.category, lang) }}
                      lang={lang}
                    />
                  ))}
                </div>
              </section>
            )}

            <BlogPagination
              lang={lang}
              page={page}
              pageCount={pageCount}
              total={total}
              category={activeSlug}
            />
          </>
        )}
      </div>
    </BlogIndexMotion>
  );
}
