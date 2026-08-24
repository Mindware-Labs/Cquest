"use client";

import { useId } from "react";

// Controles compartidos por el formulario del artículo y el panel de propiedades: "elegir entre opciones cerradas" se ve igual en todo el editor (PERS-2/PERS-3), el admin nunca escribe un color o fuente a mano.

// Alias sobre la clase del sistema (no copia sus estilos), así el vocabulario se declara una sola vez en admin.css.
export const INPUT_CLASS = "cq-input mt-1.5";

// `hint` es una ranura real y no texto en la etiqueta: se conecta por `aria-describedby` para leerse después del nombre del campo, no adentro de él.
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  hint?: string;
  required?: boolean;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className="cq-label">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-[var(--p-danger)]">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
      {hint && (
        <p id={hintId} className="cq-meta mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  required?: boolean;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className="cq-label">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-[var(--p-danger)]">
            *
          </span>
        )}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        required={required}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="cq-textarea mt-1.5"
      />
      {hint && (
        <p id={hintId} className="cq-meta mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}

// Botones y no <select>: el admin ve todas las alternativas a la vez y se anima a probar una en vez de dejar el default.
export function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <span className="cq-label">{label}</span>
      <div role="group" aria-label={label} className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              // `outline` y no `solid`: el relleno está reservado a la acción principal de la pantalla (el botón Guardar).
              className="cq-btn"
              data-variant={isActive ? "outline" : "ghost"}
              data-size="sm"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SPACING_OPTIONS = [
  { value: "none", label: "Ninguno" },
  { value: "sm", label: "Pequeño" },
  { value: "md", label: "Mediano" },
  { value: "lg", label: "Grande" },
] as const;
