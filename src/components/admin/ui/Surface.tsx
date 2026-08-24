import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IconWarning } from "./icons";

/* Superficies del panel. Todas son Server Components a propósito: ninguna
   necesita estado, así que ninguna paga el peso de enviarse al cliente. */

/* `PageHeader` vivía acá y no lo usaba nadie: los cuatro módulos arman su
   encabezado con `ModulePage`, que lo reimplementaba entero en vez de llamarlo.
   Un componente compartido con cero consumidores no es una abstracción
   disponible, es una segunda versión del mismo encabezado esperando que alguien
   la use y quede distinta de la primera. */

/* ---------------------------------------------------------------------------
   Section — LA FIRMA
   Una regla horizontal, el nombre en etiqueta chica, y la cifra en serif
   apoyada sobre la regla. La cifra es siempre un dato real: cuántas filas hay
   en esa sección. Nunca un número puesto para llenar.
--------------------------------------------------------------------------- */

export function Section({
  title,
  count,
  actions,
  children,
  className,
  style,
  as: Tag = "section",
  headingLevel: Heading = "h2",
  boxed = false,
  accent,
  hideHead = false,
  icon,
}: {
  title: string;
  /* Opcional: una sección que no cuenta nada no dibuja cifra en vez de dibujar
     un cero que no significa nada. */
  count?: number;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /* Sólo para el retraso del escalonado (`--cq-i`). No es una puerta para
     estilos sueltos: todo lo visual sale de los tokens. */
  style?: CSSProperties;
  as?: "section" | "div" | "aside";
  headingLevel?: "h2" | "h3";
  /* Cerrada, con filete alrededor. Para gráficos: sin marco, el área pintada
     flota y no se ve dónde termina el dato. Una tabla larga NO la usa — ahí el
     marco sólo agrega una línea que compite con las filas. */
  boxed?: boolean;
  /* Código de color del bloque. Regla de 3px arriba y título en ese color: es
     lo que permite reconocer de qué habla cada tarjeta sin leerla, y seguir el
     recorrido de un artículo por la pantalla. */
  accent?: "volume" | "category" | "pending" | "published";
  /* Oculta la fila de título dejándola en el árbol de accesibilidad.
     Es para cuando la sección ES la pantalla: repetir "Artículos" arriba de la
     tabla de artículos, en una vista que no tiene ninguna otra sección, sólo
     agrega una franja y hace que la tarjeta se lea como parte de algo más
     grande que no existe. El <h2> se queda para el lector de pantalla. */
  hideHead?: boolean;
  /* Icono del bloque, en el color del acento. Va con `hideHead` en falso: si el
     título no se dibuja, el icono tampoco tiene dónde apoyarse. */
  icon?: ReactNode;
}) {
  return (
    <Tag
      data-boxed={boxed ? "true" : undefined}
      data-accent={accent}
      style={style}
      className={clsx("cq-section", className)}
    >
      {/* La cifra grande sobre la regla se fue. Con cada bloque ya en tarjeta,
          había cuatro números de 32px compitiendo contra los KPIs de arriba —y
          los KPIs son los que de verdad hay que leer primero. El conteo sigue,
          pero como pastilla al lado del título: informa sin gritar. */}
      {hideHead ? (
        <Heading className="sr-only">
          {title}
          {typeof count === "number" ? ` — ${count}` : ""}
        </Heading>
      ) : (
        <div className="cq-section-head">
          <Heading className="cq-section-title flex min-w-0 items-center gap-2">
            {icon && (
              <span aria-hidden="true" className="cq-section-icon">
                {icon}
              </span>
            )}
            <span className="truncate">{title}</span>
            {typeof count === "number" && <span className="cq-section-count">{count}</span>}
          </Heading>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-1.5">{actions}</div>}
        </div>
      )}
      {/* `min-h-0` es obligatorio para que un hijo con scroll propio funcione:
          dentro de un contenedor flex, el mínimo automático de un elemento es
          su contenido, así que sin esto la lista empuja la tarjeta hasta
          desbordar en vez de desplazarse adentro. */}
      <div className="cq-section-body flex min-h-0 flex-1 flex-col">{children}</div>
    </Tag>
  );
}

/* `Panel` y `PanelHead` eran alias de compatibilidad para una migración del
   editor que ya terminó: cero consumidores. `PanelHead` además había quedado
   distinto de la cabecera de `Section` —sin `shrink-0` ni `flex-wrap` en las
   acciones—, o sea que el alias que existía para evitar dos gramáticas ya era
   la segunda gramática. */

