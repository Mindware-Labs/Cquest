"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { CategoryActionState } from "@/lib/categories";

type Action = (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-verde px-4 py-2.5 text-[0.85rem] font-semibold text-white transition-colors hover:bg-verde/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde disabled:opacity-60"
    >
      {pending ? "Creando…" : "Crear"}
    </button>
  );
}

export default function CategoryCreateForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  /* Se limpia solo cuando la creación salió bien. Si falló, el nombre escrito
     sigue ahí para corregirlo en vez de tener que tipearlo de nuevo. */
  useEffect(() => {
    if (state.error === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[14rem] flex-1">
        <label htmlFor="new-category" className="text-[0.82rem] font-semibold text-foreground">
          Nueva categoría
        </label>
        <input
          id="new-category"
          name="name"
          type="text"
          required
          maxLength={60}
          className="mt-1.5 w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-[0.95rem] text-foreground outline-none transition-colors focus:border-petroleo focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-petroleo"
        />
      </div>
      <SubmitButton />
      {state.error && (
        <p role="alert" className="w-full text-[0.85rem] text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
