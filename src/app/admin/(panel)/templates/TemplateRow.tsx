"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { TemplateActionState } from "@/lib/templates";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-border px-3 py-1.5 text-[0.8rem] font-semibold text-red-700 transition-colors hover:border-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-40"
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}

export default function TemplateRow({
  template,
  deleteAction,
}: {
  template: { id: number; name: string; blockCount: number; authorName: string; createdAt: string };
  deleteAction: (
    state: TemplateActionState,
    formData: FormData,
  ) => Promise<TemplateActionState>;
}) {
  const [state, formAction] = useActionState(deleteAction, { error: null });

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 last:border-b-0">
      <div>
        <p className="text-[0.95rem] font-semibold text-foreground">{template.name}</p>
        <p className="mt-0.5 text-[0.78rem] text-[var(--text-tertiary)]">
          {template.blockCount} {template.blockCount === 1 ? "bloque" : "bloques"} ·{" "}
          {template.authorName} · {template.createdAt}
        </p>
      </div>

      <form
        action={formAction}
        onSubmit={(event) => {
          if (!confirm(`¿Eliminar la plantilla "${template.name}"?`)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={template.id} />
        <DeleteButton />
      </form>

      {state.error && (
        <p role="alert" className="w-full text-[0.82rem] text-red-700">
          {state.error}
        </p>
      )}
    </li>
  );
}
