"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/admin/ui/Button";
import { IconRetry } from "@/components/admin/ui/icons";
import { ErrorState, Ident } from "@/components/admin/ui/Surface";

/* El quinto estado, que hasta ahora no existía en ninguna vista del panel.

   Vive en el grupo `(panel)` y no en cada sección: todas las pantallas fallan
   por lo mismo —la base no responde— y cuatro copias del mismo cartel sólo
   garantizan que tres queden desactualizadas. Next lo aplica a todas las rutas
   hijas.

   `reset()` reintenta el render del segmento sin recargar la pestaña: no se
   pierde el riel, ni la sesión, ni la posición del scroll. Es la diferencia
   entre "probá de nuevo" y "empezá de nuevo". */

export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /* El detalle va a la consola del servidor por el digest y acá al log del
       navegador. Lo que NO se hace es mostrarle el stack al que opera: no puede
       hacer nada con él y sí puede filtrar nombres de tabla. */
    console.error(error);
  }, [error]);

  return (
    <div>
      <ErrorState
        title="No se pudo cargar esta sección"
        hint="Suele ser la conexión con la base de datos. El contenido publicado no se toca: esto es sólo el panel."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="solid" icon={<IconRetry size={15} />} onClick={reset}>
              Reintentar
            </Button>
            <LinkButton href="/admin">Volver al inicio</LinkButton>
          </div>
        }
      />

      {/* El identificador del fallo, en mono y copiable. Es el único dato que
          sirve para encontrar este error exacto en los registros del servidor. */}
      {error.digest && (
        <p className="mt-3 text-center">
          <Ident chip>error/{error.digest}</Ident>
        </p>
      )}
    </div>
  );
}
