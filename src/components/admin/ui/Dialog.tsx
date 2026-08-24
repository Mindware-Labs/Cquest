"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";

// Sobre el <dialog> nativo (no una capa hecha a mano): resuelve trampa de foco, Escape, aria-modal, inerte y z-index gratis. Reemplaza a window.confirm, que no se puede diseñar/traducir y algunos navegadores dejan silenciar.

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
      // `cancel` cubre Escape/gesto del sistema, `close` cualquier otra vía; ambos avisan al padre para que su estado no quede desincronizado.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      // Clic en el fondo: ::backdrop no recibe eventos propios, se detecta comparando el target con el <dialog> mismo.
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

// `tone` existe porque no toda confirmación es un borrado (p. ej. publicar): pintar de rojo una acción principal le quitaría significado al rojo de "esto destruye algo".
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          {/* Cancelar va primero en el DOM: es el destino por defecto del foco al abrir, y en una confirmación el foco debe caer en la salida segura. */}
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "solid"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
