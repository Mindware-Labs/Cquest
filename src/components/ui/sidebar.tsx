"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { IconClose, IconMenu } from "@/components/admin/ui/icons";

/* Riel colapsable.

   Antes se abría con el mouse por encima. Se cambió a un botón explícito por una
   razón concreta: con hover, el riel se abre solo al cruzar la pantalla camino a
   otra cosa, y no hay forma de dejarlo abierto mientras se trabaja. Ahora el
   ancho es una DECISIÓN del que opera, se toma una vez y se recuerda entre
   sesiones.

   En móvil no hay ancho intermedio: es un panel que entra por izquierda sobre un
   velo, porque angostar un riel en 360px de pantalla no le devuelve espacio útil
   a nadie. */

const RAIL_OPEN = "15.5rem";
const RAIL_CLOSED = "4.5rem";
const STORAGE_KEY = "cq-panel-rail";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  panelId: string;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar debe usarse dentro de <Sidebar>");
  }
  return context;
}

/* La preferencia de ancho vive en un store fuera de React, y se lee con
   useSyncExternalStore.

   Por qué no `useState` + un efecto que lea localStorage: eso encadena un render
   extra en cada carga y, sobre todo, hace que el riel se dibuje abierto y salte
   a cerrado a la vista del que ya lo había plegado. Acá el valor guardado ya
   está presente en el primer render del cliente; el snapshot del servidor
   devuelve `true` porque en el servidor no hay preferencia que leer, y React
   sabe reconciliar esa diferencia sin marcar un error de hidratación. */
let railOpen = typeof window === "undefined" || window.localStorage.getItem(STORAGE_KEY) !== "closed";
const railListeners = new Set<() => void>();

function subscribeRail(listener: () => void) {
  railListeners.add(listener);
  return () => railListeners.delete(listener);
}

function writeRail(next: boolean) {
  railOpen = next;
  window.localStorage.setItem(STORAGE_KEY, next ? "open" : "closed");
  railListeners.forEach((listener) => listener());
}

