"use client";

import { useState, useTransition } from "react";
import type { Block } from "@/lib/blocks";
import type { TemplateActionState } from "@/lib/templates";
import { Alert } from "@/components/admin/ui/Surface";
import { useToast } from "@/components/admin/ui/Toast";
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
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { notify } = useToast();

  /* El "guardado" decía la verdad a medias.

     Antes se marcaba `saved` en el mismo momento de despachar, ANTES de que la
     acción resolviera, y el campo no se limpiaba. Resultado: "Plantilla
     guardada." quedaba en pantalla al lado del nombre todavía escrito, y un
     segundo clic creaba una plantilla duplicada sin decir nada.

     Ahora se espera el resultado y sólo entonces se limpia y se avisa. El aviso
     es un toast como el del resto del panel, no un texto verde propio de esta
     caja. */
  function save() {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("blocks", JSON.stringify(blocks));

    startTransition(async () => {
      const result = await action({ error: null }, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(null);
      setName("");
      notify({ message: `Plantilla «${name}» guardada.`, tone: "success" });
    });
  }

  const isEmpty = blocks.length === 0 || name.trim().length < 2;

  return (
    <div className="cq-section pb-4">
      <div className="cq-section-head">
        <h2 className="cq-section-title">Guardar como plantilla</h2>
      </div>
      <p className="cq-meta">
        Guarda sólo la estructura de bloques. Queda disponible para todo el equipo.
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
            setError(null);
          }}
          className={`${INPUT_CLASS} mt-0`}
        />
      </label>

      <button
        type="button"
        onClick={save}
        disabled={isEmpty || isPending}
        className="cq-btn mt-2.5 w-full"
        data-variant="outline"
        data-size="sm"
      >
        {isPending ? "Guardando…" : "Guardar plantilla"}
      </button>

      {error && (
        <div className="mt-2">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}
