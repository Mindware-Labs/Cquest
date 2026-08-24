"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronDown, IconLogout } from "@/components/admin/ui/icons";

// Arriba a la derecha (no al pie del riel): es el único lugar que NO cambia cuando el riel se pliega. "Cerrar sesión" va detrás de un clic para no pesar visualmente igual que "Artículos".
export default function PanelUserMenu({
  name,
  email,
  initials,
  logoutAction,
}: {
  name: string;
  email: string;
  initials: string;
  logoutAction: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Escape y clic afuera: si falta una vía, el menú se queda colgado sobre el contenido.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // El foco vuelve al disparador: si queda en un botón que desapareció, el teclado arranca de cero desde el principio del documento.
      triggerRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        data-open={open ? "true" : undefined}
        onClick={() => setOpen((current) => !current)}
        className="cq-account"
      >
        {/* Círculo (no cuadrado): es la única pieza del cromo que representa a una PERSONA, distinta de los iconos de sección. */}
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--p-accent)] text-[var(--p-label-size)] leading-none font-semibold text-[var(--p-on-accent)]"
        >
          {initials}
        </span>
        {/* El nombre se retira en pantallas angostas, no el avatar: en 360px la barra ya tiene miga de ruta y dos controles. */}
        <span className="cq-body hidden max-w-[8rem] truncate sm:block">
          {name}
        </span>
        <IconChevronDown size={15} className="cq-account-caret" />
        {/* El nombre accesible no puede depender de una etiqueta que se oculta por ancho de pantalla. */}
        <span className="sr-only">Opciones de la cuenta de {name}</span>
      </button>

      <AnimatePresence>
        {open && (
          // El origen de la escala ancla arriba a la derecha para que el menú parezca salir del botón, no aterrizar sobre él.
          <motion.div
            role="menu"
            aria-label="Opciones de la cuenta"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top right" }}
            className="cq-overlay absolute top-full right-0 z-[var(--p-z-dropdown)] mt-2 w-[14rem] overflow-hidden p-1.5"
          >
            {/* El email no cabe en el disparador; es lo que distingue una cuenta de otra cuando alguien administra dos. */}
            <div className="border-b border-[var(--p-line)] px-2 pt-1 pb-2">
              <p className="cq-title truncate">{name}</p>
              {/* El email en mono: es un identificador de cuenta, no una frase. */}
              <p className="cq-ident mt-0.5 truncate">{email}</p>
            </div>

            <form action={logoutAction} className="mt-1.5">
              <button
                role="menuitem"
                type="submit"
                className="cq-rail-link cq-rail-link-danger w-full justify-start"
              >
                <span className="flex size-[17px] shrink-0 items-center justify-center opacity-90">
                  <IconLogout size={17} />
                </span>
                Cerrar sesión
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
