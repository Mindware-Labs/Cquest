"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SidebarLabel, useSidebar } from "@/components/ui/sidebar";
import { IconDots, IconExternal, IconLogout } from "@/components/admin/ui/icons";

/* La identidad al pie del riel, con las acciones de cuenta detrás de un clic.

   Antes "Cerrar sesión" era una fila permanente. Es la acción MENOS frecuente
   del panel —una vez al día, si acaso— y ocupaba el mismo peso visual que
   "Artículos", que se usa cien veces. Guardarla acá adentro no la esconde: la
   pone donde todo el mundo ya la busca, que es debajo del propio usuario. */
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
  const { open: railOpen } = useSidebar();

  /* Un menú abierto tiene que cerrarse por las tres vías que la gente ya usa sin
     pensar: Escape, un clic afuera, y el foco saliendo del bloque. Falta una y
     el menú se queda colgado sobre el contenido. */
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      /* El foco vuelve al disparador: si se queda en un botón que acaba de
         desaparecer, el teclado arranca de cero desde el principio del documento. */
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
    <div ref={rootRef} className="relative">
      <AnimatePresence>
        {open && (
          /* Se ancla ABAJO y crece hacia arriba: está al pie del riel, así que
             hacia abajo no hay lugar. El origen de la escala acompaña, para que
             el menú parezca salir del botón y no aterrizar sobre él. */
          <motion.div
            role="menu"
            aria-label="Opciones de la cuenta"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom left" }}
            className="absolute bottom-full left-0 z-50 mb-2 w-[13.5rem] overflow-hidden rounded-[var(--panel-radius-panel)] border border-[var(--panel-rail-border)] bg-[var(--panel-rail-raised)] p-1.5 shadow-[0_18px_40px_-16px_rgb(0_0_0_/_0.7)]"
          >
            {/* Con el riel angosto el nombre no cabe afuera, así que el menú es
                el único lugar donde se puede leer quién tiene la sesión. */}
            <div className="border-b border-[var(--panel-rail-border)] px-2.5 pt-1.5 pb-2.5">
              <p className="truncate text-[0.82rem] font-semibold text-[var(--panel-rail-text-strong)]">
                {name}
              </p>
              <p className="truncate text-[0.74rem] text-[var(--panel-rail-text)]">{email}</p>
            </div>

            <a
              role="menuitem"
              href="/es/blog"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="cq-rail-link mt-1.5 w-full"
            >
              <span className="flex size-[17px] shrink-0 items-center justify-center opacity-90">
                <IconExternal size={17} />
              </span>
              Ver el blog
            </a>

            <form action={logoutAction}>
              <button role="menuitem" type="submit" className="cq-rail-link w-full justify-start">
                <span className="flex size-[17px] shrink-0 items-center justify-center opacity-90">
                  <IconLogout size={17} />
                </span>
                Cerrar sesión
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        title={railOpen ? undefined : name}
        className="cq-rail-link w-full"
      >
        <span
          aria-hidden="true"
          className="flex size-[17px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--brand-petroleo)] text-[0.58rem] leading-none font-bold text-white"
        >
          {initials}
        </span>
        <SidebarLabel className="flex-1 text-left">
          <span className="block truncate text-[0.82rem] text-[var(--panel-rail-text-strong)]">
            {name}
          </span>
        </SidebarLabel>
        <SidebarLabel>
          <IconDots size={16} />
        </SidebarLabel>
        {/* El nombre accesible del botón no puede depender de una etiqueta que
            se apaga al colapsar. */}
        <span className="sr-only">Opciones de la cuenta de {name}</span>
      </button>
    </div>
  );
}
