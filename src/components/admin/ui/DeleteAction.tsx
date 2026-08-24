"use client";

import { useId, useRef, useState, useTransition } from "react";
import { IconTrash } from "./icons";
import { Button, IconButton } from "./Button";
import { ConfirmDialog } from "./Dialog";
import { useToast } from "./Toast";

// La acción de servidor NO se dispara al confirmar, sólo cuando VENCE el aviso de deshacer (5s): sin eso un deshacer real exigiría `deletedAt` en el modelo. Si se cierra la pestaña antes, el borrado no llega a ocurrir — asumido, es el lado correcto en el que fallar para un panel interno.
export function DeleteAction({
  // Nombre propio de lo que se borra: "¿Eliminar el elemento?" obliga a recordar sobre qué fila se hizo clic.
  name,
  noun = "el artículo",
  action,
  onOptimisticRemove,
  disabled,
  disabledReason,
  compact = false,
}: {
  name: string;
  noun?: string;
  // Recibe el control ya envuelto: quien use esto no arma el FormData.
  action: () => Promise<{ error: string | null }>;
  // Saca la fila de la lista mientras corre la ventana de deshacer; opcional, el aviso funciona igual sin esto.
  onOptimisticRemove?: (removed: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
  compact?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();
  const { notify } = useToast();
  const cancelled = useRef(false);
  const describedById = useId();

  function commit() {
    setAsking(false);
    cancelled.current = false;
    onOptimisticRemove?.(true);

    notify({
      message: `${capitalize(noun)} «${name}» se eliminó.`,
      tone: "danger",
      action: {
        label: "Deshacer",
        onClick: () => {
          cancelled.current = true;
          onOptimisticRemove?.(false);
        },
      },
      onExpire: () => {
        if (cancelled.current) return;
        startTransition(async () => {
          const result = await action();
          // Si el servidor rechaza, la fila vuelve: dejarla oculta mostraría como borrado algo que sigue existiendo.
          if (result.error) {
            onOptimisticRemove?.(false);
            notify({ message: result.error, tone: "danger", durationMs: 8000 });
          }
        });
      },
    });
  }

  // El motivo se describe (aparte, con aria-describedby) y no reemplaza la etiqueta del botón: si no, un lector de pantalla anunciaría el motivo en vez de la acción.
  const reasonId = `${describedById}-reason`;
  const showReason = disabled && Boolean(disabledReason);

  const trigger = compact ? (
    <IconButton
      label={`Eliminar «${name}»`}
      tone="danger"
      size="sm"
      icon={<IconTrash size={14} />}
      disabled={disabled || pending}
      aria-describedby={showReason ? reasonId : undefined}
      onClick={() => setAsking(true)}
    />
  ) : (
    <Button
      variant="danger"
      size="sm"
      icon={<IconTrash size={14} />}
      disabled={disabled || pending}
      title={disabled ? disabledReason : undefined}
      aria-describedby={showReason ? reasonId : undefined}
      onClick={() => setAsking(true)}
    >
      Eliminar
    </Button>
  );

  return (
    <>
      {trigger}
      {showReason && (
        <span id={reasonId} className="sr-only">
          {disabledReason}
        </span>
      )}
      <ConfirmDialog
        open={asking}
        onClose={() => setAsking(false)}
        onConfirm={commit}
        title={`¿Eliminar ${noun} «${name}»?`}
        description="Vas a tener cinco segundos para deshacerlo antes de que se aplique."
      />
    </>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("es") + value.slice(1);
}
