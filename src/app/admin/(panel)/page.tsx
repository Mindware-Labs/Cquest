import type { CSSProperties } from "react";
import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { displayStatus, getPosts, updatePostMeta } from "@/lib/posts";
import {
  IconCategories,
  IconChartBars,
  IconChartDonut,
  IconCheckCircle,
  IconClock,
  IconExternal,
  IconEyeOff,
  IconPencil,
  IconPlus,
} from "@/components/admin/ui/icons";
import { IconLinkButton, LinkButton } from "@/components/admin/ui/Button";
import { ModulePage } from "@/components/admin/ui/ModulePage";
import { EmptyState, Ident, Section, StatusBadge } from "@/components/admin/ui/Surface";
import PostQuickEdit from "./posts/PostQuickEdit";
import { buildVolumeSeries } from "./charts";
import { CategoryDonut } from "./CategoryDonut";
import { VolumeBars } from "./VolumeBars";

const dateFormat = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DAY = 24 * 60 * 60 * 1000;

// Últimos 30 días contra los 30 anteriores, para que la cifra sirva para decidir algo. Vive fuera del componente porque lee el reloj (fuente impura) y el linter marca Date.now() en el cuerpo del componente.
function comparePeriods(dates: Date[]) {
  const now = new Date();
  const stamp = now.getTime();
  return {
    lastPeriod: dates.filter((date) => stamp - date.getTime() <= 30 * DAY).length,
    previousPeriod: dates.filter((date) => {
      const age = stamp - date.getTime();
      return age > 30 * DAY && age <= 60 * DAY;
    }).length,
    // Un solo new Date() para toda la pantalla: evita que la ventana de comparación y la del gráfico caigan en meses distintos si el render cae justo en el cambio de mes.
    volume: buildVolumeSeries(dates, now),
  };
}

