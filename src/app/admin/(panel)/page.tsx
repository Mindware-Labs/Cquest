import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { getPosts } from "@/lib/posts";
import {
  IconArticles,
  IconCategories,
  IconExternal,
  IconEyeOff,
  IconPencil,
  IconPlus,
} from "@/components/admin/ui/icons";
import {
  EmptyState,
  Meter,
  PageHeader,
  Panel,
  PanelHead,
  StatCard,
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
        actions={
          <Link href="/admin/posts/new" className="cq-btn" data-variant="primary">
            <IconPlus size={16} />
            Nuevo artículo
          </Link>
        }
      />

      {/* La fila de cifras. Va arriba porque es el resumen, no porque sea lo más
          importante: lo que hay que HACER sigue estando en el primer panel de
          abajo. Cada tarjeta lleva a la pantalla donde ese número se trabaja —
          una cifra sin destino es un adorno. */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Publicados"
          value={published.length}
          hint="Visibles en el blog público"
          icon={<IconArticles size={18} />}
          accent="var(--brand-verde)"
          href="/admin/posts"
        />
        <StatCard
          label="Borradores"
          value={drafts.length}
          hint={drafts.length === 0 ? "Nada a medio escribir" : "Sin publicar todavía"}
          icon={<IconPencil size={18} />}
          accent="var(--brand-petroleo)"
          href="/admin/posts"
        />
        <StatCard
          label="Ocultos"
          value={hidden.length}
          hint="Retirados del sitio, no borrados"
          icon={<IconEyeOff size={18} />}
          accent="#8a5a00"
          href="/admin/posts"
        />
        <StatCard
          label="Categorías"
          value={categories.length}
          hint={`${posts.length} ${posts.length === 1 ? "artículo" : "artículos"} en total`}
          icon={<IconCategories size={18} />}
          accent="var(--brand-celeste)"
          href="/admin/categories"
        />
      </div>

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

        {/* El panel "Estado editorial" que estaba acá desapareció: decía
            exactamente los mismos tres números que ahora encabezan la página.
            Repetir un dato en dos lugares no es reforzarlo — obliga a mirar dos
            veces para confirmar que dicen lo mismo. */}
        <div className="grid content-start gap-5">
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
