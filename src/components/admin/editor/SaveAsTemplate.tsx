"use client";

import { useActionState, useState } from "react";
import type { Block } from "@/lib/blocks";
import type { TemplateActionState } from "@/lib/templates";
import { INPUT_CLASS } from "./fields";

/* Guardar la estructura del artículo como plantilla reutilizable (AD-15).

   Deliberadamente NO es un <form>: este componente vive dentro del formulario
   del artículo, y anidar formularios es HTML inválido — el navegador cierra el
   interno y sus campos terminan enviándose con el submit del artículo. Por eso
   arma el FormData a mano y despacha la action directamente. */
export default function SaveAsTemplate({
  action,
  blocks,
}: {
  action: (state: TemplateActionState, formData: FormData) => Promise<TemplateActionState>;
  blocks: Block[];
}) {
  const [state, dispatch, isPending] = useActionState(action, { error: null });
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  function save() {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("blocks", JSON.stringify(blocks));
    dispatch(formData);
    setSaved(true);
  }

  const isEmpty = blocks.length === 0 || name.trim().length < 2;

  return (
    <div className="rounded-xl border border-border bg-[var(--surface-raised)] p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-petroleo">
        Guardar como plantilla
      </p>
      <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[var(--text-tertiary)]">
        Guarda solo la estructura de bloques. Queda disponible para todo el
        equipo.
      </p>

      <label className="mt-3 block">
        <span className="sr-only">Nombre de la plantilla</span>
        <input
          type="text"
          value={name}
          maxLength={60}
          placeholder="Nombre de la plantilla"
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          className={`${INPUT_CLASS} mt-0`}
        />
      </label>

      <button
        type="button"
        onClick={save}
        disabled={isEmpty || isPending}
        className="mt-2.5 w-full rounded-md border border-border bg-white px-3 py-2 text-[0.8rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Guardando…" : "Guardar plantilla"}
      </button>

      {state.error && (
        <p role="alert" className="mt-2 text-[0.78rem] text-red-700">
          {state.error}
        </p>
      )}
      {saved && !isPending && !state.error && (
        <p className="mt-2 text-[0.78rem] text-verde">Plantilla guardada.</p>
      )}
    </div>
  );
}
