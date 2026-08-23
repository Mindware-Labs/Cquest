import Link from "next/link";
import { blockArraySchema, type Block } from "@/lib/blocks";
import { STARTER_TEMPLATES, deleteTemplate, getTemplates } from "@/lib/templates";
import { IconPlus, IconSearch } from "@/components/admin/ui/icons";
import { LinkButton } from "@/components/admin/ui/Button";
import { SearchField } from "@/components/admin/ui/Field";
import { ModulePage } from "@/components/admin/ui/ModulePage";
import { EmptyState } from "@/components/admin/ui/Surface";
import { TemplateThumb } from "@/components/admin/ui/TemplateThumb";
import TemplateCard, { type TemplateItem } from "./TemplateCard";

/* Los datos de la tarjeta viajan separados de los bloques que dibujan su
   miniatura. `TemplateItem` cruza al cliente —la tarjeta lleva estado— y no
   tiene sentido serializarle el árbol de bloques entero para algo que se
   renderiza acá y baja como HTML. */
type Entry = { item: TemplateItem; blocks: Block[] };

const CREATED_AT = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

/* El origen es un recorte de la lista, no una sección aparte. Misma gramática
   que la barra de Artículos: pestañas con regla debajo y el conteo al lado. */
const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "sistema", label: "Del sistema" },
  { key: "equipo", label: "Del equipo" },
] as const;

const SORTS = {
  nombre: "Nombre (A–Z)",
  recientes: "Más recientes",
  bloques: "Más bloques",
} as const;

type FilterKey = (typeof FILTERS)[number]["key"];
type SortKey = keyof typeof SORTS;

function isFilterKey(value: string | undefined): value is FilterKey {
  return FILTERS.some((filter) => filter.key === value);
}

function isSortKey(value: string | undefined): value is SortKey {
  return value !== undefined && value in SORTS;
}

/* Los mismos rótulos que usa la miniatura para su texto alternativo. Viven acá
   además porque la búsqueda los mira: "cuál era la que tenía tabla" es una
   pregunta real, y buscar sólo por nombre no la contesta. */
const BLOCK_LABEL: Record<string, string> = {
  heading: "Título",
  paragraph: "Párrafo",
  image: "Imagen",
  gallery: "Galería",
  video: "Video",
  quote: "Cita",
  list: "Lista",
  table: "Tabla",
  cta: "Llamado",
  columns: "Columnas",
  divider: "Separador",
};

/* Un href que conserva TODO lo que ya estaba puesto. Sin esto, tocar un filtro
   borra la búsqueda y buscar borra el filtro: dos controles que se pisan son
   peores que tener uno solo. */
function buildHref({ origen, q, orden }: { origen?: FilterKey; q?: string; orden?: SortKey }) {
  const params = new URLSearchParams();
  if (origen && origen !== "todas") params.set("origen", origen);
  if (q) params.set("q", q);
  if (orden && orden !== "nombre") params.set("orden", orden);
  const query = params.toString();
  return query ? `/admin/templates?${query}` : "/admin/templates";
}

