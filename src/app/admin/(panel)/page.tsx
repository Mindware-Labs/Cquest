import type { CSSProperties } from "react";
import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { getPosts } from "@/lib/posts";
import { IconExternal, IconPencil, IconPlus } from "@/components/admin/ui/icons";
import { IconLinkButton, LinkButton } from "@/components/admin/ui/Button";
import { ModulePage } from "@/components/admin/ui/ModulePage";
import { EmptyState, Ident, Section, StatusBadge } from "@/components/admin/ui/Surface";
import { CategoryDonut, buildVolumeSeries } from "./charts";
import { VolumeBars } from "./VolumeBars";

const dateFormat = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DAY = 24 * 60 * 60 * 1000;

/* Últimos 30 días contra los 30 anteriores. Es la comparación mínima que hace
   útil una cifra: sin ella, "128 publicados" es un número que nadie usa para
   decidir nada.

   Vive fuera del componente a propósito. Lee el reloj, y el reloj es una fuente
   impura: React exige que el cuerpo de un componente sea idempotente, y su
   linter marca `Date.now()` ahí aunque acá sea un Server Component asíncrono
   que corre una vez por pedido. Sacarlo a una función deja explícito dónde está
   el efecto en vez de esconderlo entre el resto del render. */
function comparePeriods(dates: Date[]) {
  const now = new Date();
  const stamp = now.getTime();
  return {
    lastPeriod: dates.filter((date) => stamp - date.getTime() <= 30 * DAY).length,
    previousPeriod: dates.filter((date) => {
      const age = stamp - date.getTime();
      return age > 30 * DAY && age <= 60 * DAY;
    }).length,
    /* La serie del gráfico también depende del reloj, así que se calcula acá
       mismo: un solo `new Date()` para toda la pantalla evita que la ventana de
       comparación y la del gráfico caigan en meses distintos si el render cae
       justo en el cambio de mes. */
    volume: buildVolumeSeries(dates, now),
  };
}

/* El tablero.

   La estructura es la de un panel denso de KPIs: cifras arriba, la serie
   temporal ocupando el bloque principal, el reparto al costado, y debajo las
   dos listas de trabajo. Cada bloque muestra un dato que este panel realmente
   tiene — no hay ninguno puesto para completar la grilla.

   El orden de lectura sigue siendo el mismo de antes y es deliberado: primero
   qué falta hacer, después cómo viene el ritmo. Un tablero que abre con el
   total de artículos publicados informa; uno que abre con lo que está a medio
   escribir sirve. */
export default async function AdminHomePage() {
  const [categories, posts] = await Promise.all([getCategories(), getPosts()]);

  const published = posts.filter((post) => post.status === "PUBLISHED");
  const drafts = posts.filter((post) => post.status === "DRAFT");
  const hidden = posts.filter((post) => post.status === "HIDDEN");

  const pending = [...drafts, ...hidden].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );

  /* Sin recorte: la tarjeta tiene su propio desplazamiento, así que mostrar
     todo el histórico no estira la página. Antes se cortaba en seis y había que
     irse a otra pantalla para ver el séptimo. */
  const recent = [...published].sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
  );

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
    <ModulePage
      title="Inicio"
      path="admin"
      description="Qué falta hacer"
      actions={
        <LinkButton href="/admin/posts/new" variant="solid" icon={<IconPlus size={15} />}>
          Nuevo artículo
        </LinkButton>
      }
      stats={[
        {
          label: "Publicados",
          value: published.length,
          href: "/admin/posts?estado=publicado",
          accent: "published",
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
        },
        {
          label: "Ocultos",
          value: hidden.length,
          hint: "Retirados del sitio, no borrados",
          href: "/admin/posts?estado=oculto",
          accent: "pending",
        },
        {
          label: "Categorías",
          value: categories.length,
          hint: `${posts.length} ${posts.length === 1 ? "artículo" : "artículos"} en total`,
          href: "/admin/categories",
          accent: "category",
        },
      ]}
    >
      {/* `items-stretch` y no `items-start`: así las dos tarjetas de la fila
          miden lo mismo aunque su contenido no. Con `items-start` cada una
          medía lo que ocupaba adentro y quedaban desparejas al mismo nivel, que
          es lo que se veía mal. Lo mismo en la fila de abajo. */}
      {/* El escalonado se declara elemento por elemento y NO en el contenedor:
          animar la grilla y sus hijos a la vez encadena dos transformaciones
          sobre la misma caja y el resultado tiembla. Los índices siguen a los
          cuatro KPIs, así que la pantalla entra en un solo barrido de arriba
          abajo en vez de aparecer de golpe. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-stretch">
        <Section
          title="Volumen publicado"
          boxed
          accent="volume"
          className="cq-enter flex flex-col"
          style={{ "--cq-i": 4 } as CSSProperties}
        >
          <VolumeBars data={volume} />
        </Section>

        <Section
          title="Por categoría"
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

      {/* Las dos listas de trabajo, en la MISMA caja que los gráficos.

          Antes iban abiertas, con su regla arriba, mientras los gráficos iban
          en tarjeta. Eran dos lenguajes en una sola pantalla, y eso es lo que
          hacía que el tablero se leyera como secciones sueltas en vez de como
          un módulo. Una sola gramática: todo lo que es un bloque de datos vive
          en una tarjeta, y el aire entre tarjetas es el que separa. */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <Section
          title="Sin publicar"
          count={pending.length}
          boxed
          accent="pending"
          className="cq-enter flex max-h-[22rem] flex-col"
          style={{ "--cq-i": 6 } as CSSProperties}
          actions={
            pending.length > 6 ? (
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
              rows={2}
              action={
                <LinkButton href="/admin/posts/new" icon={<IconPlus size={15} />}>
                  Escribir uno nuevo
                </LinkButton>
              }
            />
          ) : (
            /* La lista se desplaza DENTRO de la tarjeta y muestra todo lo
               pendiente, no los primeros seis: recortar a seis obligaba a irse
               a otra pantalla para ver el resto. */
            <ul className="cq-ledger cq-scroll pb-2">
              {pending.map((post, index) => (
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
                  <StatusBadge status={post.status} />
                  <span className="cq-row-actions">
                    <IconLinkButton
                      href={`/admin/posts/${post.id}/edit`}
                      label={`Continuar «${post.title}»`}
                      size="sm"
                      icon={<IconPencil size={14} />}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Últimos publicados"
          count={recent.length}
          boxed
          accent="published"
          className="cq-enter flex max-h-[22rem] flex-col"
          style={{ "--cq-i": 7 } as CSSProperties}
        >
          {recent.length === 0 ? (
            <EmptyState
              title="Todavía no publicaste nada"
              hint="El blog muestra artículos en estado Publicado cuya fecha ya llegó."
              rows={2}
            />
          ) : (
            <ul className="cq-ledger cq-scroll pb-2">
              {recent.map((post, index) => (
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
