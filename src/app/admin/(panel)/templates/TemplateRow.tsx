"use client";

import { useState, type CSSProperties } from "react";
import type { TemplateActionState } from "@/lib/templates";
import { DeleteAction } from "@/components/admin/ui/DeleteAction";
import { Alert, Ident } from "@/components/admin/ui/Surface";
import { TemplateShape } from "@/components/admin/ui/TemplateShape";

export default function TemplateRow({
  template,
  deleteAction,
  index = 0,
}: {
  template: {
    id: number;
    name: string;
    types: string[];
    blockCount: number;
    isBroken: boolean;
    authorName: string;
    createdAt: string;
  };
  deleteAction: (state: TemplateActionState, formData: FormData) => Promise<TemplateActionState>;
  index?: number;
}) {
  /* Mientras corre la ventana de deshacer la fila desaparece de la lista. No se
     desmonta: si se desmontara, deshacer no tendría a quién devolverle el
     estado. Se oculta y se saca del árbol de accesibilidad. */
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (removed) return null;

  return (
    <li
      className="cq-row cq-enter flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[var(--p-line)] py-3 last:border-b-0"
      style={{ "--cq-i": index } as CSSProperties}
    >
      <span className="cq-ledger-n w-6 shrink-0" aria-hidden="true" />

      <div className="w-[6.5rem] shrink-0">
        <TemplateShape types={template.types} />
      </div>

      <div className="min-w-[10rem] flex-1">
        <p className="cq-title">{template.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Ident>
            {template.blockCount} {template.blockCount === 1 ? "bloque" : "bloques"}
          </Ident>
          <span aria-hidden="true" className="cq-meta">
            ·
          </span>
          <span className="cq-meta">{template.authorName}</span>
          <span aria-hidden="true" className="cq-meta">
            ·
          </span>
          <span className="cq-meta">{template.createdAt}</span>
        </p>
      </div>

      <div className="cq-row-actions shrink-0">
        <DeleteAction
          /* `compact` como en artículos y categorías. Sin esto, la misma acción
             se dibujaba como botón con texto acá y como icono rojo en los otros
             dos módulos, a un clic de distancia entre ellos. */
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
      </div>

      {/* Una plantilla guardada con un esquema viejo no se puede usar, y el
          admin tiene que enterarse acá y no al aplicarla sobre un artículo. */}
      {template.isBroken && (
        <div className="w-full">
          <Alert>
            Esta plantilla se guardó con una estructura que ya no es válida. Eliminala y volvé a
            guardarla desde el editor.
          </Alert>
        </div>
      )}

      {error && (
        <div className="w-full">
          <Alert>{error}</Alert>
        </div>
      )}
    </li>
  );
}
