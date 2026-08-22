import Link from "next/link";
import { deletePost, getPosts, setPostStatus, setPostsStatus } from "@/lib/posts";
import { IconPlus, IconSearch } from "@/components/admin/ui/icons";
import { LinkButton } from "@/components/admin/ui/Button";
import { SearchField } from "@/components/admin/ui/Field";
import { ModulePage } from "@/components/admin/ui/ModulePage";
import { EmptyState } from "@/components/admin/ui/Surface";
import PostsTable from "./PostsTable";

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

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "borrador", label: "Borradores", status: "DRAFT" },
  { key: "publicado", label: "Publicados", status: "PUBLISHED" },
  { key: "oculto", label: "Ocultos", status: "HIDDEN" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function isFilterKey(value: string | undefined): value is FilterKey {
  return FILTERS.some((filter) => filter.key === value);
}

/* Un href que conserva TODO lo que ya estaba puesto. Sin esto, tocar un filtro
   borra la búsqueda y buscar borra el filtro: dos controles que se pisan son
   peores que tener uno solo. */
function buildHref({ estado, q }: { estado?: FilterKey; q?: string }) {
  const params = new URLSearchParams();
  if (estado && estado !== "todos") params.set("estado", estado);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const { estado, q } = await searchParams;
  const posts = await getPosts();

  /* El filtro y la búsqueda viven en la URL y no en estado de cliente: así una
     pestaña con "solo borradores de onboarding" se puede compartir, recargar y
     volver atrás. */
  const active: FilterKey = isFilterKey(estado) ? estado : "todos";
  const activeStatus = FILTERS.find((filter) => filter.key === active);
  const term = q?.trim() ?? "";

  /* Se busca sobre el título, el identificador de URL y la categoría. El slug
     entra porque es lo que se ve en la URL pública y a veces es lo único que se
     recuerda de un artículo viejo. */
  const needle = term.toLocaleLowerCase("es");
  const matches = term
    ? posts.filter((post) =>
        [post.title, post.slug, post.category.name].some((field) =>
          field.toLocaleLowerCase("es").includes(needle),
        ),
      )
    : posts;

  const visible =
    activeStatus && "status" in activeStatus
      ? matches.filter((post) => post.status === activeStatus.status)
      : matches;

  /* Los contadores cuentan sobre el resultado de la BÚSQUEDA, no sobre el total.
     Si dijeran el total, "Borradores 12" al lado de una lista de 2 sería una
     contradicción en la misma fila. */
  const countFor = (filter: (typeof FILTERS)[number]) =>
    "status" in filter
      ? matches.filter((post) => post.status === filter.status).length
      : matches.length;

  return (
    /* Sin tira de cifras: los cuatro números que resumen esta pantalla ya están
       en las pestañas de filtro, con su conteo al lado. Repetirlos arriba en
       tarjetas grandes es decir dos veces lo mismo y empujar la tabla —que es
       el trabajo real— fuera de la primera pantalla. */
    <ModulePage
      title="Artículos"
      path="admin/posts"
      description="El contenido del blog público"
    >
      {/* Sin tarjeta. La tabla ES la pantalla, así que no va metida en una caja
          con filete y radio: eso la dibujaba como un bloque apoyado sobre la
          página, con el fondo asomando alrededor. Acá la barra de herramientas y
          la tabla ocupan la página entera.

          `100dvh` y no `100vh`: en un teléfono la barra del navegador aparece y
          desaparece, y `vh` mide la pantalla sin ella — la última fila quedaba
          tapada. */}
      <div className="cq-enter flex max-h-[calc(100dvh-8rem)] flex-col">
        <h2 className="sr-only">
          {activeStatus ? activeStatus.label : "Artículos"} — {visible.length}
        </h2>
        {/* Todo lo que altera la tabla vive CON la tabla: filtros y búsqueda en
            una sola barra pegada arriba de las columnas. Estaban repartidos
            entre el encabezado de la sección y el cuerpo, y eso obligaba a
            mirar en dos lugares para entender qué recorte se está viendo. */}
        <div className="cq-table-toolbar">
          {/* Pestañas con regla debajo, no botones rellenos: cuatro pastillas de
              color arriba de una tabla compiten con los datos. */}
          <nav aria-label="Filtrar por estado" className="flex flex-wrap items-center gap-1">
            {FILTERS.map((filter) => {
              const isActive = filter.key === active;
              return (
                <Link
                  key={filter.key}
                  href={buildHref({ estado: filter.key, q: term })}
                  aria-current={isActive ? "true" : undefined}
                  className="cq-tab"
                >
                  {filter.label}
                  <span className="cq-tab-count">{countFor(filter)}</span>
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
                href={buildHref({ estado: active })}
                className="cq-btn"
                data-variant="ghost"
                data-size="sm"
              >
                Limpiar
              </Link>
            )}

          </form>

          {/* La acción principal vive en la barra de la tabla, no en un
              encabezado aparte: todo lo que se hace en esta pantalla —filtrar,
              buscar, crear— está en la misma fila, arriba de los datos sobre
              los que se opera.

              Fuera del <form> de búsqueda, no adentro: es un enlace a otra
              pantalla y no tiene nada que ver con lo que ese formulario envía.
              Meterlo adentro ataría dos cosas que no se relacionan. */}
          <LinkButton
            href="/admin/posts/new"
            variant="solid"
            size="sm"
            icon={<IconPlus size={14} />}
          >
            Nuevo artículo
          </LinkButton>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="Todavía no hay artículos"
            hint="Un artículo se arma con bloques: título, párrafos, imágenes, tablas. Podés partir de una plantilla o desde cero."
            action={
              <LinkButton href="/admin/posts/new" variant="solid" icon={<IconPlus size={15} />}>
                Escribir el primero
              </LinkButton>
            }
          />
        ) : visible.length === 0 ? (
          /* Tres vacíos distintos, no uno genérico. "No hay resultados" obliga a
             adivinar si el problema es la búsqueda, el filtro o que no existe
             nada — y cada caso se sale por una puerta diferente. */
          <EmptyState
            title={term ? `Nada coincide con «${term}»` : "Ningún artículo en este estado"}
            hint={
              term && active !== "todos"
                ? "Puede que exista pero en otro estado. Probá quitando el filtro antes de descartar la búsqueda."
                : term
                  ? "Se busca en el título, el identificador de URL y la categoría."
                  : "Probá con otro filtro para ver el resto."
            }
            rows={2}
            action={
              term && active !== "todos" ? (
                <LinkButton href={buildHref({ q: term })}>Buscar en todos los estados</LinkButton>
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
            caption={`Artículos ${active === "todos" ? "en todos los estados" : `— ${activeStatus?.label}`}${term ? `, filtrados por «${term}»` : ""}`}
            posts={visible.map((post) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              coverImageUrl: post.coverImageUrl,
              coverImageAlt: post.coverImageAlt,
              status: post.status,
              locale: post.locale,
              categoryName: post.category.name,
              updatedAt: EDITED_AT.format(post.updatedAt),
            }))}
            setStatusAction={setPostStatus}
            deleteAction={deletePost}
            bulkStatusAction={setPostsStatus}
          />
        )}
      </div>
    </ModulePage>
  );
}
