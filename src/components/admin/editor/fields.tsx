"use client";

import { useId } from "react";

/* Controles compartidos por el formulario del artículo y el panel de
   propiedades. Existen para que "elegir entre opciones cerradas" se vea igual
   en todo el editor — que es justo lo que hace cumplir PERS-2 y PERS-3: el
   admin siempre elige de un conjunto, nunca escribe un color o una fuente. */

/* Un alias sobre la clase del sistema, no una copia de sus estilos. Antes acá
   se redeclaraban borde, relleno, tamaño y foco a mano, y era la razón por la
   que un campo del editor se veía distinto de uno del formulario de
   categorías. El vocabulario se declara una sola vez, en admin.css. */
export const INPUT_CLASS = "cq-input mt-1.5";

/* `hint` es una ranura de verdad y no texto metido en la etiqueta.

   Sin ella, la ayuda terminaba escrita adentro del propio rótulo —"Slug
   (opcional — se genera del título)"— y una etiqueta que explica deja de ser
   una etiqueta: es lo primero que lee un lector de pantalla al enfocar el
   campo, y ahí sólo tiene que estar el nombre. La ayuda se conecta por
   `aria-describedby`, así se lee DESPUÉS del nombre y del tipo de control.

   `required` dibuja la marca y pone el atributo. Antes ningún campo del editor
   decía cuál era obligatorio hasta que fallaba el envío. */
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

/* Grupo de opciones excluyentes como botones y no como <select>: el admin ve
   todas las alternativas a la vez, que es lo que hace que se anime a probar
   una en vez de dejar siempre el default. */
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
              /* La opción elegida usa `outline` y no `solid`: el relleno del
                 sistema está reservado para la acción principal de la pantalla,
                 y un grupo de seis opciones con una rellena competiría con el
                 botón Guardar. El borde de acento y el peso alcanzan. */
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
