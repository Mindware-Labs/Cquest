"use client";

/* Controles compartidos por el formulario del artículo y el panel de
   propiedades. Existen para que "elegir entre opciones cerradas" se vea igual
   en todo el editor — que es justo lo que hace cumplir PERS-2 y PERS-3: el
   admin siempre elige de un conjunto, nunca escribe un color o una fuente. */

export const INPUT_CLASS =
  "mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-[0.9rem] text-foreground outline-none transition-colors focus:border-petroleo focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-petroleo";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[0.78rem] font-semibold text-foreground">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-[0.78rem] font-semibold text-foreground">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_CLASS} resize-y leading-relaxed`}
      />
    </label>
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
      <span className="text-[0.78rem] font-semibold text-foreground">{label}</span>
      <div role="group" aria-label={label} className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={`rounded-md border px-2.5 py-1.5 text-[0.78rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo ${
                isActive
                  ? "border-petroleo bg-petroleo text-white"
                  : "border-border bg-white text-[var(--text-secondary)] hover:border-petroleo hover:text-foreground"
              }`}
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
