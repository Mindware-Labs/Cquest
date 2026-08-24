"use client";

import { useId, useRef, useState, type ReactNode } from "react";

// Se conecta por `aria-describedby` (nunca es la única fuente) y aparece con retraso: sin eso, cruzar una fila de botones dispara un globo por cada uno.
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
      // Escape cierra el globo sin mover el foco.
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
