"use client";

import styles from "./Select.module.css";

export type SelectOption = { value: string; label: string };

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label: string;
  width?: string;
};

/* <select> nativo: el combobox propio calculaba su panel a mano con
   position: fixed y a veces se desincronizaba — el disparador quedaba
   marcado como abierto (borde y flecha) pero la lista nunca aparecía. El
   navegador nunca falla en eso, así que se usa el suyo. */
export default function Select({ value, options, onChange, label, width }: Props) {
  return (
    <div className={styles.root} style={width ? { width } : undefined}>
      <select
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg className={styles.caret} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="m4 6.4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
