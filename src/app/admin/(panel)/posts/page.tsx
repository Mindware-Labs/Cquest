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

// No reusa formatPostDate() del blog público: ahí importa la fecha editorial de publicación, acá la última edición al minuto.
const EDITED_AT = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Santo_Domingo",
});

// Pestañas, recorte y conteo salen de la misma definición en lib/posts.ts. «Programados» (publicados con fecha futura) es su propio estado: antes se contaban como «Publicados» sin serlo aún para el público.

// Se firma en el servidor (requiere AUTH_SECRET); sin secreto el botón no aparece — mejor ausente que un 404 sin explicación.
function previewHref(id: number, locale: string, slug: string): string | null {
  try {
    return `/${locale}/blog/${slug}/preview?${PREVIEW_PARAM}=${createPreviewToken(id)}`;
  } catch {
    return null;
  }
}

// Conserva todos los parámetros existentes: sin esto, tocar un filtro borra la búsqueda y viceversa.
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
  // La página 1 no se escribe: es el default, para no tener dos URLs distintas para la misma pantalla.
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

  // Todo el recorte vive en la URL y no en estado de cliente: así se puede compartir, recargar y volver atrás.
  const active: AdminPostsFilter = isAdminPostsFilter(estado) ? estado : "todos";
  const activeFilter = ADMIN_POSTS_FILTERS.find((filter) => filter.key === active);
  const term = q?.trim() ?? "";
  const categorySlug = categoria?.trim() || undefined;
  const sort: AdminPostsSort = isAdminPostsSort(orden) ? orden : "reciente";
  const requestedPage = Number.parseInt(pagina ?? "1", 10);

  // El filtrado, orden y paginación los hace la base, no memoria: evita traer la tabla entera para mostrar 25 filas.
  const { posts, total, page, pageCount, counts, now } = await getAdminPosts({
    filter: active,
    categorySlug,
    term: term || undefined,
    sort,
    page: Number.isNaN(requestedPage) ? 1 : requestedPage,
  });

  // Consulta propia y no del listado: con paginación el slug filtrado puede no estar en la página visible, y antes eso mostraba el slug crudo.
  const activeCategory = categorySlug
    ? ((await getCategoryBySlug(categorySlug))?.name ?? categorySlug)
    : undefined;

  // Lista completa, no solo la de artículos visibles: recategorizar hacia algo que hoy no está en pantalla es justo el caso de uso.
  const allCategories = await getCategories();

  const countFor = (filter: AdminPostsFilter) => counts[filter];

  // Sin filtro activo y sin resultados es que no existe ningún artículo, no que la búsqueda falló: son vacíos distintos.
  const isFiltered = Boolean(term) || Boolean(categorySlug) || active !== "todos";

  return (
    // Sin tira de cifras: los números ya están en las pestañas de filtro; repetirlos empujaría la tabla fuera de la primera pantalla.
    <ModulePage
      title="Artículos"
      description="El contenido del blog público"
      // La acción principal vive en el encabezado del módulo, igual que en las otras pantallas: crear navega a otra página, a diferencia de filtrar/buscar que alteran esta misma tabla.
      actions={<PostCreateDrawer categories={allCategories} action={createPostMeta} />}
    >
      {/* Sin tarjeta ni altura tope: la tabla ocupa la página entera y el encabezado de columnas se pega al viewport en vez de vivir en un contenedor con su propio scroll. */}
      <div className="cq-enter">
        <h2 className="sr-only">
          {activeFilter ? activeFilter.label : "Artículos"} — {total}
        </h2>
        {/* Filtros y búsqueda en una sola barra pegada a la tabla, no repartidos entre el encabezado de la sección y el cuerpo. */}
        <div className="cq-table-toolbar">
          {/* Pestañas con regla debajo, no botones rellenos: cuatro pastillas de color competirían con los datos. */}
          <nav aria-label="Filtrar por estado" className="flex flex-wrap items-center gap-1">
            {ADMIN_POSTS_FILTERS.map((filter) => {
              const isActive = filter.key === active;
              return (
                <Link
                  key={filter.key}
                  // Cambiar de pestaña vuelve a la página 1 a propósito (evita listas vacías); el orden se conserva por ser preferencia de lectura.
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

          {/* <form method="get"> y no un input controlado: funciona sin JavaScript, produce una URL compartible y respeta el historial. */}
          <form
            method="get"
            action="/admin/posts"
            role="search"
            className="flex items-center gap-2"
          >
            {active !== "todos" && <input type="hidden" name="estado" value={active} />}
            {categorySlug && <input type="hidden" name="categoria" value={categorySlug} />}
            {/* El orden viaja con la búsqueda; la página no, porque buscar produce un conjunto nuevo. */}
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
            {/* Limpiar aparece SÓLO con algo escrito: permanente junto a un campo vacío sería un control que no hace nada. */}
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

          {/* El filtro de categoría llega por URL desde la tarjeta de Categorías; debe quedar visible y reversible acá. */}
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

          {/* <select> en un <form> GET, no encabezados de columna clicables: la tabla se desplaza en horizontal y no todo orden visible corresponde a una columna; el botón queda como envío accesible sin depender de onChange (esta página es Server Component). */}
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
            // El mismo cajón que el encabezado, con otro rótulo: dos puertas al alta que abrieran cosas distintas serían dos altas.
            action={
              <PostCreateDrawer
                categories={allCategories}
                action={createPostMeta}
                label="Escribir el primero"
              />
            }
          />
        ) : total === 0 ? (
          // Tres vacíos distintos, no uno genérico: "no hay resultados" obligaría a adivinar si el problema es la búsqueda, el filtro o que no existe nada.
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
                ? "Puede que exista pero en otro estado. Prueba quitando el filtro antes de descartar la búsqueda."
                : term
                  ? "Se busca en el título, el identificador de URL y la categoría."
                  : activeCategory && active !== "todos"
                    ? "Esta categoría no tiene artículos en este estado."
                    : activeCategory
                      ? "La categoría existe pero todavía no tiene artículos."
                      : "Prueba con otro filtro para ver el resto."
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
          // Todas las columnas, siempre: ocultarlas según ancho impedía comparar en vertical; en angosto ahora se desplaza en horizontal dentro de su caja.
          <PostsTable
            caption={`Artículos ${active === "todos" ? "en todos los estados" : `— ${activeFilter?.label}`}${activeCategory ? `, en la categoría ${activeCategory}` : ""}${term ? `, filtrados por «${term}»` : ""} — página ${page} de ${pageCount}`}
            posts={posts.map((post) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              coverImageUrl: post.coverImageUrl,
              coverImageAlt: post.coverImageAlt,
              // Estado VISIBLE, no el de la base: un publicado con fecha futura está programado aunque status diga PUBLISHED.
              status: displayStatus(post, now),
              // Estado real, para el interruptor de la fila (publicar/ocultar escribe en `status`, que sigue teniendo tres valores).
              rawStatus: post.status,
              publishedAt: post.publishedAt ? EDITED_AT.format(post.publishedAt) : null,
              locale: post.locale,
              categoryName: post.category.name,
              updatedAt: EDITED_AT.format(post.updatedAt),
              updatedAtIso: post.updatedAt.toISOString(),
              // Quién guardó por última vez: "editado hace 5 minutos" sin nombre no alcanza para saber a quién preguntarle.
              updatedByName: post.updatedBy?.name ?? null,
              // Solo para lo que NO es público: un publicado ya tiene su enlace normal, y un token ahí circularía sin motivo.
              previewHref:
                displayStatus(post, now) === "PUBLISHED"
                  ? null
                  : previewHref(post.id, post.locale, post.slug),
              // Datos del cajón de edición: misma consulta que alimenta la tabla, así que abrirlo no cuesta un viaje al servidor.
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

        {/* Paginación: enlaces (no botones) para que cada página sea compartible; fuera del scroll interno de la tabla para quedar siempre visible; sin números de página porque con tope de 25 rara vez hacen falta más que anterior/siguiente. */}
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
              {/* Deshabilitado se dibuja, no se oculta (evita saltos de layout); es <span> y no <a> sin href porque un enlace sin destino no debería ser enfocable. */}
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
