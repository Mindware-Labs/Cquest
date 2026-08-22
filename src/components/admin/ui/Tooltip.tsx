"use client";

import { useId, useRef, useState, type ReactNode } from "react";

/* Ayuda contextual.

   Dos reglas que la hacen aceptable y sin las cuales sería un estorbo:

   1. Nunca es la ÚNICA fuente de la información. Se conecta por
      `aria-describedby`, o sea que amplía algo que ya tiene nombre propio. Un
      icono cuyo significado sólo vive en un globo que aparece al pasar el mouse
      no existe para el teclado, ni para el táctil, ni para un lector.
   2. Aparece con retraso. Sin él, cruzar una fila de seis botones camino a otra
      cosa dispara seis globos.

   Se abre también con el foco, así que funciona con teclado. */

const DELAY_MS = 400;

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), DELAY_MS);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={hide}
      /* Escape cierra el globo sin mover el foco. Lo pide el criterio de
         "contenido al pasar el puntero o al enfocar": lo que aparece encima del
         contenido tiene que poder descartarse sin perder el lugar. */
      onKeyDown={(event) => {
        if (event.key === "Escape") hide();
      }}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`cq-tooltip left-1/2 -translate-x-1/2 ${
            side === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
