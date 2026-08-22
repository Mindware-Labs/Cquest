"use client";

import { useRef, useState, useTransition } from "react";
import { IconTrash } from "./icons";
import { Button, IconButton } from "./Button";
import { ConfirmDialog } from "./Dialog";
import { useToast } from "./Toast";

/* Borrado con confirmación Y deshacer.

   El punto fino, porque define todo el componente: la acción de servidor NO se
   dispara al confirmar. Se dispara cuando VENCE el aviso.

   Confirmar sólo saca la fila de la vista y abre una ventana de cinco segundos
   con un botón "Deshacer". Si se toca, no pasó nada: no hubo pedido, no hubo
   borrado, no hace falta restaurar. Si el plazo vence, recién ahí sale el
   pedido al servidor.

   Se hizo así a propósito y no con un borrado real + restauración, porque un
   deshacer de verdad exigiría una columna `deletedAt` en el modelo —o sea un
   cambio de datos, que este trabajo no toca—. Esta versión da la misma
   protección al que opera sin pedir nada al esquema.

   Consecuencia honesta y asumida: si se cierra la pestaña dentro de esos cinco
   segundos, el borrado no llega a ocurrir. El registro sigue existiendo. Para
   un panel interno es el lado correcto en el que fallar: se pierde una
   eliminación, no un artículo. */

export function DeleteAction({
  /* Qué se está por borrar, con nombre propio. "¿Eliminar el elemento?" obliga
     a recordar sobre qué fila se hizo clic. */
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
  /* Recibe el control ya envuelto: quien use esto no arma el FormData. */
  action: () => Promise<{ error: string | null }>;
  /* Saca la fila de la lista mientras corre la ventana de deshacer. Opcional:
     si la vista no maneja estado optimista, el aviso igual funciona. */
  onOptimisticRemove?: (removed: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
  compact?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();
  const { notify } = useToast();
  const cancelled = useRef(false);

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
          /* Si el servidor rechaza, la fila vuelve: dejarla oculta mostraría
             como borrado algo que sigue existiendo, y eso se descubre recién al
             recargar. */
          if (result.error) {
            onOptimisticRemove?.(false);
            notify({ message: result.error, tone: "danger", durationMs: 8000 });
          }
        });
      },
    });
  }

  const trigger = compact ? (
    <IconButton
      label={disabled && disabledReason ? disabledReason : `Eliminar «${name}»`}
      tone="danger"
      size="sm"
      icon={<IconTrash size={14} />}
      disabled={disabled || pending}
      onClick={() => setAsking(true)}
    />
  ) : (
    <Button
      variant="danger"
      size="sm"
      icon={<IconTrash size={14} />}
      disabled={disabled || pending}
      title={disabled ? disabledReason : undefined}
      onClick={() => setAsking(true)}
    >
      Eliminar
    </Button>
  );

  return (
    <>
      {trigger}
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
