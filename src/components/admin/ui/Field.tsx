import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { IconCheck } from "./icons";

// Regla del archivo: label y control se emiten juntos y label es obligatorio (usar hideLabel si no debe verse), para no terminar con un placeholder haciendo de etiqueta.

type FieldShell = {
  id: string;
  label: string;
  hideLabel?: boolean;
  // Se conecta por aria-describedby, así que el lector de pantalla lo anuncia al enfocar.
  hint?: string;
  error?: string;
  className?: string;
};

function Shell({
  id,
  label,
  hideLabel,
  hint,
  error,
  className,
  children,
}: FieldShell & { children: ReactNode }) {
  return (
    <div className={clsx("min-w-0", className)}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "cq-label mb-1.5"}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="cq-meta mt-1.5">
          {hint}
        </p>
      )}
      {/* El error reemplaza a la ayuda en vez de sumarse, para no dejar dos líneas bajo el campo. */}
      {error && (
        <p id={`${id}-error`} role="alert" className="cq-meta mt-1.5 text-[var(--p-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy({ id, hint, error }: FieldShell) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function Input({
  id,
  label,
  hideLabel,
  hint,
  error,
  className,
  ...props
}: FieldShell & Omit<ComponentProps<"input">, "id" | "className">) {
  return (
    <Shell id={id} label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id, label, hint, error })}
        className="cq-input"
        {...props}
      />
    </Shell>
  );
}

export function Textarea({
  id,
  label,
  hideLabel,
  hint,
  error,
  className,
  ...props
}: FieldShell & Omit<ComponentProps<"textarea">, "id" | "className">) {
  return (
    <Shell id={id} label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id, label, hint, error })}
        className="cq-textarea"
        {...props}
      />
    </Shell>
  );
}

export function Select({
  id,
  label,
  hideLabel,
  hint,
  error,
  className,
  children,
  ...props
}: FieldShell & Omit<ComponentProps<"select">, "id" | "className">) {
  return (
    <Shell id={id} label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      {/* Select nativo y no una lista desplegable propia: en el teléfono abre la rueda del sistema, sin JS y sin salirse de la pantalla. */}
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id, label, hint, error })}
        className="cq-select"
        {...props}
      >
        {children}
      </select>
    </Shell>
  );
}

// La etiqueta va al lado y no encima: acá también es superficie de clic, y ponerla arriba desperdicia área táctil.
export function Checkbox({
  id,
  label,
  hint,
  className,
  ...props
}: {
  id: string;
  label: string;
  hint?: string;
  className?: string;
} & Omit<ComponentProps<"input">, "id" | "className" | "type">) {
  return (
    <div className={clsx("flex items-start gap-2.5", className)}>
      <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          className="cq-check"
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...props}
        />
        <IconCheck size={11} className="cq-check-mark" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <label htmlFor={id} className="cq-body block cursor-pointer text-[var(--p-ink)]">
          {label}
        </label>
        {hint && (
          <span id={`${id}-hint`} className="cq-meta mt-0.5 block">
            {hint}
          </span>
        )}
      </span>
    </div>
  );
}

// Se exporta aparte de Input (y no como prop withIcon) para que ese opcional no termine usado por costumbre en la mitad de los formularios.
export function SearchField({
  id,
  label,
  icon,
  className,
  ...props
}: {
  id: string;
  label: string;
  icon: ReactNode;
  className?: string;
} & Omit<ComponentProps<"input">, "id" | "className">) {
  return (
    <div className={clsx("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {icon}
      <input id={id} type="search" className="cq-input cq-field" {...props} />
    </div>
  );
}