/* Tarjeta. Sólo para elementos de una grilla: en una lista vertical separa el
   filete, no una caja. */
export function Card({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={clsx("cq-card", className)}>
        {children}
      </Link>
    );
  }
  return <div className={clsx("cq-card", className)}>{children}</div>;
}

/* ---------------------------------------------------------------------------
   Identificador del sistema
   ID, conteo, fecha, código. Se muestra en mono porque no se lee: se copia, se
   pega y se compara carácter por carácter. Que se VEA distinto del texto de
   interfaz es la mitad de su trabajo.

   La variante `path` —que anteponía una barra para dibujar una ruta— se fue con
   sus dos consumidores. Las rutas del panel no se muestran: la barra de
   direcciones ya las tiene, y repetirlas en la pantalla las convierte en un
   dato del contenido cuando son plomería.
--------------------------------------------------------------------------- */

export function Ident({
  children,
  chip = false,
  className,
}: {
  children: ReactNode;
  chip?: boolean;
  className?: string;
}) {
  return (
    <span className={clsx("cq-ident", chip && "cq-ident-chip", className)}>{children}</span>
  );
}

/* ---------------------------------------------------------------------------
   Cifra del tablero
   `href` opcional a propósito: con enlace es una puerta a la pantalla que
   explica el número; sin enlace es sólo un dato. Lo que NO hace es fingir —
   sin destino no cambia de color ni de cursor.
--------------------------------------------------------------------------- */

