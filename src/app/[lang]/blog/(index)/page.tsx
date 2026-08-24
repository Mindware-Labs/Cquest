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

/* El número de página en el <title>. Sin esto, cinco URLs distintas comparten
   titular en los resultados de búsqueda y Google las trata como duplicados. */
const PAGE_SUFFIX: Record<Locale, (page: number) => string> = {
  es: (page) => ` — Página ${page}`,
  en: (page) => ` — Page ${page}`,
};

/* 70rem y no el contenedor de 84rem del sitio: con tres columnas de tarjeta,
   84rem deja cada portada tan ancha que el título de abajo queda flotando en
   una línea de texto muy corta contra una imagen enorme. */
const CONTAINER = "mx-auto w-full max-w-[70rem] px-5 sm:px-8";

type Params = Promise<{ lang: string }>;
type Search = Promise<BlogSearchParams>;

/* Un artículo programado tiene que aparecer solo cuando llega su hora, y lo
   único que decide eso es que esta página se vuelva a generar. La invalidación
   por evento (revalidatePath al guardar) no sirve acá: nadie guarda nada en el
   momento en que el reloj cruza la fecha. De ahí el plazo — es el retraso
   máximo entre la hora programada y el artículo visible. */
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

  /* La página 2 en adelante lleva su número en el título: sin eso, cinco URLs
     distintas comparten titular y descripción en los resultados de búsqueda, y
     Google las trata como duplicados entre sí.

     Y el canonical apunta a la propia página, no a /blog: cada página del
     listado tiene artículos distintos, así que colapsarlas todas en la primera
     le estaría diciendo a Google que el resto no existe. */
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

  /* El nombre de cada categoría, en el idioma de la página. El orden alfabético
     se recalcula DESPUÉS de traducir: ordenado por el nombre en español, una
     lista en inglés sale desordenada sin explicación visible. */
  const categories = rawCategories
    .map((category) => localizeCategory(category, lang))
    .sort((a, b) => a.name.localeCompare(b.name, lang));

  /* Un slug inexistente en la URL no es un error: se ignora y el filtro vuelve
     a "Todos", en vez de dejar la interfaz marcando algo que no existe. */
  const activeSlug = categories.some((category) => category.slug === categoria)
    ? (categoria ?? null)
    : null;

  const copy = COPY[lang];

  /* Con una sola categoría el filtro no filtra nada y `CategoryFilter` devuelve
     null. La página necesita saberlo antes de renderizar: es lo que decide qué
     elemento carga el hueco bajo el navbar. */
  const hasFilters = categories.length > 1;

  /* El destacado sólo existe en la PRIMERA página. En la página 2 no hay un
     "más reciente" que destacar —son los que siguen— y agrandar el primero de
     una página cualquiera inventaría una jerarquía que no existe. */
  const isFirstPage = page === 1;
  const [featured, ...rest] = posts;

  /* LA PORTADA ES UN TRÍO, no un artículo solo.
     ---------------------------------------------------------------------------
     El destacado al ancho completo empujaba todo lo demás fuera de la primera
     pantalla: se entraba al blog y se veía un artículo. Ahora la primera franja
     son tres —el más reciente en el centro, a doble tamaño, y los dos que le
     siguen en columnas verticales a los costados—, así que se llega con tres
     puertas a la vista en el mismo alto que antes ocupaba una.

     Los laterales son los artículos 2 y 3, no una caja de "destacados
     editoriales" ni un widget: son los que iban a encabezar la grilla de abajo,
     puestos donde se ven. Nada de contenido inventado para llenar la maqueta.

     El trío SÓLO se arma con tres o más. Con dos, una columna lateral quedaría
     vacía y la franja saldría manca; ahí la portada va sola a ancho completo,
     como antes. */
  const hasTrio = isFirstPage && posts.length >= 3;
  const rail = hasTrio ? rest.slice(0, 2) : [];
  const grid = isFirstPage ? rest.slice(hasTrio ? 2 : 0) : posts;

  return (
    <BlogIndexMotion>
      {/* El feed, declarado en el <head> de la página. Es lo que hace que el
          botón de suscripción del navegador y los lectores de feeds lo
          encuentren solos al pegar la URL del blog. */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={TITLE[lang]}
        href={`/${lang}/blog/rss.xml`}
      />

      {/* ---------- Categorías ---------- */}
      {/* Las categorías van ARRIBA del titular, no debajo.
          -----------------------------------------------------------------------
          Es lo que hace compacta la primera pantalla: la barra ocupa una línea y
          es lo único que se puede accionar en toda la cabecera, así que ponerla
          primero deja al titular pegado a los artículos en vez de tener texto,
          barra y otra vez contenido.

          Sigue pegajosa al tope: en un índice largo, un filtro que se va con el
          scroll obliga a volver arriba para cambiar de categoría. */}
      {/* El hueco bajo el navbar fijo va en MARGEN y no en relleno: el relleno
          de un elemento pegajoso viaja con él, y la barra se habría vuelto un
          bloque de 8rem de alto al quedar fija arriba. El margen sólo afecta a
          su posición en reposo. */}
      {hasFilters && (
        <div data-blog-rail className="cq-blog-filters mt-28 sm:mt-32">
          <div className={CONTAINER}>
            <CategoryFilter categories={categories} activeSlug={activeSlug} lang={lang} />
          </div>
        </div>
      )}

      {/* ---------- Cabecera ---------- */}
      {/* Hoja blanca de arriba abajo: sin campo de color, sin rótulo encima del
          titular. La palabra "Blog" ya está en la navegación y en el título de
          la pestaña; repetirla en un eyebrow gasta la primera línea de la
          página en decir dónde estás en vez de decir qué vas a encontrar.

          Titular y bajada en DOS COLUMNAS desde escritorio. Apilados sumaban
          nueve renglones de alto antes del primer artículo; al costado ocupan
          los mismos renglones que el titular solo, y la bajada apoyada en la
          base del titular se lee como su pie y no como un segundo párrafo. */}
      <header
        /* Sin barra de categorías arriba, este encabezado es el primer elemento
           de la página y le toca a él despejar el navbar fijo. */
        className={`${CONTAINER} grid items-end gap-x-12 gap-y-5 pb-8 sm:pb-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] ${
          hasFilters ? "pt-10 sm:pt-12" : "pt-28 sm:pt-32"
        }`}
      >
        {/* El ancho máximo en `ch` y no en `rem`: lo que hay que limitar es la
            cantidad de caracteres por línea, y eso no cambia con el tamaño de
            fuente como sí lo haría una medida fija. */}
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
            {/* ---------- Portada ---------- */}
            {isFirstPage && featured && (
              <section aria-labelledby="blog-featured" className="pt-9 sm:pt-11">
                <h2 id="blog-featured" className="sr-only">
                  {featured.title}
                </h2>

                {/* Las tres columnas: laterales angostos y centro al doble.
                    `items-start` y no `stretch` — cada artículo mide lo que
                    mide, y estirarlos a la altura del más alto abriría huecos
                    entre el texto y el borde de las columnas cortas.

                    El orden visual NO es el orden del documento en móvil: ahí
                    todo se apila y el destacado va primero, que es el orden de
                    importancia. En escritorio lo recoloca la grilla. */}
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

            {/* ---------- Resto ---------- */}
            {grid.length > 0 && (
              <section
                aria-labelledby="blog-latest"
                /* Menos aire que antes entre la portada y la grilla: con la
                   franja de tres, el corte ya está dado por el cambio de
                   composición y no hace falta un vacío que lo subraye. */
                className={isFirstPage ? "mt-16 sm:mt-20" : "pt-11 sm:pt-14"}
              >
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
