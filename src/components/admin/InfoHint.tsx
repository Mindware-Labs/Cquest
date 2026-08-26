"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./InfoHint.module.css";

type Props = {
  label: string;
  children: React.ReactNode;
};

/* Disclosure, no tooltip nativo: el texto es una explicación que se lee, no una
   etiqueta, y con `title` no llega al teclado ni al táctil. */
export default function InfoHint({ label, children }: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M6 5.4v3.2" strokeLinecap="round" />
          <path d="M6 3.2v.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <span className={styles.panel} id={panelId}>
          {children}
        </span>
      )}
    </span>
  );
}
