import Link from "next/link";
import { deletePost, getPosts, setPostStatus } from "@/lib/posts";
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

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div className="pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground">
          Artículos
        </h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-verde px-4 py-2.5 text-[0.85rem] font-semibold text-white transition-colors hover:bg-verde/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
        >
          Nuevo artículo
        </Link>
      </div>
      <p className="mt-2 max-w-[42rem] text-[0.92rem] leading-relaxed text-[var(--text-secondary)]">
        Todos los artículos, en cualquier estado. Solo los publicados con fecha
        alcanzada aparecen en el blog público.
      </p>

      <div className="mt-7 rounded-xl border border-border bg-[var(--surface-raised)] px-6">
        {posts.length === 0 ? (
          <p className="py-12 text-center text-[0.9rem] text-[var(--text-tertiary)]">
            Todavía no hay artículos.
          </p>
        ) : (
          <ul>
            {posts.map((post) => (
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
      </div>
    </div>
  );
}
