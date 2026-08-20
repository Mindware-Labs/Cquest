"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { IconSpinner, IconTrash } from "./icons";

type Variant = "primary" | "secondary" | "ghost" | "quiet" | "danger";
type Size = "md" | "sm" | "icon";

/* Un botón de envío que se apaga y se explica mientras la acción corre. El
   `useFormStatus` solo funciona dentro del <form> que envía, así que esto vive
   siempre como hijo del formulario, nunca como su hermano. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  name,
  value,
  icon,
  className,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  size?: Size;
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

/* Reemplaza al `window.confirm` nativo. El diálogo del navegador saca al admin
   de la página, no se puede diseñar y en algunos navegadores se puede silenciar
   — es decir, el paso de seguridad puede desaparecer sin aviso.
   Acá el primer clic arma el botón y el segundo borra; se desarma solo a los
   4 segundos o cuando el foco se va, así que no queda cargado por olvido. */
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
  size?: Size;
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
    <button
      type="submit"
      disabled={pending || disabled}
      title={title}
      data-variant="danger"
      data-size={size}
      data-armed={armed || undefined}
      aria-live="polite"
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
  );
}
