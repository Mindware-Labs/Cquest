"use client";

import { useActionState, useEffect, useRef } from "react";
import type { CategoryActionState } from "@/lib/categories";
import { SubmitButton } from "@/components/admin/ui/Buttons";
import { IconPlus } from "@/components/admin/ui/icons";
import { Alert } from "@/components/admin/ui/Surface";

type Action = (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;

export default function CategoryCreateForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  /* Se limpia solo cuando la creación salió bien. Si falló, el nombre escrito
     sigue ahí para corregirlo en vez de tener que tipearlo de nuevo. */
  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="min-w-[15rem] flex-1">
        <label htmlFor="new-category" className="cq-label">
          Nueva categoría
        </label>
        <input
          id="new-category"
          name="name"
          type="text"
          required
          maxLength={60}
          placeholder="Por ejemplo: Operaciones"
          className="cq-input mt-1.5"
        />
      </div>

      <SubmitButton pendingLabel="Creando…" icon={<IconPlus size={16} />}>
        Crear
      </SubmitButton>

      {state.error && (
        <div className="w-full">
          <Alert>{state.error}</Alert>
        </div>
      )}
    </form>
  );
}
