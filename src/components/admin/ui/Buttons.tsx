"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { IconSpinner, IconTrash } from "./icons";
import type { ButtonVariant, ButtonSize } from "./Button";

/* Los botones atados a un <form>. Viven aparte de Button.tsx porque dependen de
   `useFormStatus`, que sólo funciona dentro del formulario que envía — y eso
   los obliga a ser componentes de cliente. Un botón común no tiene por qué
   pagar ese costo.

   Las variantes y los tamaños se IMPORTAN de Button.tsx, no se redeclaran. Este
   archivo tenía su propia unión con siete variantes y tres tamaños contra las
   cuatro y dos del otro: dos vocabularios para el mismo botón, y el que
   escribía uno no se enteraba de que el otro existía. Los alias viejos
   (`primary`, `secondary`, `quiet`) se fueron con su CSS — el único que
   quedaba escribiéndolos era el botón a mano del login, que ahora usa el
   sistema. Los `"primary"`/`"secondary"` del editor de bloques son otra cosa:
   estilos de botón del SITIO PÚBLICO, no variantes de `cq-btn`. */

/* Un botón de envío que se apaga y se explica mientras la acción corre. El
   `useFormStatus` solo funciona dentro del <form> que envía, así que esto vive
   siempre como hijo del formulario, nunca como su hermano. */
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
      {/* El anuncio vive en un nodo aparte y no en el botón. `aria-live` sobre
          un control interactivo lo convierte en su propia región viva: se
          relee en cada re-render, no sólo cuando cambia el texto. Acá se
          anuncia el armado una vez y nada más. */}
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
