import Link from "next/link";
import {
  ADMIN_POSTS_FILTERS,
  ADMIN_POSTS_PAGE_SIZE,
  ADMIN_POSTS_SORTS,
  createPostMeta,
  deletePost,
  displayStatus,
  getAdminPosts,
  isAdminPostsFilter,
  isAdminPostsSort,
  setPostStatus,
  setPostsStatus,
  updatePostMeta,
  type AdminPostsFilter,
  type AdminPostsSort,
} from "@/lib/posts";
import { getCategories, getCategoryBySlug } from "@/lib/categories";
import { PREVIEW_PARAM, createPreviewToken } from "@/lib/previewToken";
import {
  IconArrowLeft,
  IconArrowRight,
  IconClose,
  IconSearch,
} from "@/components/admin/ui/icons";
import { LinkButton } from "@/components/admin/ui/Button";
import { SearchField } from "@/components/admin/ui/Field";
import { ModulePage } from "@/components/admin/ui/ModulePage";
import { EmptyState } from "@/components/admin/ui/Surface";
import PostsTable from "./PostsTable";
import PostCreateDrawer from "./PostCreateDrawer";

/* Fecha para la tabla del admin: corta, con hora, y en la zona de la operación.
   No reusa formatPostDate() del blog público porque ahí interesa la fecha de
   publicación en formato editorial, y acá la última edición al minuto. */
const EDITED_AT = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Santo_Domingo",
});

/* Las pestañas salen de lib/posts.ts y ya no se escriben acá.
   -----------------------------------------------------------------------------
   Eran dos listas paralelas —una para el rótulo y otra para el `where`— y una
   pestaña nueva había que agregarla en los dos lados. Ahora la lista, el recorte
   y el conteo salen de la misma definición, así que no pueden decir cosas
   distintas.

   Son cinco y no cuatro: «Programados» son los publicados con fecha futura, que
   antes se contaban dentro de «Publicados» y prometían un conjunto que el
   público no ve. */

/* El enlace de previsualización de un artículo que todavía no es público.
   ---------------------------------------------------------------------------

   Se arma en el SERVIDOR porque firmarlo necesita el secreto de sesión. Sin
   AUTH_SECRET no se puede firmar nada, y en ese caso el botón simplemente no
   aparece: es preferible una acción ausente a una que lleva a un 404 sin
   explicar por qué. */
function previewHref(id: number, locale: string, slug: string): string | null {
  try {
    return `/${locale}/blog/${slug}/preview?${PREVIEW_PARAM}=${createPreviewToken(id)}`;
  } catch {
    return null;
  }
}

/* Un href que conserva TODO lo que ya estaba puesto. Sin esto, tocar un filtro
   borra la búsqueda y buscar borra el filtro: dos controles que se pisan son
   peores que tener uno solo. */
