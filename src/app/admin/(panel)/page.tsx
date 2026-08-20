import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { getPosts } from "@/lib/posts";
import { IconExternal, IconPencil, IconPlus } from "@/components/admin/ui/icons";
import {
  EmptyState,
  Meter,
  PageHeader,
  Panel,
  PanelHead,
  StatusBadge,
} from "@/components/admin/ui/Surface";

const dateFormat = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/* El inicio no es un tablero de cifras: es la respuesta a "¿qué me falta hacer?".
   Por eso lo primero de la página es el trabajo sin terminar y no el total de
   artículos, que es un número que nadie usa para decidir nada. */
export default async function AdminHomePage() {
  const [categories, posts] = await Promise.all([getCategories(), getPosts()]);

  const published = posts.filter((post) => post.status === "PUBLISHED");
  const drafts = posts.filter((post) => post.status === "DRAFT");
  const hidden = posts.filter((post) => post.status === "HIDDEN");

  const pending = [...drafts, ...hidden].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );

  const recent = [...published]
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
    .slice(0, 5);

  const byCategory = categories
    .map((category) => ({
      name: category.name,
      count: posts.filter((post) => post.categoryId === category.id).length,
    }))
    .sort((a, b) => b.count - a.count);

  const maxCategory = byCategory.reduce((max, entry) => Math.max(max, entry.count), 0);

  return (
    <div>
      <PageHeader
        title="Inicio"
        description="Lo que está sin publicar, primero. Después, cómo quedó repartido el blog."
        actions={
          <Link href="/admin/posts/new" className="cq-btn" data-variant="primary">
            <IconPlus size={16} />
            Nuevo artículo
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="grid gap-5">
          <Panel>
            <PanelHead title="Sin publicar" count={pending.length} />
            {pending.length === 0 ? (
              <EmptyState
                title="No queda nada pendiente"
                hint="Todos los artículos que existen están publicados. Cuando guardes un borrador o escondas uno publicado, aparece acá."
                action={
                  <Link href="/admin/posts/new" className="cq-btn" data-variant="ghost">
                    <IconPlus size={16} />
                    Escribir uno nuevo
                  </Link>
                }
              />
            ) : (
              <ul>
                {pending.slice(0, 6).map((post) => (
                  <li
                    key={post.id}
                    className="cq-row flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-5 py-3.5 last:border-b-0"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.92rem] font-semibold text-foreground">
                        {post.title}
                      </span>
                      <span className="mt-0.5 block text-[0.78rem] text-[var(--text-tertiary)]">
                        {post.category.name} · editado el {dateFormat.format(post.updatedAt)}
                      </span>
                    </span>
                    <StatusBadge status={post.status} />
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="cq-btn"
                      data-variant="ghost"
                      data-size="sm"
                    >
                      <IconPencil size={14} />
                      Continuar
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {pending.length > 6 && (
              <div className="border-t border-border px-5 py-3">
                <Link
                  href="/admin/posts"
                  className="text-[0.84rem] font-semibold text-petroleo underline underline-offset-2"
                >
                  Ver los {pending.length} pendientes
                </Link>
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHead title="Últimos publicados" />
            {recent.length === 0 ? (
              <EmptyState
                title="Todavía no publicaste nada"
                hint="El blog público muestra artículos en estado Publicado cuya fecha ya llegó."
              />
            ) : (
              <ul>
                {recent.map((post) => (
                  <li
                    key={post.id}
                    className="cq-row flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-5 py-3.5 last:border-b-0"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.92rem] text-foreground">
                        {post.title}
                      </span>
                      <span className="mt-0.5 block text-[0.78rem] text-[var(--text-tertiary)]">
                        {post.publishedAt ? dateFormat.format(post.publishedAt) : "Sin fecha"} ·{" "}
                        {post.locale.toUpperCase()}
                      </span>
                    </span>
                    <Link
                      href={`/${post.locale}/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="cq-btn"
                      data-variant="quiet"
                      data-size="sm"
                    >
                      <IconExternal size={14} />
                      Ver
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-5">
          <Panel>
            <PanelHead title="Estado editorial" />
            {/* Tres cifras en una lista de definición, no tres tarjetas iguales:
                ocupan lo que valen y se comparan de un vistazo. */}
            <dl className="divide-y divide-border">
              {[
                { label: "Publicados", value: published.length, status: "PUBLISHED" },
                { label: "Borradores", value: drafts.length, status: "DRAFT" },
                { label: "Ocultos", value: hidden.length, status: "HIDDEN" },
              ].map((entry) => (
                <div key={entry.label} className="flex items-center justify-between px-5 py-3">
                  <dt className="flex items-center gap-2.5">
                    <StatusBadge status={entry.status} />
                  </dt>
                  <dd className="font-heading text-[1.35rem] leading-none font-semibold text-foreground tabular-nums">
                    {entry.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel>
            <PanelHead title="Por categoría" count={categories.length} />
            {byCategory.length === 0 ? (
              <EmptyState
                title="Sin categorías"
                hint="Un artículo necesita una categoría para poder crearse."
                action={
                  <Link href="/admin/categories" className="cq-btn" data-variant="ghost">
                    Crear la primera
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-3.5 px-5 py-4">
                {byCategory.map((entry) => (
                  <Meter
                    key={entry.name}
                    label={entry.name}
                    value={entry.count}
                    total={maxCategory}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