function normalize(value: string) {
  /* Sin acentos y en minúscula: "Articulo" tiene que encontrar "Artículo". En
     un panel en español, una búsqueda sensible a tildes falla más de lo que
     acierta. */
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default async function AdminTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ origen?: string; q?: string; orden?: string }>;
}) {
  const { origen, q, orden } = await searchParams;

  /* Todo el recorte vive en la URL y no en estado de cliente: una pestaña con
     "sólo las del equipo, ordenadas por bloques" se puede compartir, recargar y
     volver atrás. Es la decisión que ya tomó Artículos. */
  const active: FilterKey = isFilterKey(origen) ? origen : "todas";
  const sort: SortKey = isSortKey(orden) ? orden : "nombre";
  const term = q?.trim() ?? "";

  const saved = await getTemplates();

  /* Los dos orígenes se normalizan a la MISMA forma antes de tocar el marcado.
     Ahí está el arreglo de fondo: mientras cada origen tenía su propio
     componente, cualquier cambio había que hacerlo dos veces y las dos versiones
     se iban separando. Ahora hay un tipo, una tarjeta y un lugar donde editarla.

     `choiceKey` se arma con el mismo formato que `lib/templateChoices.ts`,
     que es lo que el editor lee del parámetro `?plantilla=`. Si los dos lados se
     separan, el enlace "Usar" abre el editor en blanco sin decir por qué. */
  const system: Entry[] = STARTER_TEMPLATES.map((template) => ({
    blocks: template.blocks,
    item: {
      key: `system-${template.id}`,
      choiceKey: `starter:${template.id}`,
      name: template.name.es,
      types: template.blocks.map((block) => block.type),
      blockCount: template.blocks.length,
      origin: "system",
    },
  }));

  const team: Entry[] = saved.map((template) => {
    /* El contador de bloques sale del contenido validado: una plantilla vieja
       que ya no encaja se muestra con 0 en vez de romper la pantalla entera. Y
       sin `choiceKey`, porque `getTemplateChoices` la descarta: la tarjeta dice
       que no se puede aplicar en vez de ofrecer un enlace que no hace nada. */
    const parsed = blockArraySchema.safeParse(template.blocks);
    return {
      blocks: parsed.success ? parsed.data : [],
      item: {
        key: `team-${template.id}`,
        choiceKey: parsed.success ? `saved:${template.id}` : null,
        id: template.id,
        name: template.name,
        types: parsed.success ? parsed.data.map((block) => block.type) : [],
        blockCount: parsed.success ? parsed.data.length : 0,
        isBroken: !parsed.success,
        origin: "team",
        authorName: template.author.name,
        createdAt: CREATED_AT.format(template.createdAt),
      },
    };
  });

  const counts = { todas: system.length + team.length, sistema: system.length, equipo: team.length };

  const pool = active === "sistema" ? system : active === "equipo" ? team : [...system, ...team];

  const needle = normalize(term);
  const matched = needle
    ? pool.filter(({ item }) => {
        const haystack = [
          item.name,
          item.authorName ?? "",
          ...item.types.map((type) => BLOCK_LABEL[type] ?? type),
        ].join(" ");
        return normalize(haystack).includes(needle);
      })
    : pool;

  const visible = [...matched].sort(({ item: a }, { item: b }) => {
    if (sort === "bloques") return b.blockCount - a.blockCount;
    if (sort === "recientes") {
      /* Las del sistema no tienen fecha: viven en código desde siempre. En vez
         de inventarles una, se ordenan después de las del equipo conservando el
         orden del catálogo. "Más recientes" habla de lo que el equipo guardó. */
      if (a.origin !== b.origin) return a.origin === "team" ? -1 : 1;
      if (a.origin === "team" && b.origin === "team") {
        return (b.id ?? 0) - (a.id ?? 0);
      }
      return 0;
    }
    return a.name.localeCompare(b.name, "es");
  });

  return (
    /* La acción primaria nombra su destino real. NO dice "Nueva plantilla":
       en este producto una plantilla no se crea acá, se guarda desde el editor
       con «Guardar como plantilla». Un botón con ese rótulo abriría el editor de
       artículos y prometería algo que la pantalla siguiente no cumple. */
    <ModulePage title="Plantillas" description="Estructuras de bloques reutilizables">
      <div className="cq-enter">
        <h2 className="sr-only">
          {FILTERS.find((filter) => filter.key === active)?.label} — {visible.length}
        </h2>

        {/* Todo lo que recorta la grilla vive CON la grilla, en una sola barra:
            filtro, búsqueda, orden y la acción primaria. El botón estaba suelto
            arriba, sin nada a lo que pertenecer — flotaba porque no tenía
            barra. Acá tiene una, y de paso el ojo encuentra en un solo lugar
            todo lo que puede hacer en esta pantalla. */}
        <div className="cq-table-toolbar">
          <nav aria-label="Filtrar por origen" className="flex flex-wrap items-center gap-1">
            {FILTERS.map((filter) => (
              <Link
                key={filter.key}
                /* Cambiar de pestaña conserva búsqueda y orden: son
                   preferencias de lectura, no parte del recorte. */
                href={buildHref({ origen: filter.key, q: term, orden: sort })}
                aria-current={filter.key === active ? "true" : undefined}
                className="cq-tab"
              >
                {filter.label}
                <span className="cq-tab-count">{counts[filter.key]}</span>
              </Link>
            ))}
          </nav>

          {/* Un <form> con method GET y no un input controlado: la búsqueda
              funciona sin una línea de JavaScript, el resultado es una URL que
              se puede compartir, y el historial se comporta como la gente
              espera. Igual que en Artículos. */}
          <form method="get" action="/admin/templates" role="search" className="flex items-center gap-2">
            {active !== "todas" && <input type="hidden" name="origen" value={active} />}
            {sort !== "nombre" && <input type="hidden" name="orden" value={sort} />}
            <SearchField
              id="template-search"
              name="q"
              label="Buscar plantillas por nombre, autor o tipo de bloque"
              defaultValue={term}
              placeholder="Buscar…"
              icon={<IconSearch size={15} className="cq-field-icon" />}
              className="w-[9rem] sm:w-[13rem]"
            />
            <button type="submit" className="cq-btn" data-variant="outline" data-size="sm">
              Buscar
            </button>
            {/* Limpiar aparece SÓLO con algo escrito: un botón permanente al
                lado de un campo vacío es un control que no hace nada. */}
            {term && (
              <Link
                href={buildHref({ origen: active, orden: sort })}
                className="cq-btn"
                data-variant="ghost"
                data-size="sm"
              >
                Limpiar
              </Link>
            )}
          </form>

          <form method="get" action="/admin/templates" className="flex items-center gap-2">
            {active !== "todas" && <input type="hidden" name="origen" value={active} />}
            {term && <input type="hidden" name="q" value={term} />}
            <label htmlFor="template-sort" className="cq-label whitespace-nowrap">
              Orden
            </label>
            <select id="template-sort" name="orden" defaultValue={sort} className="cq-select w-[10rem]">
              {Object.entries(SORTS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button type="submit" className="cq-btn" data-variant="outline" data-size="sm">
              Aplicar
            </button>
          </form>

          <LinkButton href="/admin/posts/new" variant="solid" icon={<IconPlus size={15} />}>
            Nuevo artículo
          </LinkButton>
        </div>

        {visible.length === 0 ? (
          /* Dos vacíos distintos, no uno genérico. "No hay resultados" obliga a
             adivinar si el problema es la búsqueda o que no existe nada — y cada
             caso se sale por una puerta diferente. */
          term ? (
            <EmptyState
              title={`Nada coincide con «${term}»`}
              hint="Se busca en el nombre, el autor y los tipos de bloque que la plantilla contiene."
              rows={2}
              action={
                <LinkButton href={buildHref({ origen: active, orden: sort })}>
                  Limpiar la búsqueda
                </LinkButton>
              }
            />
          ) : (
            <EmptyState
              title="Todavía no hay plantillas del equipo"
              hint="Una plantilla es la estructura de bloques que repetís. Armá un artículo como te gusta y guardalo desde el editor con «Guardar como plantilla»: queda disponible para todo el equipo."
              rows={2}
              action={
                <LinkButton href="/admin/posts/new" variant="solid" icon={<IconPlus size={15} />}>
                  Abrir el editor
                </LinkButton>
              }
            />
          )
        ) : (
          /* Grilla fluida: una columna en móvil y hasta cuatro en pantalla
             ancha. Los cortes son por ANCHO DE TARJETA y no por dispositivo —a
             240px la miniatura deja de leerse como página. */
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visible.map(({ item, blocks }, index) => (
              <TemplateCard
                key={item.key}
                index={index}
                template={item}
                /* La miniatura se renderiza ACÁ, en el servidor, y baja armada.
                   `BlockRenderer` es un server component; si la tarjeta —que es
                   de cliente— lo importara, se llevaría los once renderers de
                   bloque al bundle del navegador para dibujar algo que nunca
                   cambia después del primer pintado. */
                thumb={<TemplateThumb blocks={blocks} />}
                deleteAction={item.origin === "team" ? deleteTemplate : undefined}
              />
            ))}
          </ul>
        )}
      </div>
    </ModulePage>
  );
}