function buildHref({
  estado,
  q,
  categoria,
  orden,
  pagina,
}: {
  estado?: AdminPostsFilter;
  q?: string;
  categoria?: string;
  orden?: AdminPostsSort;
  pagina?: number;
}) {
  const params = new URLSearchParams();
  if (estado && estado !== "todos") params.set("estado", estado);
  if (q) params.set("q", q);
  if (categoria) params.set("categoria", categoria);
  if (orden && orden !== "reciente") params.set("orden", orden);
  /* La página 1 no se escribe. Es el default, y una URL que dice `?pagina=1` es
     una URL que se ve distinta de la misma pantalla sin el parámetro. */
  if (pagina && pagina > 1) params.set("pagina", String(pagina));
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    estado?: string;
    q?: string;
    categoria?: string;
    orden?: string;
    pagina?: string;
  }>;
}) {
  const { estado, q, categoria, orden, pagina } = await searchParams;

  /* Todo el recorte vive en la URL y no en estado de cliente: así una pestaña
     con "solo borradores de onboarding, ordenados por edición, página 2" se
     puede compartir, recargar y volver atrás. */
  const active: AdminPostsFilter = isAdminPostsFilter(estado) ? estado : "todos";
  const activeFilter = ADMIN_POSTS_FILTERS.find((filter) => filter.key === active);
  const term = q?.trim() ?? "";
  const categorySlug = categoria?.trim() || undefined;
  const sort: AdminPostsSort = isAdminPostsSort(orden) ? orden : "reciente";
  const requestedPage = Number.parseInt(pagina ?? "1", 10);

  /* El filtrado, el orden y la página los hace la base. Antes se traía la tabla
     entera y se recortaba en memoria: con quinientos artículos eran quinientas
     filas viajando para mostrar veinticinco. */
  const { posts, total, page, pageCount, counts, now } = await getAdminPosts({
    filter: active,
    categorySlug,
    term: term || undefined,
    sort,
    page: Number.isNaN(requestedPage) ? 1 : requestedPage,
  });

  /* El nombre visible de la categoría sale de una consulta propia y chica, no
     del listado: con paginación el slug filtrado puede no aparecer en la página
     que se está viendo, y antes eso dejaba la etiqueta mostrando el slug crudo. */
  const activeCategory = categorySlug
    ? ((await getCategoryBySlug(categorySlug))?.name ?? categorySlug)
    : undefined;

  /* Todas las categorías, para el desplegable del cajón de ficha. Es la lista
     completa y no la de los artículos visibles: recategorizar un artículo a algo
     que hoy no está en pantalla es justamente el caso de uso. */
  const allCategories = await getCategories();

  const countFor = (filter: AdminPostsFilter) => counts[filter];

  /* Si NO hay recorte activo y aun así no hay nada, es que no existe ningún
     artículo — no que la búsqueda no encontró. Son dos vacíos distintos y se
     salen por puertas distintas. */
  const isFiltered = Boolean(term) || Boolean(categorySlug) || active !== "todos";

  return (
    /* Sin tira de cifras: los cuatro números que resumen esta pantalla ya están
       en las pestañas de filtro, con su conteo al lado. Repetirlos arriba en
       tarjetas grandes es decir dos veces lo mismo y empujar la tabla —que es
       el trabajo real— fuera de la primera pantalla. */
    <ModulePage
      title="Artículos"
      description="El contenido del blog público"
      /* La acción principal vive en el encabezado del módulo, igual que en los
         otros tres. Estaba dentro de la barra de la tabla con el argumento de
         que "todo lo que se hace en esta pantalla está en la misma fila" — pero
         filtrar y buscar ALTERAN la tabla y crear no: crear se va a otra
         pantalla. La barra queda para lo que recorta lo que se está viendo. */
      actions={<PostCreateDrawer categories={allCategories} action={createPostMeta} />}
    >
      {/* Sin tarjeta. La tabla ES la pantalla, así que no va metida en una caja
          con filete y radio: eso la dibujaba como un bloque apoyado sobre la
          página, con el fondo asomando alrededor. Acá la barra de herramientas y
          la tabla ocupan la página entera.

          Y SIN altura tope. La tabla vivía dentro de una caja de `100dvh` menos
          lo de arriba, con su propio desplazamiento: dos barras en la misma
          pantalla —la de la página y la de la tabla— y la rueda haciendo una
          cosa u otra según dónde estuviera el puntero. Ese tope existía para
          que el encabezado de columnas se pegara; ahora se pega al viewport, que
          es lo mismo con una barra menos. */}
      <div className="cq-enter">
        <h2 className="sr-only">
          {activeFilter ? activeFilter.label : "Artículos"} — {total}
        </h2>
        {/* Todo lo que altera la tabla vive CON la tabla: filtros y búsqueda en
            una sola barra pegada arriba de las columnas. Estaban repartidos
            entre el encabezado de la sección y el cuerpo, y eso obligaba a
            mirar en dos lugares para entender qué recorte se está viendo. */}
        <div className="cq-table-toolbar">
          {/* Pestañas con regla debajo, no botones rellenos: cuatro pastillas de
              color arriba de una tabla compiten con los datos. */}
          <nav aria-label="Filtrar por estado" className="flex flex-wrap items-center gap-1">
            {ADMIN_POSTS_FILTERS.map((filter) => {
              const isActive = filter.key === active;
              return (
                <Link
                  key={filter.key}
                  /* Cambiar de pestaña vuelve a la página 1 a propósito: la
                     página 3 de "Todos" no es la página 3 de "Borradores", y
                     conservar el número deja una lista vacía sin motivo. El
                     orden sí se conserva — es una preferencia de lectura. */
                  href={buildHref({
                    estado: filter.key,
                    q: term,
                    categoria: categorySlug,
                    orden: sort,
                  })}
                  aria-current={isActive ? "true" : undefined}
                  className="cq-tab"
                >
                  {filter.label}
                  <span className="cq-tab-count">{countFor(filter.key)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Un <form> con method GET y no un input controlado: la búsqueda
              funciona sin una línea de JavaScript, el resultado es una URL que
              se puede compartir, y el historial se comporta como la gente
              espera. */}
          <form
            method="get"
            action="/admin/posts"
            role="search"
            className="flex items-center gap-2"
          >
            {active !== "todos" && <input type="hidden" name="estado" value={active} />}
            {categorySlug && <input type="hidden" name="categoria" value={categorySlug} />}
            {/* El orden viaja con la búsqueda; la página no. Buscar produce un
                conjunto nuevo, y arrancarlo en la página 3 no tiene sentido. */}
            {sort !== "reciente" && <input type="hidden" name="orden" value={sort} />}
            <SearchField
              id="post-search"
              name="q"
              label="Buscar artículos por título, URL o categoría"
              defaultValue={term}
              placeholder="Buscar…"
              icon={<IconSearch size={15} className="cq-field-icon" />}
              className="w-[9rem] sm:w-[14rem]"
            />
            <button type="submit" className="cq-btn" data-variant="outline" data-size="sm">
              Buscar
            </button>
            {/* Limpiar aparece SÓLO con algo escrito. Un botón de limpiar
                permanente al lado de un campo vacío es un control que no hace
                nada, y enseña a ignorarlo. */}
            {term && (
              <Link
                href={buildHref({ estado: active, categoria: categorySlug, orden: sort })}
                className="cq-btn"
                data-variant="ghost"
                data-size="sm"
              >
                Limpiar
              </Link>
            )}
          </form>

          {/* El recorte por categoría llega por URL desde la tarjeta de
              Categorías, así que tiene que ser VISIBLE y reversible acá: un
              filtro que sólo vive en la barra de direcciones es una lista
              incompleta sin explicación. La quita es el propio control. */}
          {categorySlug && (
            <Link
              href={buildHref({ estado: active, q: term, orden: sort })}
              className="cq-btn"
              data-variant="outline"
              data-size="sm"
            >
              <span className="cq-meta">Categoría:</span>
              {activeCategory}
              <IconClose size={13} aria-hidden="true" />
              <span className="sr-only">Quitar el filtro de categoría</span>
            </Link>
          )}

          {/* El orden, como <select> dentro de un <form> GET y no como
              encabezados de columna con flechita.

              Dos razones. La tabla se desplaza en horizontal en pantalla
              angosta, así que un control que vive en el encabezado de la
              columna "Editado" es un control que a veces no está en pantalla. Y
              la mitad de los órdenes útiles acá no corresponden a una columna
              visible —"más antiguos" es la fecha de creación, que la tabla no
              muestra—, así que la metáfora de "hacer clic en la columna" ya no
              alcanzaba antes de escribirla.

              Sin JavaScript funciona igual: el botón envía el formulario. Con
              JavaScript el `onChange` lo envía solo, pero eso vive en el
              cliente y esta página es un Server Component, así que el botón se
              queda — y de paso es el único camino accesible con teclado que no
              depende de que el select dispare al navegar con flechas. */}
          <form method="get" action="/admin/posts" className="flex items-center gap-2">
            {active !== "todos" && <input type="hidden" name="estado" value={active} />}
            {term && <input type="hidden" name="q" value={term} />}
            {categorySlug && <input type="hidden" name="categoria" value={categorySlug} />}
            <label htmlFor="post-sort" className="cq-label whitespace-nowrap">
              Orden
            </label>
            <select
              id="post-sort"
              name="orden"
              defaultValue={sort}
              className="cq-select w-[11rem]"
            >
              {Object.entries(ADMIN_POSTS_SORTS).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="submit" className="cq-btn" data-variant="outline" data-size="sm">
              Aplicar
            </button>
          </form>
        </div>

        {total === 0 && !isFiltered ? (
          <EmptyState
            title="Todavía no hay artículos"
            hint="Un artículo se arma con bloques: título, párrafos, imágenes, tablas. Podés partir de una plantilla o desde cero."
            /* El mismo cajón que el encabezado, con otro rótulo: dos puertas al
               alta que abrieran cosas distintas serían dos altas. */
            action={
              <PostCreateDrawer
                categories={allCategories}
                action={createPostMeta}
                label="Escribir el primero"
              />
            }
          />
        ) : total === 0 ? (
          /* Tres vacíos distintos, no uno genérico. "No hay resultados" obliga a
             adivinar si el problema es la búsqueda, el filtro o que no existe
             nada — y cada caso se sale por una puerta diferente. */
          <EmptyState
            title={
              term
                ? `Nada coincide con «${term}»`
                : activeCategory
                  ? `Nada en «${activeCategory}»`
                  : "Ningún artículo en este estado"
            }
            hint={
              term && active !== "todos"
                ? "Puede que exista pero en otro estado. Probá quitando el filtro antes de descartar la búsqueda."
                : term
                  ? "Se busca en el título, el identificador de URL y la categoría."
                  : activeCategory && active !== "todos"
                    ? "Esta categoría no tiene artículos en este estado."
                    : activeCategory
                      ? "La categoría existe pero todavía no tiene artículos."
                      : "Probá con otro filtro para ver el resto."
            }
            rows={2}
            action={
              term && active !== "todos" ? (
                <LinkButton href={buildHref({ q: term, categoria: categorySlug, orden: sort })}>
                  Buscar en todos los estados
                </LinkButton>
              ) : activeCategory && active !== "todos" ? (
                <LinkButton href={buildHref({ categoria: categorySlug, orden: sort })}>
                  Ver toda la categoría
                </LinkButton>
              ) : (
                <LinkButton href="/admin/posts">
                  {term ? "Limpiar la búsqueda" : "Ver todos"}
                </LinkButton>
              )
            }
          />
        ) : (
          /* Todas las columnas, siempre. Antes Categoría e Idioma se ocultaban
             bajo 768px y Editado bajo 1024px, y ese dato bajaba apretado en una
             línea gris dentro del título. Una tabla a la que le faltan columnas
             según el ancho no se puede comparar en vertical, que es lo único
             que una tabla hace mejor que una lista. En pantalla angosta ahora
             se desplaza en horizontal DENTRO de su caja. */
          <PostsTable
            caption={`Artículos ${active === "todos" ? "en todos los estados" : `— ${activeFilter?.label}`}${activeCategory ? `, en la categoría ${activeCategory}` : ""}${term ? `, filtrados por «${term}»` : ""} — página ${page} de ${pageCount}`}
            posts={posts.map((post) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              coverImageUrl: post.coverImageUrl,
              coverImageAlt: post.coverImageAlt,
              /* El estado VISIBLE, no el de la base. Un artículo publicado con
                 fecha futura está programado, y decir "Publicado" en la única
                 columna que promete decir si se ve o no es mentir. */
              status: displayStatus(post, now),
              /* El estado real, para el interruptor de la fila: publicar/ocultar
                 escribe en la columna `status`, que sigue teniendo tres valores. */
              rawStatus: post.status,
              publishedAt: post.publishedAt ? EDITED_AT.format(post.publishedAt) : null,
              locale: post.locale,
              categoryName: post.category.name,
              updatedAt: EDITED_AT.format(post.updatedAt),
              updatedAtIso: post.updatedAt.toISOString(),
              /* Quién guardó por última vez. "Editado hace 5 minutos" sin un
                 nombre al lado no alcanza para saber a quién preguntarle. */
              updatedByName: post.updatedBy?.name ?? null,
              /* Enlace de previsualización, sólo para lo que NO es público.
                 Para un artículo publicado ya está el enlace normal al blog, y
                 un token ahí sería una URL con firma circulando sin motivo. */
              previewHref:
                displayStatus(post, now) === "PUBLISHED"
                  ? null
                  : previewHref(post.id, post.locale, post.slug),
              /* La ficha que edita el cajón. Sale de la MISMA consulta que ya
                 alimenta la tabla —son columnas del propio artículo—, así que
                 abrir el cajón no cuesta un viaje al servidor. */
              categoryId: post.categoryId,
              excerpt: post.excerpt,
              seoTitle: post.seoTitle ?? "",
              seoDescription: post.seoDescription ?? "",
            }))}
            categories={allCategories}
            setStatusAction={setPostStatus}
            deleteAction={deletePost}
            bulkStatusAction={setPostsStatus}
            updateMetaAction={updatePostMeta}
          />
        )}

        {/* Paginación.

            Enlaces y no botones: cada página es una URL propia, se puede
            compartir, se abre en pestaña nueva y el botón de atrás hace lo que
            se espera. Es la misma decisión que ya tomaban el filtro y la
            búsqueda.

            Fuera de la región desplazable de la tabla, así queda siempre a la
            vista y no hay que llegar al final del scroll interno para
            encontrarla.

            No se dibujan números de página. Con un tope de 25 por página, una
            operación de blog rara vez pasa de unas pocas; una tira de números
            que casi siempre dice "1 2" es cuatro controles para reemplazar dos.
            Anterior / siguiente, y el conteo dice dónde estás. */}
        {pageCount > 1 && (
          <nav
            aria-label="Paginación de artículos"
            className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--p-line)] pt-3"
          >
            <p className="cq-meta">
              {(page - 1) * ADMIN_POSTS_PAGE_SIZE + 1}–
              {Math.min(page * ADMIN_POSTS_PAGE_SIZE, total)} de {total}
            </p>
            <div className="flex items-center gap-2">
              {/* El extremo se dibuja deshabilitado y no se oculta: un control
                  que aparece y desaparece hace saltar la fila, y no poder ir
                  atrás en la página 1 es información. Es un <span> y no un <a>
                  sin href porque un enlace sin destino no es enfocable ni
                  anunciable — y no tiene por qué serlo. */}
              {page > 1 ? (
                <LinkButton
                  href={buildHref({
                    estado: active,
                    q: term,
                    categoria: categorySlug,
                    orden: sort,
                    pagina: page - 1,
                  })}
                  size="sm"
                  icon={<IconArrowLeft size={14} />}
                >
                  Anterior
                </LinkButton>
              ) : (
                <span className="cq-btn" data-variant="outline" data-size="sm" aria-disabled="true">
                  <IconArrowLeft size={14} />
                  Anterior
                </span>
              )}

              <p className="cq-ident whitespace-nowrap">
                {page} / {pageCount}
              </p>

              {page < pageCount ? (
                <LinkButton
                  href={buildHref({
                    estado: active,
                    q: term,
                    categoria: categorySlug,
                    orden: sort,
                    pagina: page + 1,
                  })}
                  size="sm"
                  icon={<IconArrowRight size={14} />}
                >
                  Siguiente
                </LinkButton>
              ) : (
                <span className="cq-btn" data-variant="outline" data-size="sm" aria-disabled="true">
                  Siguiente
                  <IconArrowRight size={14} />
                </span>
              )}
            </div>
          </nav>
        )}
      </div>
    </ModulePage>
  );
}
