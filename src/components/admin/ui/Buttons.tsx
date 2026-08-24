"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { IconSpinner, IconTrash } from "./icons";
import type { ButtonVariant, ButtonSize } from "./Button";

// Aparte de Button.tsx porque useFormStatus solo funciona dentro del <form> que envía, obligando a ser componente de cliente; variantes y tamaños se importan de Button.tsx en vez de redeclararse para no tener dos vocabularios del mismo botón.

// useFormStatus solo funciona dentro del <form> que envía, así que esto vive siempre como hijo del formulario, nunca como su hermano.
export function SubmitButton({
  children,
  pendingLabel,
  variant = "solid",
  size = "md",
  name,
  value,
  icon,
  className,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  name?: string;
  value?: string;
  icon?: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      data-variant={variant}
      data-size={size}
      className={`cq-btn ${className ?? ""}`}
    >
      {pending ? <IconSpinner size={size === "sm" ? 14 : 16} /> : icon}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

// Reemplaza a window.confirm, que en algunos navegadores se puede silenciar (el paso de seguridad desaparecería sin aviso). Primer clic arma, segundo borra; se desarma solo a los 4s o al perder el foco.
export function ConfirmSubmit({
  children,
  confirmLabel,
  pendingLabel,
  size = "sm",
  className,
  disabled,
  title,
}: {
  children: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { pending } = useFormStatus();
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!armed) return;
    timer.current = setTimeout(() => setArmed(false), 4000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [armed]);

  return (
    <>
      {/* El anuncio vive en un nodo aparte y no en el botón: aria-live sobre un control interactivo se relee en cada re-render, no solo cuando cambia el texto. */}
      <span aria-live="polite" className="sr-only">
        {armed ? confirmLabel : ""}
      </span>
      <button
        type="submit"
        disabled={pending || disabled}
        title={title}
        data-variant="danger"
        data-size={size}
        data-armed={armed || undefined}
        className={`cq-btn ${className ?? ""}`}
        onBlur={() => setArmed(false)}
        onClick={(event) => {
          if (!armed) {
            /* El primer clic no envía: solo cambia el botón a "¿Seguro?". */
            event.preventDefault();
            setArmed(true);
          }
        }}
      >
        {pending ? <IconSpinner size={14} /> : <IconTrash size={14} />}
        {pending && pendingLabel ? pendingLabel : armed ? confirmLabel : children}
      </button>
    </>
  );
}
