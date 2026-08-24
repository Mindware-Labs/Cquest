"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { TemplateActionState } from "@/lib/templates";
import { DeleteAction } from "@/components/admin/ui/DeleteAction";
import { Alert } from "@/components/admin/ui/Surface";
import { IconArrowRight } from "@/components/admin/ui/icons";

// Una sola tarjeta para plantillas del sistema y del equipo: el origen es un DATO (metadatos + filtro), no dos secciones con representaciones distintas.

export type TemplateItem = {
  key: string;
  // Clave con la que el editor conoce esta plantilla (`starter:<id>` o `saved:<id>`, igual que lib/templateChoices.ts); null si no se puede aplicar.
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
  thumb,
  deleteAction,
  index = 0,
}: {
  template: TemplateItem;
  // Llega ARMADA desde el servidor: BlockRenderer es un server component y esta tarjeta es de cliente, así que importarlo arrastraría los once renderers de bloque al bundle del navegador.
  thumb: ReactNode;
  // Ausente en las del sistema (viven en src/lib/templates.ts, no en la base): la tarjeta no dibuja un botón apagado que nunca se puede usar.
  deleteAction?: (state: TemplateActionState, formData: FormData) => Promise<TemplateActionState>;
  index?: number;
}) {
  // Mientras corre la ventana de deshacer, la tarjeta se oculta pero no se desmonta: deshacer necesita a quién devolverle el estado.
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (removed) return null;

  const canApply = Boolean(template.choiceKey) && !template.isBroken;

  return (
    <li
      className="cq-tcard cq-enter"
      // El escalonado se corta en 8: más allá la última tarjeta arranca medio segundo tarde y ya se está leyendo la primera.
      style={{ "--cq-i": Math.min(index, 8) } as CSSProperties}
    >
      {thumb}

      <div className="cq-tcard-body">
        <h3 className="cq-title truncate" title={template.name}>
          {template.name}
        </h3>

        {/* La estructura en texto permite que la miniatura vaya aria-hidden sin perder información. */}
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

        {/* Un esquema viejo no se puede aplicar; el admin debe enterarse ACÁ, no al abrir el editor. */}
        {template.isBroken && (
          <div className="mt-2">
            <Alert>
              Se guardó con una estructura que ya no es válida. Elimínala y vuelve a guardarla desde
              el editor.
            </Alert>
          </div>
        )}

        {error && (
          <div className="mt-2">
            <Alert>{error}</Alert>
          </div>
        )}

        {/* Acciones SIEMPRE visibles, no al apuntar (misma regla que las filas de Artículos): en táctil no hay hover, y algo que solo aparece con el puntero no se descubre. Sin menú de overflow porque solo hay una acción; se gana cuando existan Duplicar/Renombrar. */}
        <div className="cq-tcard-foot">
          {canApply ? (
            <Link
              href={`/admin/posts/new?plantilla=${encodeURIComponent(template.choiceKey!)}`}
              className="cq-tcard-use"
            >
              Usar plantilla
              <IconArrowRight size={14} aria-hidden="true" />
              {/* El nombre accesible dice CUÁL plantilla: veinte enlaces "Usar plantilla" en un lector de pantalla serían indistinguibles. */}
              <span className="sr-only">: {template.name}</span>
            </Link>
          ) : (
            // Sin destino no se finge un botón: un control que no lleva a ningún lado enseña a desconfiar de los que sí funcionan.
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
