import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IconWarning } from "./icons";

/* Piezas de superficie del panel. Todas son Server Components a propósito:
   ninguna necesita estado, así que ninguna paga el peso de enviarse al cliente. */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 pb-7">
      <div>
        {/* Sin ojal ni etiqueta encima del título: el título se sostiene solo. */}
        <h1 className="font-heading text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[52ch] text-[0.92rem] leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* Tarjeta de cifra. `href` es opcional a propósito: con enlace es una puerta a
   la pantalla que explica el número, y sin enlace es sólo un dato. Lo que NO
   hace es fingir: sin destino, no levanta ni cambia el cursor. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "var(--brand-petroleo)",
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: ReactNode;
  accent?: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="cq-stat-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="mt-3.5 block text-[0.8rem] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <span className="font-heading mt-1 block text-[1.7rem] leading-none font-semibold tracking-[-0.02em] text-foreground tabular-nums">
        {value}
      </span>
      {hint && (
        <span className="mt-1.5 block text-[0.76rem] leading-snug text-[var(--text-tertiary)]">
          {hint}
        </span>
      )}
    </>
  );

  const style = { "--cq-stat-accent": accent } as CSSProperties;

  if (href) {
    return (
      <Link href={href} className="cq-stat" style={style}>
        {body}
      </Link>
    );
  }

  return (
    <div className="cq-stat" style={style}>
      {body}
    </div>
  );
}

export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "aside";
}) {
  return <Tag className={clsx("cq-panel", className)}>{children}</Tag>;
}

export function PanelHead({
  title,
  count,
  actions,
}: {
  title: string;
  count?: number;
  actions?: ReactNode;
}) {
  return (
    <div className="cq-panel-head flex flex-wrap items-center justify-between gap-3 px-5 py-3">
      <h2 className="flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.11em] text-[var(--text-tertiary)] uppercase">
        {title}
        {typeof count === "number" && (
          <span className="rounded-[6px] bg-[var(--surface-raised)] px-1.5 py-0.5 text-[0.7rem] tracking-normal text-[var(--text-secondary)] tabular-nums">
            {count}
          </span>
        )}
      </h2>
      {actions}
    </div>
  );
}

/* Un vacío que enseña el siguiente paso. "No hay nada" no es un estado vacío,
   es un callejón sin salida. */
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-[0.98rem] font-semibold text-foreground">{title}</p>
      {hint && (
        <p className="mx-auto mt-2 max-w-[46ch] text-[0.88rem] leading-relaxed text-[var(--text-secondary)]">
          {hint}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

const TONE: Record<string, { tone: string; label: string }> = {
  PUBLISHED: { tone: "published", label: "Publicado" },
  DRAFT: { tone: "draft", label: "Borrador" },
  HIDDEN: { tone: "hidden", label: "Oculto" },
};

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
    <p
      role="alert"
      className="flex items-start gap-2 rounded-[var(--panel-radius-control)] border border-[#e8c9c9] bg-[#fbf1f1] px-3 py-2 text-[0.84rem] text-[#8f1d1d]"
    >
      <IconWarning size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/* Barra de proporción con su valor al lado. El número es el dato; la barra solo
   hace comparable de un vistazo lo que el número ya dice. */
export function Meter({ value, total, label }: { value: number; total: number; label: string }) {
  const ratio = total > 0 ? value / total : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.88rem] text-foreground">{label}</span>
        <span className="text-[0.82rem] text-[var(--text-secondary)] tabular-nums">{value}</span>
      </div>
      <div className="cq-meter mt-1.5" aria-hidden="true">
        <span style={{ "--cq-ratio": ratio } as CSSProperties} />
      </div>
    </div>
  );
}