export function StatCard({
  label,
  value,
  hint,
  href,
  delta,
  accent,
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  /* Reemplaza al punto de color, no lo acompaña. El punto sólo codificaba el
     acento; el icono codifica el acento Y qué se cuenta, así que tener los dos
     es decir la misma cosa dos veces y gastar ancho de la etiqueta. */
  icon?: ReactNode;
  /* Variación contra el período anterior. Es lo que convierte una cifra en
     información: "128" no dice nada solo; "128, +12 en 30 días" sí. */
  delta?: { value: number; label: string };
  accent?: "volume" | "category" | "pending" | "published";
}) {
  const trend = delta ? (delta.value > 0 ? "up" : delta.value < 0 ? "down" : "flat") : undefined;

  const body = (
    <>
      {/* El punto de color ata esta cifra con el bloque que la desarrolla más
          abajo. Va antes de la etiqueta, no después: es lo primero que el ojo
          usa para agrupar. */}
      <span className="flex items-center gap-2">
        {icon ? (
          <span aria-hidden="true" className="cq-stat-icon">
            {icon}
          </span>
        ) : (
          accent && <span aria-hidden="true" className="cq-stat-dot" />
        )}
        <span className="cq-label">{label}</span>
      </span>
      <span className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="cq-display cq-stat-value">{value}</span>
        {delta && (
          /* El signo va SIEMPRE, no sólo el color. Verde y rojo son justamente
             el par que más gente no distingue; sin el signo, para esa persona
             las dos variaciones dicen lo mismo. */
          <span className="cq-delta" data-trend={trend}>
            {delta.value > 0 ? "+" : delta.value < 0 ? "−" : "="}
            {Math.abs(delta.value)}
            <span className="sr-only">
              {delta.value > 0 ? " más" : delta.value < 0 ? " menos" : " sin cambios"}
            </span>
          </span>
        )}
      </span>
      {delta && <span className="cq-meta mt-1 block">{delta.label}</span>}
      {hint && !delta && <span className="cq-meta mt-1.5 block">{hint}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} data-accent={accent} className="cq-stat h-full">
        {body}
      </Link>
    );
  }

  return (
    <div data-accent={accent} className="cq-stat h-full">
      {body}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Estado vacío
   No es texto centrado en gris: es la FORMA de lo que falta, en filete
   punteado, con la acción principal encima. Se ve qué iría ahí antes de leer
   una palabra, y la salida está a un clic.
--------------------------------------------------------------------------- */

export function EmptyState({
  title,
  hint,
  action,
  /* Cuántas filas fantasma dibujar. Tres es el mínimo para que se lea como una
     lista y no como una caja suelta. */
  rows = 3,
  /* Sin silueta: sólo el mensaje, centrado en el alto disponible de la tarjeta.
     Para bloques donde el fantasma de una lista no aporta nada. */
  plain = false,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  rows?: number;
  plain?: boolean;
}) {
  if (plain) {
    return (
      <div className="cq-empty flex flex-1 flex-col items-center justify-center gap-2 px-6 py-8 text-center">
        <p className="cq-title">{title}</p>
        {hint && <p className="cq-meta max-w-[52ch]">{hint}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }

  return (
    <div className="cq-empty">
      <div className="cq-ghost relative overflow-hidden px-4 py-4">
        {/* La silueta. `aria-hidden` porque no dice nada que el título no diga:
            un lector de pantalla no necesita recorrer nueve barras vacías. */}
        <div aria-hidden="true" className="grid gap-4 opacity-70">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="cq-ghost-bar w-6 shrink-0" />
              <div className="grid flex-1 gap-1.5">
                <div className="cq-ghost-bar" style={{ width: `${62 - index * 9}%` }} />
                <div className="cq-ghost-bar h-[4px]" style={{ width: `${38 - index * 6}%` }} />
              </div>
              <div className="cq-ghost-bar w-10 shrink-0" />
            </div>
          ))}
        </div>

        {/* El mensaje se apoya ENCIMA de la silueta, no debajo: el vacío es una
            sola cosa, no un dibujo con un texto de pie. El velo deja ver la
            forma sin que compita con la lectura. */}
        {/* El velo se escribe con color-mix y no con la sintaxis de opacidad de
            Tailwind: `bg-[var(--x)]/85` no resuelve el canal alfa de una
            variable, y saldría opaco. */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
          style={{ background: "color-mix(in srgb, var(--p-surface) 88%, transparent)" }}
        >
          <p className="cq-title">{title}</p>
          {hint && <p className="cq-meta max-w-[52ch]">{hint}</p>}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Error
   Un estado, no un accidente. Dice qué pasó, qué se puede hacer, y ofrece
   reintentar sin recargar la pestaña entera.
--------------------------------------------------------------------------- */

export function ErrorState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    /* La caja es `.cq-alert`, no una reimplementación. Estaba escrita con
       utilidades arbitrarias que repetían el filete, el tinte y el color del
       alert —y se quedaba sin su radio, así que el mismo error se dibujaba con
       esquinas distintas según quién lo mostrara. Acá sólo se sobreescribe lo
       que de verdad cambia: es un estado de página, no una línea de aviso, así
       que apila en el centro y respira. */
    <div className="cq-empty">
      <div className="cq-alert flex-col items-center px-6 py-10 text-center">
        <p className="cq-title text-[var(--p-danger)]">{title}</p>
        {hint && <p className="cq-meta max-w-[52ch]">{hint}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Insignia de estado
--------------------------------------------------------------------------- */

const TONE: Record<string, { tone: string; label: string }> = {
  PUBLISHED: { tone: "published", label: "Publicado" },
  /* Publicado, pero con fecha futura. No existe como valor en la base —se
     deriva del reloj, ver displayStatus() en lib/posts.ts— pero sí como estado
     visible: la columna de estado promete decir si el artículo se ve o no, y
     un programado no se ve. Tono propio: en verde se confundiría con lo que ya
     está en la web, que es exactamente el error que hay que evitar. */
  SCHEDULED: { tone: "scheduled", label: "Programado" },
  DRAFT: { tone: "draft", label: "Borrador" },
  HIDDEN: { tone: "hidden", label: "Oculto" },
};

/* `Badge` genérico se fue: renderizaba exactamente el mismo marcado que
   `StatusBadge` y no lo llamaba nadie. Un estado del sistema se nombra desde el
   mapa de arriba, no escribiendo el texto en cada sitio. */
export function StatusBadge({ status }: { status: string }) {
  const entry = TONE[status] ?? TONE.DRAFT;
  return (
    <span className="cq-badge" data-tone={entry.tone}>
      {entry.label}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Aviso en línea
--------------------------------------------------------------------------- */

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="cq-alert">
      <IconWarning size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/* ---------------------------------------------------------------------------
   Barra de proporción
   El número es el dato; la barra sólo hace comparable de un vistazo lo que el
   número ya dice.
--------------------------------------------------------------------------- */

export function Meter({ value, total, label }: { value: number; total: number; label: string }) {
  const ratio = total > 0 ? value / total : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="cq-body truncate text-[var(--p-ink)]">{label}</span>
        <span className="cq-ident shrink-0">{value}</span>
      </div>
      <div className="cq-meter mt-2" aria-hidden="true">
        <span style={{ "--cq-ratio": ratio } as CSSProperties} />
      </div>
    </div>
  );
}
