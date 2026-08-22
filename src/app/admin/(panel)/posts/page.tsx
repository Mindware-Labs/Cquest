import Link from "next/link";
import { deletePost, getPosts, setPostStatus } from "@/lib/posts";
import { IconPlus, IconSearch } from "@/components/admin/ui/icons";
import { EmptyState, PageHeader, Panel } from "@/components/admin/ui/Surface";
import PostRow from "./PostRow";

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
   borra la búsqueda y buscar borra el filtro: dos controles que se pisan es peor
   que tener uno solo. */
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
    <div>
      <PageHeader
        title="Artículos"
        actions={
          <Link href="/admin/posts/new" className="cq-btn" data-variant="primary">
            <IconPlus size={16} />
            Nuevo artículo
          </Link>
        }
      />

      <Panel>
        <div className="cq-panel-head flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map((filter) => {
              const isActive = filter.key === active;
              return (
                <Link
                  key={filter.key}
                  href={buildHref({ estado: filter.key, q: term })}
                  aria-current={isActive ? "true" : undefined}
                  className={`cq-btn ${isActive ? "" : "border-transparent"}`}
                  data-variant={isActive ? "secondary" : "quiet"}
                  data-size="sm"
                >
                  {filter.label}
                  <span className={isActive ? "opacity-80" : "opacity-70"}>{countFor(filter)}</span>
                </Link>
              );
            })}
          </div>

          {/* Un <form> con method GET y no un input controlado: la búsqueda
              funciona sin una línea de JavaScript, el resultado es una URL que se
              puede compartir, y el historial del navegador se comporta como la
              gente espera. Un buscador con debounce en cliente cuesta más y da
              menos. */}
          <form method="get" action="/admin/posts" role="search" className="flex items-center gap-1.5">
            {active !== "todos" && <input type="hidden" name="estado" value={active} />}
            <label htmlFor="post-search" className="sr-only">
              Buscar artículos por título, URL o categoría
            </label>
            <div className="relative">
              <IconSearch size={16} className="cq-field-icon" />
              <input
                id="post-search"
                name="q"
                type="search"
                defaultValue={term}
                placeholder="Buscar…"
                className="cq-input cq-field h-9 w-[11rem] py-0 sm:w-[15rem]"
              />
            </div>
            <button type="submit" className="cq-btn" data-variant="ghost" data-size="sm">
              Buscar
            </button>
          </form>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="Todavía no hay artículos"
            hint="Un artículo se arma con bloques: título, párrafos, imágenes, tablas. Podés partir de una plantilla o desde cero."
            action={
              <Link href="/admin/posts/new" className="cq-btn" data-variant="primary">
                <IconPlus size={16} />
                Escribir el primero
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          /* Tres vacíos distintos, no uno genérico. "No hay resultados" obliga a
             adivinar si el problema es la búsqueda, el filtro o que no existe
             nada — y cada caso se sale por una puerta diferente. */
          <EmptyState
            title={
              term
                ? `Nada coincide con «${term}»`
                : "Ningún artículo en este estado"
            }
            hint={
              term && active !== "todos"
                ? "Puede que exista pero en otro estado. Probá quitando el filtro antes de descartar la búsqueda."
                : term
                  ? "Se busca en el título, el identificador de URL y la categoría."
                  : "Probá con otro filtro para ver el resto."
            }
            action={
              term && active !== "todos" ? (
                <Link
                  href={buildHref({ q: term })}
                  className="cq-btn"
                  data-variant="ghost"
                >
                  Buscar en todos los estados
                </Link>
              ) : (
                <Link href="/admin/posts" className="cq-btn" data-variant="ghost">
                  {term ? "Limpiar la búsqueda" : "Ver todos"}
                </Link>
              )
            }
          />
        ) : (
          <div className="cq-table-scroll">
            <table className="cq-table">
              <caption className="sr-only">
                Artículos {active === "todos" ? "en todos los estados" : `— ${activeStatus?.label}`}
                {term ? `, filtrados por «${term}»` : ""}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Artículo</th>
                  <th scope="col" className="hidden md:table-cell">
                    Categoría
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Idioma
                  </th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="hidden lg:table-cell">
                    Editado
                  </th>
                  <th scope="col" className="text-right">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((post) => (
                  <PostRow
                    key={post.id}
                    post={{
                      id: post.id,
                      title: post.title,
                      slug: post.slug,
                      coverImageUrl: post.coverImageUrl,
                      coverImageAlt: post.coverImageAlt,
                      status: post.status,
                      locale: post.locale,
                      categoryName: post.category.name,
                      updatedAt: EDITED_AT.format(post.updatedAt),
                    }}
                    setStatusAction={setPostStatus}
                    deleteAction={deletePost}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
