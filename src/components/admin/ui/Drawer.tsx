"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconClose } from "./icons";
import { IconButton } from "./Button";

/* Cajón lateral.

   Es la superficie para todo lo que HOY vive incrustado en la página y le roba
   espacio permanente al contenido: crear una categoría, guardar una plantilla,
   editar las propiedades de un bloque. Ninguna de esas cosas se usa todo el
   tiempo, y las tres ocupaban una columna fija.

   Por qué cajón y no modal para esto: el trabajo del panel es una lista o una
   tabla, y un modal centrado la tapa. El cajón entra por el costado, deja ver
   la fila sobre la que se está actuando, y sale por donde vino. El modal
   (Dialog) queda para lo que EXIGE una decisión antes de seguir — confirmar un
   borrado—, que es cuando tapar el fondo es justamente lo que se quiere.

   Sobre <dialog> nativo, igual que el modal: trampa de foco, Escape, capa
   superior e inertización del fondo las hace el navegador. Acá se le cambia la
   posición y la animación, no el comportamiento.

   El movimiento va por `transform`, nunca por `width`: animar el ancho obliga
   al navegador a recalcular la maquetación del contenido del cajón en cada
   cuadro, y con un formulario adentro se nota. */

/* Cuánto dura de verdad la animación de salida, leída del elemento en vez de
   escrita a mano. Así el token de CSS sigue siendo la única fuente: cambiar
   `--p-t-base` mueve la espera sin tocar este archivo. El respaldo de 180ms
   sólo entra si el navegador todavía no calculó el estilo. */
function exitDurationMs(element: HTMLElement): number {
  const declared = getComputedStyle(element).getPropertyValue("--p-t-base").trim();
  const parsed = declared.endsWith("ms")
    ? Number.parseFloat(declared)
    : declared.endsWith("s")
      ? Number.parseFloat(declared) * 1000
      : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 180;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "left";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  /* El cierre se demora lo que dura la animación de salida: sin eso el <dialog>
     desaparecería en el fotograma cero y la entrada se vería animada pero la
     salida no.

     La marca de "saliendo" se escribe DIRECTO en el atributo del elemento, no
     en estado de React. Es deliberado: React desaconseja llamar a setState
     dentro de un efecto porque encadena renders, y acá no hace ninguna falta —
     nada del árbol depende de ese valor salvo una regla de CSS. El <dialog> ya
     es un sistema externo que este efecto sincroniza; el atributo es parte de
     esa sincronización, igual que showModal() y close(). */
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      delete dialog.dataset.leaving;
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      /* Con movimiento reducido no hay animación que esperar: cerrar y listo.
         Esperar 240ms sin que se mueva nada sólo se siente como lentitud. */
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        dialog.close();
        return;
      }

      dialog.dataset.leaving = "true";
      /* La espera se lee del token que gobierna la animación de salida en vez
         de repetirlo acá. Estaba fijo en 240ms —el token de ENTRADA— mientras
         la salida dura `--p-t-base`: el cajón quedaba invisible pero abierto
         60ms de más, con el fondo todavía inerte. */
      const timer = setTimeout(() => {
        dialog.close();
        delete dialog.dataset.leaving;
      }, exitDurationMs(dialog));
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-side={side}
      className="cq-drawer"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {/* El encabezado va pegado arriba y el pie abajo: el cuerpo puede tener un
          formulario largo, y en ese caso el botón de guardar no puede quedar
          fuera de vista al final del scroll. */}
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-[var(--p-line)] px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="cq-title">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="cq-meta mt-1">
                {description}
              </p>
            )}
          </div>
          <IconButton
            label="Cerrar"
            size="sm"
            icon={<IconClose size={14} />}
            className="shrink-0"
            onClick={onClose}
          />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--p-line)] px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
