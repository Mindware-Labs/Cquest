"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { CategoryActionState } from "@/lib/categories";

type Action = (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;

export type CategoryRowData = {
  id: number;
  name: string;
  slug: string;
  postCount: number;
};

function PendingButton({ label, pendingLabel, className }: { label: string; pendingLabel: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

const GHOST_BUTTON =
  "rounded-md border border-border px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo disabled:opacity-60";

export default function CategoryRow({
  category,
  renameAction,
  deleteAction,
}: {
  category: CategoryRowData;
  renameAction: Action;
  deleteAction: Action;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [renameState, renameFormAction] = useActionState(renameAction, { error: null });
  const [deleteState, deleteFormAction] = useActionState(deleteAction, { error: null });

  /* Una categoría con artículos no se puede borrar (AD-4). El backend ya lo
     impide; deshabilitar el botón acá es para que el admin lo sepa ANTES de
     hacer clic, no después de recibir un error. */
  const hasPosts = category.postCount > 0;

  return (
    <li className="border-b border-border py-4 last:border-b-0">
      {isEditing ? (
        <form action={renameFormAction} className="flex flex-wrap items-center gap-2">
          <input
            name="id"
            type="hidden"
            value={category.id}
          />
          <input
            name="name"
            type="text"
            defaultValue={category.name}
            required
            maxLength={60}
            aria-label={`Nuevo nombre para ${category.name}`}
            className="min-w-[12rem] flex-1 rounded-md border border-border bg-white px-3 py-2 text-[0.9rem] text-foreground outline-none focus:border-petroleo focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-petroleo"
          />
          <PendingButton
            label="Guardar"
            pendingLabel="Guardando…"
            className="rounded-md bg-petroleo px-3.5 py-2 text-[0.8rem] font-semibold text-white transition-colors hover:bg-petroleo/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo disabled:opacity-60"
          />
          <button type="button" onClick={() => setIsEditing(false)} className={GHOST_BUTTON}>
            Cancelar
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.98rem] font-semibold text-foreground">{category.name}</p>
            <p className="mt-0.5 text-[0.78rem] text-[var(--text-tertiary)]">
              /{category.slug} · {category.postCount}{" "}
              {category.postCount === 1 ? "artículo" : "artículos"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsEditing(true)} className={GHOST_BUTTON}>
              Renombrar
            </button>

            <form
              action={deleteFormAction}
              onSubmit={(event) => {
                if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) {
                  event.preventDefault();
                }
              }}
            >
              <input name="id" type="hidden" value={category.id} />
              <button
                type="submit"
                disabled={hasPosts}
                title={hasPosts ? "Tiene artículos asociados" : undefined}
                className="rounded-md border border-border px-3 py-1.5 text-[0.8rem] font-semibold text-red-700 transition-colors hover:border-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Eliminar
              </button>
            </form>
          </div>
        </div>
      )}

      {(renameState.error || deleteState.error) && (
        <p role="alert" className="mt-2 text-[0.82rem] text-red-700">
          {renameState.error ?? deleteState.error}
        </p>
      )}
    </li>
  );
}
