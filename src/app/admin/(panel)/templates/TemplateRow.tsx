"use client";

import { useActionState } from "react";
import type { TemplateActionState } from "@/lib/templates";
import { ConfirmSubmit } from "@/components/admin/ui/Buttons";
import { Alert } from "@/components/admin/ui/Surface";
import { TemplateShape } from "@/components/admin/ui/TemplateShape";

export default function TemplateRow({
  template,
  deleteAction,
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
}) {
  const [state, formAction] = useActionState(deleteAction, { error: null });

  return (
    <li className="cq-row flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-5 py-4 last:border-b-0">
      <div className="w-[7.5rem] shrink-0">
        <TemplateShape types={template.types} />
      </div>

      <div className="min-w-[11rem] flex-1">
        <p className="text-[0.95rem] font-semibold text-foreground">{template.name}</p>
        <p className="mt-0.5 text-[0.78rem] text-[var(--text-tertiary)]">
          {template.blockCount} {template.blockCount === 1 ? "bloque" : "bloques"} ·{" "}
          {template.authorName} · {template.createdAt}
        </p>
      </div>

      <form action={formAction}>
        <input type="hidden" name="id" value={template.id} />
        <ConfirmSubmit confirmLabel="Confirmar" pendingLabel="Eliminando…">
          Eliminar
        </ConfirmSubmit>
      </form>

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

      {state.error && (
        <div className="w-full">
          <Alert>{state.error}</Alert>
        </div>
      )}
    </li>
  );
}
