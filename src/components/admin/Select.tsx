"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./Select.module.css";

export type SelectOption = { value: string; label: string };

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label: string;
  width?: string;
};

/* Listbox propio: el <select> nativo no deja estilar su desplegable, que lo
   pinta el sistema operativo. Sigue el patrón combobox de la WAI. */
export default function Select({ value, options, onChange, label, width }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [drop, setDrop] = useState<"down" | "up">("down");
  // El panel se cierra con una animación propia en vez de desmontarse de
  // golpe: se queda pintado un instante más mientras se desvanece.
  const [closing, setClosing] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      setClosing(false);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      setClosing(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Si abajo no cabe, abre hacia arriba: en el pie de página siempre pasa.
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const needed = Math.min(options.length, 6) * 34 + 16;
      setDrop(window.innerHeight - rect.bottom < needed ? "up" : "down");
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, options.length]);

  const showPanel = open || closing;

  function commit(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        setActive(selectedIndex);
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(active);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className={styles.root} ref={rootRef} style={width ? { width } : undefined}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        /* El foco no se mueve a la opción: la voz activa la señala desde aquí. */
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => {
          setActive(selectedIndex);
          setOpen((v) => !v);
        }}
        onKeyDown={handleKeyDown}
      >
        {/* key={value}: al cambiar la selección, React remonta el span y la
            animación de entrada se dispara sola, sin estado extra. */}
        <span key={value} className={styles.labelText}>
          {options[selectedIndex]?.label ?? ""}
        </span>
        <svg className={styles.caret} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="m4 6.4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {showPanel && (
        <ul
          className={styles.panel}
          id={listId}
          role="listbox"
          aria-label={label}
          data-drop={drop}
          data-state={closing ? "closing" : "open"}
          onAnimationEnd={() => {
            if (closing) setClosing(false);
          }}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              className={styles.option}
              role="option"
              aria-selected={index === selectedIndex}
              data-active={index === active}
              onPointerEnter={() => setActive(index)}
              onClick={() => commit(index)}
            >
              {option.label}
              <svg className={styles.check} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M2 6.3 4.6 9 10 3.2" strokeLinecap="square" />
              </svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
