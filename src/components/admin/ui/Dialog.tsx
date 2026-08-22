"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";

/* Diálogo del panel, sobre el <dialog> nativo.

   Se usa el elemento del navegador y no una capa hecha a mano porque el nativo
   ya resuelve —bien, y en todos los navegadores actuales— las cinco cosas que
   se hacen mal cuando esto se reimplementa: la trampa de foco, el cierre con
   Escape, `aria-modal`, dejar inerte el resto de la página, y aparecer por
   encima de todo sin pelear con z-index.

   Esto es además lo que reemplaza al `window.confirm`. El del navegador saca al
   admin de la página, no se puede diseñar, no se puede traducir y en algunos
   navegadores se puede silenciar — o sea que el paso de seguridad puede
   desaparecer sin aviso. */

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="cq-overlay cq-dialog"
      /* `cancel` cubre Escape y el gesto de cierre del sistema; `close` cubre
         cualquier otra vía. Los dos avisan al padre para que su estado no quede
         diciendo "abierto" con el diálogo ya cerrado. */
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      /* Clic en el fondo. El ::backdrop no recibe eventos propios: lo que llega
         es un clic sobre el <dialog> fuera de su caja de contenido, y se
         detecta comparando el objetivo con el elemento mismo. */
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="p-4">
        <h2 id={titleId} className="cq-title">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="cq-meta mt-1.5">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">{footer}</div>
      </div>
    </dialog>
  );
}

/* Confirmación de una acción destructiva. Un solo componente para todas, con el
   nombre de lo que se va a borrar escrito en el título: "¿Eliminar?" a secas
   obliga a recordar sobre qué fila se hizo clic. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          {/* Cancelar va primero en el DOM: es el destino por defecto del foco
              al abrir el diálogo, y en una confirmación destructiva el foco
              tiene que caer en la salida segura. */}
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
