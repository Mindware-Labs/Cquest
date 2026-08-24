"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { IconClose } from "./icons";
import { IconButton } from "./Button";

// Cajón y no modal: deja ver la fila sobre la que se actúa. Anima por transform, no width, para no recalcular el layout del formulario en cada cuadro.

// Lee --p-t-base del elemento en vez de hardcodear la espera: cambiar el token de CSS no requiere tocar este archivo. 180ms es el respaldo si el estilo aún no se calculó.
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
  // Escala corta (sm/md/lg) en vez de un número por sitio; md es el valor que ya usaban todos los cajones existentes.
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "left";
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  // Marca que el cierre lo pidió este componente, para no reenviar el aviso cuando el <dialog> emita su propio evento close.
  const closing = useRef(false);

  // El flag "leaving" se escribe directo en el dataset y no en estado de React: nada del árbol depende de él salvo una regla CSS, y evita encadenar renders desde un efecto.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      delete dialog.dataset.leaving;
      closing.current = false;
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      // Todo cierre que llega acá ya viene de que el consumidor puso open en false; no hace falta volver a avisarle en el close nativo.
      closing.current = true;

      // Con movimiento reducido no hay animación que esperar: cerrar directo evita una espera de 240ms sin nada que se mueva.
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        dialog.close();
        return;
      }

      dialog.dataset.leaving = "true";
      // La espera se lee de --p-t-base (el token de salida) y no un valor fijo: estaba en 240ms, el de ENTRADA, y el cajón quedaba invisible pero abierto 60ms de más.
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
      data-size={size}
      className="cq-drawer"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // onClose también dispara por el dialog.close() del efecto de arriba al terminar la animación; sin este guard se llamaba dos veces por cierre.
      onClose={() => {
        if (closing.current) {
          closing.current = false;
          return;
        }
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {/* Encabezado fijo arriba y pie abajo: un formulario largo no puede dejar el botón de guardar fuera de vista. */}
      <div className="flex h-full min-h-0 flex-col">
        <header className="cq-drawer-head">
          <div className="min-w-0">
            <h2 id={titleId} className="cq-drawer-title">
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

        {/* cq-scroll trae overscroll-behavior: contain, así el final del formulario no arrastra la página de atrás con la rueda del mouse. */}
        <div className="cq-drawer-body cq-scroll">{children}</div>

        {footer && <footer className="cq-drawer-foot">{footer}</footer>}
      </div>
    </dialog>
  );
}

// No dibuja tarjeta: en un cajón de 26rem, tarjetas anidadas comen el espacio; la agrupación la hacen etiqueta + espacio + regla fina.
export function DrawerSection({
  title,
  description,
  children,
  // La primera sección no lleva regla arriba: el encabezado del cajón ya cierra con la suya.
  divided = true,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  divided?: boolean;
}) {
  return (
    <section className={clsx("cq-drawer-section", divided && "cq-drawer-section-divided")}>
      {title && <h3 className="cq-label cq-drawer-section-title">{title}</h3>}
      {description && <p className="cq-meta mt-1">{description}</p>}
      <div className={clsx(title || description ? "mt-3" : undefined)}>{children}</div>
    </section>
  );
}

// Etiqueta más liviana que el valor: quien recorre el cajón lee valores y usa la etiqueta solo para ubicarse.
export function DrawerField({
  label,
  children,
  // Una columna cuando el valor es largo, dos cuando es corto; lo decide quien conoce el dato, no el componente.
  inline = false,
}: {
  label: string;
  children: ReactNode;
  inline?: boolean;
}) {
  return (
    <div className={clsx("cq-drawer-field", inline && "cq-drawer-field-inline")}>
      <dt className="cq-meta">{label}</dt>
      <dd className="cq-body text-[var(--p-ink)]">{children}</dd>
    </div>
  );
}

// dt/dd real y no dos <span>: un lector de pantalla anuncia el par como tal, no como dos textos sueltos.
export function DrawerFields({ children }: { children: ReactNode }) {
  return <dl className="cq-drawer-fields">{children}</dl>;
}
