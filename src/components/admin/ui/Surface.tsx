import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IconWarning } from "./icons";

// Superficies del panel: todas Server Components porque ninguna necesita estado.

// `PageHeader` se quitó: cero consumidores, todos usan `ModulePage`.


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
  // Opcional: sin count no se dibuja cero, que no significaría nada.
  count?: number;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  // Sólo para el retraso del escalonado (`--cq-i`); no es puerta para estilos sueltos.
  style?: CSSProperties;
  as?: "section" | "div" | "aside";
  headingLevel?: "h2" | "h3";
  // Cerrada, con filete: para gráficos. Una tabla larga no la usa, el marco competiría con las filas.
  boxed?: boolean;
  // Color del bloque: regla de 3px y título en ese color, para reconocer la tarjeta sin leerla.
  accent?: "volume" | "category" | "pending" | "published";
  // Oculta el título visualmente (queda para el lector de pantalla) cuando la sección ES toda la pantalla.
  hideHead?: boolean;
  // Requiere hideHead=false: sin título el icono no tiene dónde apoyarse.
  icon?: ReactNode;
}) {
  return (
    <Tag
      data-boxed={boxed ? "true" : undefined}
      data-accent={accent}
      style={style}
      className={clsx("cq-section", className)}
    >
      {/* La cifra grande sobre la regla se fue: competía con los KPIs de arriba. Ahora es una pastilla junto al título. */}
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
      {/* `min-h-0` obligatorio: sin esto, el mínimo automático del flex hace que la lista desborde la tarjeta en vez de scrollear adentro. */}
      <div className="cq-section-body flex min-h-0 flex-1 flex-col">{children}</div>
    </Tag>
  );
}

// `Panel`/`PanelHead` se quitaron: alias de una migración ya terminada, sin consumidores.

// Tarjeta: sólo para elementos de una grilla; en lista vertical el filete separa, no una caja.
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

// Identificador del sistema (ID, fecha, código): mono porque se copia y compara, no se lee.

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

// Cifra del tablero: `href` opcional a propósito — sin destino no finge ser un enlace (ni color ni cursor de link).

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
  // Reemplaza al punto de color (no lo acompaña): tener los dos repetiría el mismo dato.
  icon?: ReactNode;
  // Variación contra el período anterior: convierte la cifra sola en información.
  delta?: { value: number; label: string };
  accent?: "volume" | "category" | "pending" | "published";
}) {
  const trend = delta ? (delta.value > 0 ? "up" : delta.value < 0 ? "down" : "flat") : undefined;

  const body = (
    <>
      {/* El punto de color va antes de la etiqueta, no después: es lo primero que el ojo usa para agrupar. */}
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
          // El signo va siempre, no sólo el color: rojo/verde es el par que más gente no distingue.
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

// Estado vacío: no texto centrado en gris, es la forma de lo que falta (filete punteado + acción a un clic).

export function EmptyState({
  title,
  hint,
  action,
  // Tres es el mínimo para que las filas fantasma se lean como lista y no como caja suelta.
  rows = 3,
  // Sin silueta: sólo el mensaje centrado, para bloques donde el fantasma de lista no aporta nada.
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
        {/* `aria-hidden`: la silueta no dice nada que el título no diga. */}
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

        {/* El mensaje se apoya encima de la silueta, no debajo, para que se lea como una sola cosa. */}
        {/* color-mix y no `bg-[var(--x)]/85`: Tailwind no resuelve el canal alfa de una variable y saldría opaco. */}
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

// Error: un estado, no un accidente. Dice qué pasó y ofrece reintentar sin recargar la pestaña.

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
    // Usa `.cq-alert` en vez de reimplementarla, sólo sobreescribiendo lo que cambia (apila y centra).
    <div className="cq-empty">
      <div className="cq-alert flex-col items-center px-6 py-10 text-center">
        <p className="cq-title text-[var(--p-danger)]">{title}</p>
        {hint && <p className="cq-meta max-w-[52ch]">{hint}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

const TONE: Record<string, { tone: string; label: string }> = {
  PUBLISHED: { tone: "published", label: "Publicado" },
  // No existe como valor en la base (se deriva del reloj, ver displayStatus() en lib/posts.ts); tono propio para no confundirse con "publicado".
  SCHEDULED: { tone: "scheduled", label: "Programado" },
  DRAFT: { tone: "draft", label: "Borrador" },
  HIDDEN: { tone: "hidden", label: "Oculto" },
};

// `Badge` genérico se quitó: duplicaba el marcado de `StatusBadge` sin consumidores.
export function StatusBadge({ status }: { status: string }) {
  const entry = TONE[status] ?? TONE.DRAFT;
  return (
    <span className="cq-badge" data-tone={entry.tone}>
      {entry.label}
    </span>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="cq-alert">
      <IconWarning size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// Barra de proporción: el número es el dato, la barra sólo lo hace comparable de un vistazo.

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
