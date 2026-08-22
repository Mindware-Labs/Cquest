import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { IconCheck } from "./icons";

/* Campos del panel.

   Regla del archivo: la etiqueta y el control se emiten JUNTOS. Un componente
   que sólo dibuja el <input> y deja la etiqueta a cargo de cada vista es cómo
   se llega a un formulario con tres campos etiquetados y uno con un
   placeholder haciendo de etiqueta — que además desaparece al escribir, justo
   cuando hace falta recordar qué se estaba llenando.

   Por eso `label` es obligatorio en todos. Si de verdad no debe verse, se pasa
   `hideLabel` y sigue existiendo para el lector de pantalla. */

type FieldShell = {
  id: string;
  label: string;
  hideLabel?: boolean;
  /* Texto de ayuda estable. Se conecta por aria-describedby, así que el lector
     de pantalla lo anuncia al enfocar y no queda como un gris decorativo. */
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
      {/* El error reemplaza a la ayuda en vez de sumarse: dos líneas de texto
          bajo un campo roto obligan a leer cuál de las dos es la que importa. */}
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
      {/* Select NATIVO y no una lista desplegable propia. En un teléfono el
          nativo abre la rueda del sistema, se maneja con el teclado sin una
          línea de JavaScript y no se sale de la pantalla. Un reemplazo hecho a
          mano cuesta trescientas líneas para perder las tres cosas. */}
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

/* La casilla lleva su etiqueta AL LADO y no encima: es el único control donde
   la etiqueta también es la superficie de clic, y ponerla arriba desperdicia
   la mitad del área táctil. */
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

/* Campo de búsqueda con el icono adentro. Se exporta aparte porque la caja
   cambia (relativa, con relleno a la izquierda) y no es una prop más del
   Input: un `withIcon` opcional termina usado en la mitad de los formularios
   por costumbre y no por necesidad. */
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