// El orden de lectura es deliberado: primero qué falta hacer, después cómo viene el ritmo — un tablero que abre con lo pendiente sirve más que uno que abre con lo ya publicado.
export default async function AdminHomePage() {
  const [categories, posts] = await Promise.all([getCategories(), getPosts()]);

  // El estado VISIBLE, igual que en la tabla: un artículo publicado con fecha futura está programado, no publicado.
  const now = new Date();
  const withStatus = posts.map((post) => ({ ...post, display: displayStatus(post, now) }));

  const published = withStatus.filter((post) => post.display === "PUBLISHED");
  const scheduled = withStatus.filter((post) => post.display === "SCHEDULED");
  const drafts = withStatus.filter((post) => post.display === "DRAFT");
  const hidden = withStatus.filter((post) => post.display === "HIDDEN");

  // Lo programado entra en "pendiente" y no en "publicado": todavía es trabajo que puede cambiar de opinión.
  const pending = [...drafts, ...scheduled, ...hidden].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );

  const recent = [...published].sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
  );

  // Las listas se acotan por CANTIDAD y no por altura con scroll propio: antes competían con la barra de la página y una fila cortada a medias se leía como error de dibujo.
  const PREVIEW = 6;

  const byCategory = categories
    .map((category) => ({
      name: category.name,
      count: posts.filter((post) => post.categoryId === category.id).length,
    }))
    .sort((a, b) => b.count - a.count);

  const publishedDates = published
    .map((post) => post.publishedAt)
    .filter((date): date is Date => date !== null);

  const { lastPeriod, previousPeriod, volume } = comparePeriods(publishedDates);

  return (
    // Sin acción primaria a propósito: el tablero es de LECTURA, escribir un artículo se hace en Artículos. Sin `actions`, ModulePage no dibuja la franja.
    <ModulePage
      title="Inicio"
      description="Qué falta hacer"
      stats={[
        {
          label: "Publicados",
          value: published.length,
          href: "/admin/posts?estado=publicado",
          accent: "published",
          // Un icono por cifra en vez del punto de acento anterior: nombra el dato de un vistazo en una tira de números iguales en tipografía y tamaño.
          icon: <IconCheckCircle size={15} />,
          delta: {
            value: lastPeriod - previousPeriod,
            label: `${lastPeriod} en los últimos 30 días`,
          },
        },
        {
          label: "Borradores",
          value: drafts.length,
          hint: drafts.length === 0 ? "Nada a medio escribir" : "Sin publicar todavía",
          href: "/admin/posts?estado=borrador",
          accent: "pending",
          icon: <IconPencil size={15} />,
        },
        {
          label: "Ocultos",
          value: hidden.length,
          hint: "Retirados del sitio, no borrados",
          href: "/admin/posts?estado=oculto",
          accent: "pending",
          icon: <IconEyeOff size={15} />,
        },
        {
          label: "Categorías",
          value: categories.length,
          hint: `${posts.length} ${posts.length === 1 ? "artículo" : "artículos"} en total`,
          href: "/admin/categories",
          accent: "category",
          icon: <IconCategories size={15} />,
        },
      ]}
    >
      {/* items-stretch y no items-start: así las dos tarjetas miden lo mismo aunque su contenido no. */}
      {/* El escalonado se declara elemento por elemento y no en el contenedor: animar la grilla y sus hijos a la vez encadena dos transformaciones y tiembla. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-stretch">
        <Section
          title="Volumen publicado"
          icon={<IconChartBars />}
          boxed
          accent="volume"
          className="cq-enter flex flex-col"
          style={{ "--cq-i": 4 } as CSSProperties}
        >
          <VolumeBars data={volume} />
        </Section>

        <Section
          title="Por categoría"
          icon={<IconChartDonut />}
          count={categories.length}
          as="aside"
          boxed
          accent="category"
          className="cq-enter flex flex-col"
          style={{ "--cq-i": 5 } as CSSProperties}
        >
          {byCategory.length === 0 ? (
            <EmptyState
              title="Sin categorías"
              hint="Un artículo necesita una categoría para poder crearse."
              rows={2}
              action={<LinkButton href="/admin/categories">Crear la primera</LinkButton>}
            />
          ) : (
            <CategoryDonut data={byCategory} />
          )}
        </Section>
      </div>

      {/* Las listas de trabajo van en tarjeta, igual que los gráficos: antes iban abiertas con regla arriba y el tablero se leía como secciones sueltas en vez de un módulo. */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <Section
          title="Sin publicar"
          icon={<IconClock />}
          count={pending.length}
          boxed
          accent="pending"
          className="cq-enter flex flex-col"
          style={{ "--cq-i": 6 } as CSSProperties}
          actions={
            pending.length > PREVIEW ? (
              <Link href="/admin/posts" className="cq-link cq-meta">
                Ver los {pending.length}
              </Link>
            ) : undefined
          }
        >
          {pending.length === 0 ? (
            <EmptyState
              title="No queda nada pendiente"
              hint="Todo lo que existe está publicado."
              plain
              action={
                <LinkButton href="/admin/posts/new" icon={<IconPlus size={15} />}>
                  Escribir uno nuevo
                </LinkButton>
              }
            />
          ) : (
            <ul className="cq-ledger pb-2">
              {pending.slice(0, PREVIEW).map((post, index) => (
                <li
                  key={post.id}
                  className="cq-row cq-enter flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--p-line)] py-2 last:border-b-0"
                  style={{ "--cq-i": Math.min(index, 8) } as CSSProperties}
                >
                  <span className="cq-ledger-n w-6 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="cq-title block truncate hover:underline"
                    >
                      {post.title}
                    </Link>
                    <span className="cq-meta mt-0.5 block truncate">
                      {post.category.name} · editado el {dateFormat.format(post.updatedAt)}
                    </span>
                  </span>
                  <StatusBadge status={post.display} />
                  <span className="cq-row-actions">
                    {/* El lápiz abre la ficha en un cajón; el título sigue llevando al editor de bloques — misma división que en la tabla de Artículos. */}
                    <PostQuickEdit
                      label={`Editar la ficha de «${post.title}»`}
                      categories={categories}
                      action={updatePostMeta}
                      post={{
                        id: post.id,
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                        categoryId: post.categoryId,
                        locale: post.locale,
                        seoTitle: post.seoTitle ?? "",
                        seoDescription: post.seoDescription ?? "",
                        // Guarda de concurrencia: el servidor compara esta marca antes de escribir.
                        updatedAtIso: post.updatedAt.toISOString(),
                        status: post.status,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Últimos publicados"
          icon={<IconCheckCircle />}
          count={recent.length}
          boxed
          accent="published"
          className="cq-enter flex flex-col"
          style={{ "--cq-i": 7 } as CSSProperties}
          actions={
            recent.length > PREVIEW ? (
              <Link href="/admin/posts?estado=publicado" className="cq-link cq-meta">
                Ver los {recent.length}
              </Link>
            ) : undefined
          }
        >
          {recent.length === 0 ? (
            <EmptyState
              title="Todavía no publicaste nada"
              hint="El blog muestra artículos en estado Publicado cuya fecha ya llegó."
              rows={2}
            />
          ) : (
            <ul className="cq-ledger pb-2">
              {recent.slice(0, PREVIEW).map((post, index) => (
                <li
                  key={post.id}
                  className="cq-row cq-enter flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--p-line)] py-2 last:border-b-0"
                  style={{ "--cq-i": Math.min(index, 8) } as CSSProperties}
                >
                  <span className="cq-ledger-n w-6 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="cq-body block truncate text-[var(--p-ink)] hover:underline"
                    >
                      {post.title}
                    </Link>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="cq-meta">
                        {post.publishedAt ? dateFormat.format(post.publishedAt) : "Sin fecha"}
                      </span>
                      <Ident chip>{post.locale.toUpperCase()}</Ident>
                    </span>
                  </span>
                  <span className="cq-row-actions">
                    <IconLinkButton
                      href={`/${post.locale}/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      label={`Ver «${post.title}» en el blog público`}
                      size="sm"
                      icon={<IconExternal size={14} />}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </ModulePage>
  );
}