export function Sidebar({ children }: { children: ReactNode }) {
  const open = useSyncExternalStore(
    subscribeRail,
    () => railOpen,
    () => true,
  );
  const panelId = useId();

  return (
    <SidebarContext.Provider
      value={{ open, setOpen: writeRail, toggle: () => writeRail(!open), panelId }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

type PanelProps = { className?: string; children?: ReactNode };

export function SidebarBody(props: PanelProps) {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
}

export function DesktopSidebar({ className, children }: PanelProps) {
  const { open, panelId } = useSidebar();

  return (
    <motion.aside
      id={panelId}
      data-collapsed={open ? undefined : "true"}
      className={cn(
        "cq-rail hidden shrink-0 flex-col gap-5 px-3 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen",
        className,
      )}
      animate={{ width: open ? RAIL_OPEN : RAIL_CLOSED }}
      initial={false}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.aside>
  );
}

export function MobileSidebar({ className, children }: PanelProps) {
  const { open, setOpen, panelId } = useSidebar();
  /* Id propio. Los dos rieles se montan siempre —uno se oculta por CSS— y los
     dos escribían `id={panelId}`: dos elementos con el mismo id en el documento,
     que es HTML inválido y deja el `aria-controls` del botón apuntando a
     cualquiera de los dos. Ojo, el landmark NO está duplicado: `display: none`
     saca el riel de escritorio del árbol de accesibilidad. El problema era el
     id, no la región. */
  const sheetId = `${panelId}-sheet`;
  /* El estado de apertura es compartido con el escritorio, pero en móvil
     significa otra cosa: acá arranca CERRADO siempre, porque un panel encima del
     contenido al entrar es un obstáculo, no una ayuda. */
  const [sheet, setSheet] = useState(false);

  const panelRef = useRef<HTMLElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  /* Escape cierra, el foco entra y queda atrapado, y al cerrar vuelve a donde
     estaba.

     Esta hoja era el ÚNICO overlay del panel sin nada de eso. El cajón y el
     diálogo van sobre `<dialog>` nativo, así que el navegador les da trampa de
     foco, Escape, capa superior e inertización del fondo. Acá hay un
     `motion.aside`, que no es un diálogo para nadie salvo para el ojo: con
     teclado, Tab se escapaba al contenido de atrás —que se sigue viendo debajo
     del velo— y al cerrar el foco quedaba en la nada, o sea al principio del
     documento.

     No se porta a `<dialog>` porque la animación de entrada y el ancho relativo
     al viewport dependen de que sea un elemento del flujo; se le agrega el
     comportamiento que le faltaba. */
  useEffect(() => {
    if (!sheet) {
      /* Restituir el foco al abridor. Sin esto, cerrar con Escape deja el foco
         en el <body> y el siguiente Tab arranca desde arriba de todo. */
      openerRef.current?.focus();
      return;
    }

    openerRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((node) => node.offsetParent !== null);

    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSheet(false);
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = focusables();
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      /* El ciclo se cierra en los dos sentidos, y el `!panel.contains` cubre el
         caso de entrar a la hoja con el foco ya afuera. */
      if (event.shiftKey && (active === first || !panel?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  return (
    <div className="lg:hidden">
      <div className="cq-rail flex h-14 items-center justify-between px-4">
        <span className="cq-title leading-none">Center Quest</span>
        <button
          type="button"
          aria-expanded={sheet}
          aria-controls={sheetId}
          aria-label="Abrir el menú del panel"
          onClick={() => {
            setSheet(true);
            /* El panel móvil siempre se muestra desplegado: acá no existe el
               estado angosto. */
            if (!open) setOpen(true);
          }}
          className="cq-rail-link -mr-2 px-2"
        >
          <IconMenu size={20} />
        </button>
      </div>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSheet(false)}
              className="fixed inset-0 z-[var(--p-z-overlay)] bg-[color-mix(in_srgb,var(--p-ink)_45%,transparent)]"
              aria-hidden="true"
            />
            <motion.aside
              ref={panelRef}
              id={sheetId}
              /* Es un diálogo modal para quien no lo ve, igual que el cajón. Sin
                 esto un lector de pantalla lo anuncia como una región más y
                 sigue leyendo la página de atrás como si estuviera disponible. */
              role="dialog"
              aria-modal="true"
              aria-label="Secciones del panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "cq-rail fixed inset-y-0 left-0 z-[var(--p-z-overlay)] flex w-[17rem] max-w-[85vw] flex-col gap-5 overflow-y-auto px-3 py-4",
                className,
              )}
            >
              <button
                type="button"
                aria-label="Cerrar el menú del panel"
                onClick={() => setSheet(false)}
                className="cq-rail-link absolute top-4 right-3 px-2"
              >
                <IconClose size={20} />
              </button>
              {children}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Texto que sólo existe con el riel abierto. Colapsado se va a ancho cero
   además de opacidad cero: si sólo se apagara la opacidad, seguiría ocupando su
   lugar y el icono no podría centrarse. `aria-hidden` no se toca — el nombre
   accesible del link tiene que seguir ahí aunque visualmente el riel esté
   angosto. */
export function SidebarLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open } = useSidebar();

  return (
    <motion.span
      initial={false}
      animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "min-w-0 truncate whitespace-nowrap",
        !open && "pointer-events-none",
        className,
      )}
    >
      {children}
    </motion.span>
  );
}

/* Encabezado de grupo dentro del riel. Colapsado la CSS lo convierte en una
   línea de 1px, así que el texto sigue en el DOM para los lectores de pantalla
   y desaparece sólo visualmente. */
export function SidebarGroupLabel({ children }: { children: ReactNode }) {
  return <p className="cq-rail-group">{children}</p>;
}

export type SidebarLinkItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

export function SidebarLink({
  link,
  active,
  className,
  ...props
}: {
  link: SidebarLinkItem;
  active?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href">) {
  const { open } = useSidebar();

  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      /* Colapsado el nombre no se ve, así que el tooltip nativo pasa a ser la
         única forma de saber qué es cada icono con el mouse. */
      title={open ? undefined : link.label}
      className={cn("cq-rail-link", className)}
      {...props}
    >
      <span className="flex size-[17px] shrink-0 items-center justify-center opacity-90">
        {link.icon}
      </span>
      <SidebarLabel>{link.label}</SidebarLabel>
    </Link>
  );
}
