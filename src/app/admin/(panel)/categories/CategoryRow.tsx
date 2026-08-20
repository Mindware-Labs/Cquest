"use client";

import { useActionState, useState } from "react";
import type { CategoryActionState } from "@/lib/categories";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/ui/Buttons";
import { IconClose, IconPencil } from "@/components/admin/ui/icons";
import { Alert } from "@/components/admin/ui/Surface";

type Action = (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;

export type CategoryRowData = {
  id: number;
  name: string;
  slug: string;
  postCount: number;
};

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
    <li className="cq-row border-b border-border px-5 py-3.5 last:border-b-0">
      {isEditing ? (
        <form action={renameFormAction} className="flex flex-wrap items-center gap-2">
          <input name="id" type="hidden" value={category.id} />
          <input
            name="name"
            type="text"
            defaultValue={category.name}
            required
            autoFocus
            maxLength={60}
            aria-label={`Nuevo nombre para ${category.name}`}
            className="cq-input min-w-[12rem] flex-1"
          />
          <SubmitButton variant="secondary" size="sm" pendingLabel="Guardando…">
            Guardar
          </SubmitButton>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="cq-btn"
            data-variant="quiet"
            data-size="sm"
          >
            <IconClose size={14} />
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
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cq-btn"
              data-variant="ghost"
              data-size="sm"
            >
              <IconPencil size={14} />
              Renombrar
            </button>

            <form action={deleteFormAction}>
              <input name="id" type="hidden" value={category.id} />
              <ConfirmSubmit
                confirmLabel="Confirmar"
                pendingLabel="Eliminando…"
                disabled={hasPosts}
                title={
                  hasPosts
                    ? "No se puede eliminar: tiene artículos asociados"
                    : undefined
                }
              >
                Eliminar
              </ConfirmSubmit>
            </form>
          </div>
        </div>
      )}

      {(renameState.error || deleteState.error) && (
        <div className="mt-2.5">
          <Alert>{renameState.error ?? deleteState.error}</Alert>
        </div>
      )}
    </li>
  );
}
