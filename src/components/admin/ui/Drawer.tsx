"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import clsx from "clsx";
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
  /* El ancho sale de una escala corta, no de un número por sitio de uso. Un
     cajón con un campo y uno con doce metadatos no quieren el mismo ancho, y
     hasta ahora los dos medían 26rem porque era el único que había. `md` es
     exactamente el valor anterior: los consumidores que no pidan nada se
     dibujan igual que antes. */
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
  /* Marca que el cierre lo pidió ESTE componente, para no reenviar el aviso
     cuando el <dialog> emita su propio evento `close` a continuación. */
  const closing = useRef(false);

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
      closing.current = false;
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      /* Todo cierre que sale de acá ya viene de que el consumidor puso `open`
         en false: el `close` nativo que dispare `dialog.close()` más abajo no
         tiene que volver a avisarle. */
      closing.current = true;

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
      data-size={size}
      className="cq-drawer"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      /* `onClose` se dispara TAMBIÉN por el `dialog.close()` que ejecuta el
         efecto de arriba al terminar la animación de salida, así que avisar sin
         condición llamaba a `onClose` dos veces por cada cierre. Con
         `setOpen(false)` en el consumidor no se notaba —es idempotente—, pero
         cualquier cierre que además limpie un formulario, mande una métrica o
         muestre un aviso lo haría dos veces. */
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
      {/* El encabezado va pegado arriba y el pie abajo: el cuerpo puede tener un
          formulario largo, y en ese caso el botón de guardar no puede quedar
          fuera de vista al final del scroll. */}
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

        {/* `.cq-scroll` y no un `overflow-y-auto` suelto: trae la barra fina en
            color de sistema y —lo que importa— `overscroll-behavior: contain`,
            así llegar al final del formulario deja de arrastrar la página de
            atrás, que es lo que pasaba con la rueda del mouse. */}
        <div className="cq-drawer-body cq-scroll">{children}</div>

        {footer && <footer className="cq-drawer-foot">{footer}</footer>}
      </div>
    </dialog>
  );
}

/* ---------------------------------------------------------------------------
   Sección del cajón
   Agrupa campos o datos relacionados con un canto de texto, no con una caja.

   Es a propósito que NO dibuje tarjeta: un cajón de 26rem con tres tarjetas
   adentro es una caja dentro de una caja dentro de una caja, y a ese ancho el
   filete se come el espacio que necesita el contenido. La agrupación la hacen
   la etiqueta, el espacio y una regla fina — que es todo lo que hace falta para
   que se lea como bloque.
--------------------------------------------------------------------------- */

export function DrawerSection({
  title,
  description,
  children,
  /* La primera sección no lleva regla arriba: el encabezado del cajón ya cerró
     con la suya, y dos líneas separadas por 16px se leen como un error. */
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

/* ---------------------------------------------------------------------------
   Dato del cajón
   Una etiqueta y su valor. La etiqueta pesa menos que el valor: es el nombre
   del campo, no la información. Quien recorre un cajón buscando un dato lee los
   valores y usa las etiquetas sólo para ubicarse.
--------------------------------------------------------------------------- */

export function DrawerField({
  label,
  children,
  /* En una sola columna cuando el valor es largo —un título, una URL— y en dos
     cuando es corto. La decisión la toma quien conoce el dato, no el
     componente adivinando por el largo del string. */
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

/* La lista que envuelve a los `DrawerField`. Existe para que el par
   etiqueta/valor sea `<dt>`/`<dd>` de verdad y no dos `<span>` que se ven
   parecido: un lector de pantalla anuncia "Estado, Activo" como un par y no
   como dos textos sueltos que casualmente están cerca. */
export function DrawerFields({ children }: { children: ReactNode }) {
  return <dl className="cq-drawer-fields">{children}</dl>;
}
