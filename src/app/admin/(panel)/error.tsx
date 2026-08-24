"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/admin/ui/Button";
import { IconRetry } from "@/components/admin/ui/icons";
import { ErrorState, Ident } from "@/components/admin/ui/Surface";

// Vive en (panel) y no en cada sección (todas fallan por lo mismo: la base no responde) para no mantener copias que se desactualizan. reset() reintenta el render sin recargar, sin perder sesión ni scroll.

export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // No se muestra el stack al que opera: no puede hacer nada con él y sí puede filtrar nombres de tabla.
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

      {/* Único dato que sirve para encontrar este error exacto en los registros del servidor. */}
      {error.digest && (
        <p className="mt-3 text-center">
          <Ident chip>error/{error.digest}</Ident>
        </p>
      )}
    </div>
  );
}
