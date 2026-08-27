"use client";

import { useId } from "react";
import styles from "./ListField.module.css";

function Icon({ name }: { name: "plus" | "trash" | "alert" }) {
  const c = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3, width: 14, height: 14 };
  if (name === "plus")
    return (
      <svg {...c} aria-hidden="true">
        <path d="M8 3.4v9.2M3.4 8h9.2" strokeLinecap="round" />
      </svg>
    );
  if (name === "trash")
    return (
      <svg {...c} aria-hidden="true">
        <path d="M2.8 4.4h10.4M6.4 4.4V2.8h3.2v1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m4.2 4.4.7 8.4h6.2l.7-8.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg {...c} aria-hidden="true">
      <path d="M8 2 14.6 13.4H1.4L8 2Z" strokeLinejoin="round" />
      <path d="M8 6.4v3.2M8 11.6v.6" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  label: string;
  help?: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
  error?: string;
};

/* Lista editable de líneas de texto: responsabilidades, requisitos y
   deseables comparten la misma forma (agregar, editar en el sitio, quitar).
   Compartido entre el editor de vacantes, su asistente por pasos, y el CRUD
   de departamentos. */
export default function ListField({ label, help, placeholder, items, onChange, error }: Props) {
  const helpId = useId();

  function setLine(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeLine(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addLine() {
    onChange([...items, ""]);
  }

  return (
    <div className={styles.listField}>
      <span className={styles.label}>{label}</span>
      {help && (
        <span className={styles.help} id={helpId}>
          {help}
        </span>
      )}

      <div className={styles.listRows}>
        {items.map((line, index) => (
          <div className={styles.listRow} key={index}>
            <input
              className={styles.listInput}
              value={line}
              placeholder={placeholder}
              onChange={(event) => setLine(index, event.target.value)}
              aria-describedby={help ? helpId : undefined}
            />
            <button
              className={styles.listRemove}
              type="button"
              onClick={() => removeLine(index)}
              aria-label={`Remove line ${index + 1}`}
              title="Remove"
            >
              <Icon name="trash" />
            </button>
          </div>
        ))}
      </div>

      <button className={styles.listAdd} type="button" onClick={addLine}>
        <Icon name="plus" />
        Add line
      </button>

      {error && (
        <span className={styles.fieldError} role="alert">
          <Icon name="alert" />
          {error}
        </span>
      )}
    </div>
  );
}
