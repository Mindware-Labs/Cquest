import Link from "next/link";
import { deletePost, getPosts, setPostStatus } from "@/lib/posts";
import { IconPlus } from "@/components/admin/ui/icons";
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

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const posts = await getPosts();

  /* El filtro vive en la URL y no en estado de cliente: así una pestaña con
     "solo borradores" se puede compartir, recargar y volver atrás. */
  const active: FilterKey = isFilterKey(estado) ? estado : "todos";
  const activeStatus = FILTERS.find((filter) => filter.key === active);
  const visible =
    activeStatus && "status" in activeStatus
      ? posts.filter((post) => post.status === activeStatus.status)
      : posts;

  const countFor = (filter: (typeof FILTERS)[number]) =>
    "status" in filter ? posts.filter((post) => post.status === filter.status).length : posts.length;

  return (
    <div>
      <PageHeader
        title="Artículos"
        description="Todos los artículos, en cualquier estado. Solo los publicados con fecha alcanzada aparecen en el blog público."
        actions={
          <Link href="/admin/posts/new" className="cq-btn" data-variant="primary">
            <IconPlus size={16} />
            Nuevo artículo
          </Link>
        }
      />

      <Panel>
        <div className="cq-panel-head flex flex-wrap items-center gap-1 px-3 py-2">
          {FILTERS.map((filter) => {
            const isActive = filter.key === active;
            return (
              <Link
                key={filter.key}
                href={filter.key === "todos" ? "/admin/posts" : `/admin/posts?estado=${filter.key}`}
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
          <EmptyState
            title="Ningún artículo en este estado"
            hint="Probá con otro filtro para ver el resto."
            action={
              <Link href="/admin/posts" className="cq-btn" data-variant="ghost">
                Ver todos
              </Link>
            }
          />
        ) : (
          <ul>
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
          </ul>
        )}
      </Panel>
    </div>
  );
}
