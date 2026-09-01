"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./Modal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  // ReactNode, no string: algunos llamadores (el asistente de vacantes)
  // necesitan meter un control junto al título, como el ícono de "volver".
  title: React.ReactNode;
  width?: string;
  children: React.ReactNode;
};

/* <dialog> nativo: trae bloqueo de foco, Escape y ::backdrop sin librerías. */
export default function Modal({ open, onClose, eyebrow, title, width, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      aria-labelledby={titleId}
      style={width ? ({ "--modal-width": width } as React.CSSProperties) : undefined}
    >
      {/* Sin montar el contenido cerrado: los campos no conservan lo tecleado. */}
      {open && (
        <div className={styles.body}>
          <div className={styles.head}>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <button className={styles.close} type="button" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
