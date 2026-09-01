"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
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
   de departamentos.

   Enter inserta una línea nueva justo debajo y le pasa el foco; Backspace en
   una línea vacía la quita y devuelve el foco a la anterior — el patrón de
   cualquier lista de tareas, para no depender del mouse en "Add line" en
   cada renglón.

   Los ids de fila viven en estado (no en un ref): un ref no se puede leer
   durante el render, y la key de cada fila se decide ahí. Enfocar la fila
   recién creada tampoco espera un efecto — flushSync aplica el nuevo estado
   ya mismo para poder enfocar el input apenas existe en el DOM. */
export default function ListField({ label, help, placeholder, items, onChange, error }: Props) {
  const helpId = useId();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const nextIdRef = useRef(items.length);
  const [ids, setIds] = useState<number[]>(() => items.map((_, index) => index));
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  function setLine(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function insertAfter(index: number) {
    const next = [...items];
    next.splice(index + 1, 0, "");
    const nextIds = [...ids];
    nextIds.splice(index + 1, 0, nextIdRef.current++);
    flushSync(() => {
      setIds(nextIds);
      onChange(next);
    });
    inputRefs.current[index + 1]?.focus();
  }

  function addLine() {
    const newIndex = items.length;
    const nextIds = [...ids, nextIdRef.current++];
    flushSync(() => {
      setIds(nextIds);
      onChange([...items, ""]);
    });
    inputRefs.current[newIndex]?.focus();
  }

  function requestRemove(index: number) {
    setRemovingIndex(index);
  }

  // La fila sale con una animación (ver CSS) antes de que el array se
  // recorte de verdad, así los índices de las demás no saltan a mitad de la
  // transición. La fila a la que vuelve el foco ya existe en el DOM — no
  // hace falta esperar un re-render para enfocarla.
  function finishRemove(index: number) {
    const next = items.filter((_, i) => i !== index);
    const nextIds = ids.filter((_, i) => i !== index);
    const focusTo = index > 0 ? index - 1 : next.length > 0 ? 0 : null;
    setRemovingIndex(null);
    setIds(nextIds);
    onChange(next);
    if (focusTo !== null) inputRefs.current[focusTo]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Enter") {
      event.preventDefault();
      insertAfter(index);
      return;
    }
    // Solo si queda algo más: borrar la última línea con Backspace se siente
    // como un accidente, no una acción a propósito. Para eso está el botón.
    if (event.key === "Backspace" && items[index] === "" && items.length > 1) {
      event.preventDefault();
      requestRemove(index);
    }
  }

  return (
    <div className={styles.listField}>
      <span className={styles.label}>{label}</span>
      {help && (
        <span className={styles.help} id={helpId}>
          {help}
        </span>
      )}

      {items.length > 0 && (
        <div className={styles.listRows}>
          {items.map((line, index) => (
            <div
              className={styles.listRow}
              key={ids[index] ?? index}
              data-removing={removingIndex === index ? "" : undefined}
              onAnimationEnd={() => {
                if (removingIndex === index) finishRemove(index);
              }}
            >
              <div className={styles.listRowInner}>
                <span className={styles.index} aria-hidden="true">
                  {index + 1}
                </span>
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className={styles.listInput}
                  value={line}
                  placeholder={placeholder}
                  onChange={(event) => setLine(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  aria-describedby={help ? helpId : undefined}
                />
                <button
                  className={styles.listRemove}
                  type="button"
                  onClick={() => requestRemove(index)}
                  aria-label={`Remove line ${index + 1}`}
                  title="Remove"
                >
                  <Icon name="trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.listFoot}>
        <button className={styles.listAdd} type="button" onClick={addLine}>
          <Icon name="plus" />
          Add line
        </button>
        {items.length > 0 && <span className={styles.hint}>Enter for a new line, Backspace to remove an empty one</span>}
      </div>

      {error && (
        <span className={styles.fieldError} role="alert">
          <Icon name="alert" />
          {error}
        </span>
      )}
    </div>
  );
}
