"use client";

import { useState, type CSSProperties } from "react";
import type { TemplateActionState } from "@/lib/templates";
import { DeleteAction } from "@/components/admin/ui/DeleteAction";
import { LinkButton } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Surface";
import { TemplateThumb } from "@/components/admin/ui/TemplateThumb";
import { IconArrowRight } from "@/components/admin/ui/icons";

/* La tarjeta de plantilla — una sola, para las del sistema y las del equipo.

   De dónde viene una plantilla es un DATO de la tarjeta, no una arquitectura de
   página: va en la línea de metadatos y en el filtro de la barra. Antes eran dos
   secciones con dos representaciones distintas del mismo objeto, y el ojo tenía
   que reaprender la pantalla a mitad de camino. */

export type TemplateItem = {
  key: string;
  /* La clave con la que el editor conoce esta plantilla — `starter:<id>` o
     `saved:<id>`, igual que en `lib/templateChoices.ts`. Es lo que viaja en la
     URL al aplicarla. Vacía si la plantilla no se puede aplicar. */
  choiceKey: string | null;
  name: string;
  types: string[];
  blockCount: number;
  origin: "system" | "team";
  id?: number;
  authorName?: string;
  createdAt?: string;
  isBroken?: boolean;
};

const BLOCK_LABEL: Record<string, string> = {
  heading: "Título",
  paragraph: "Párrafo",
  image: "Imagen",
  gallery: "Galería",
  video: "Video",
  quote: "Cita",
  list: "Lista",
  table: "Tabla",
  cta: "Llamado",
  columns: "Columnas",
  divider: "Separador",
};

export default function TemplateCard({
  template,
  deleteAction,
  index = 0,
}: {
  template: TemplateItem;
  /* Ausente en las del sistema: viven en `src/lib/templates.ts`, no en la base.
     La tarjeta no dibuja un botón apagado — un control que nunca se puede usar
     es ruido que hay que aprender a ignorar. */
  deleteAction?: (state: TemplateActionState, formData: FormData) => Promise<TemplateActionState>;
  index?: number;
}) {
  /* Mientras corre la ventana de deshacer la tarjeta desaparece de la grilla. No
     se desmonta: si se desmontara, deshacer no tendría a quién devolverle el
     estado. */
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (removed) return null;

  const canApply = Boolean(template.choiceKey) && !template.isBroken;

  return (
    <li
      className="cq-tcard cq-enter"
      /* El escalonado se corta en 8: a partir de ahí la última tarjeta arranca
         medio segundo tarde y el que opera ya está leyendo la primera. */
      style={{ "--cq-i": Math.min(index, 8) } as CSSProperties}
    >
      <TemplateThumb types={template.types} />

      <div className="cq-tcard-body">
        <h3 className="cq-title truncate" title={template.name}>
          {template.name}
        </h3>

        {/* La estructura, en texto, para quien no ve la miniatura. Es lo que
            hace que la lámina pueda ir `aria-hidden` sin perder información. */}
        <p className="sr-only">
          Estructura: {template.types.map((type) => BLOCK_LABEL[type] ?? type).join(", ")}.
        </p>

        <p className="cq-meta truncate">
          {template.blockCount} {template.blockCount === 1 ? "bloque" : "bloques"}
          <span aria-hidden="true"> · </span>
          {template.origin === "system" ? "Del sistema" : template.authorName}
          {template.origin === "team" && template.createdAt && (
            <>
              <span aria-hidden="true"> · </span>
              {template.createdAt}
            </>
          )}
        </p>

        {/* Una plantilla guardada con un esquema viejo no se puede aplicar, y el
            admin tiene que enterarse ACÁ y no al abrir el editor. */}
        {template.isBroken && (
          <div className="mt-2">
            <Alert>
              Se guardó con una estructura que ya no es válida. Eliminala y volvé a guardarla desde
              el editor.
            </Alert>
          </div>
        )}

        {error && (
          <div className="mt-2">
            <Alert>{error}</Alert>
          </div>
        )}

        {/* Las acciones están SIEMPRE visibles, no al apuntar.

            Es la misma regla que ya gobierna las filas de Artículos, y por el
            mismo motivo: lo que aparece con el puntero no se descubre —alguien
            que entra por primera vez no tiene forma de saber que existe— y en
            pantalla táctil directamente no hay hover. Lo que el puntero agrega
            acá es énfasis sobre la tarjeta entera, no revelación.

            Sin menú de overflow: guarda exactamente un elemento. Un `⋯` que
            esconde una sola acción es un clic de más y una acción menos visible.
            Cuando existan Duplicar y Renombrar, ahí se gana el menú. */}
        <div className="cq-tcard-foot">
          {canApply ? (
            <LinkButton
              href={`/admin/posts/new?plantilla=${encodeURIComponent(template.choiceKey!)}`}
              variant="solid"
              size="sm"
              icon={<IconArrowRight size={14} />}
            >
              Usar
            </LinkButton>
          ) : (
            /* Sin destino no se finge un botón: un control que no lleva a
               ningún lado enseña a desconfiar de los que sí funcionan. */
            <span className="cq-meta">No se puede aplicar</span>
          )}

          {deleteAction && template.id !== undefined && (
            <DeleteAction
              compact
              name={template.name}
              noun="la plantilla"
              onOptimisticRemove={(isRemoved) => {
                setRemoved(isRemoved);
                if (isRemoved) setError(null);
              }}
              action={async () => {
                const formData = new FormData();
                formData.set("id", String(template.id));
                const result = await deleteAction({ error: null }, formData);
                setError(result.error);
                return result;
              }}
            />
          )}
        </div>
      </div>
    </li>
  );
}
