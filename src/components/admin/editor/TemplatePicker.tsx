"use client";

import type { Block } from "@/lib/blocks";

export type TemplateChoice = {
  key: string;
  name: string;
  blocks: Block[];
  /* Las 4 fijas viven en código; las propias, en la tabla Template. Se
     distinguen para que el admin sepa cuál puede borrar. */
  origin: "starter" | "saved";
  authorName?: string;
};

/* Los ids de una plantilla son fijos (vienen de un archivo o de la base). Si se
   aplicaran tal cual, aplicar la misma plantilla dos veces produciría bloques
   con ids repetidos — y el editor los trata como el mismo bloque, así que
   seleccionar uno seleccionaría los dos. */
export function withFreshIds(blocks: Block[]): Block[] {
  return blocks.map((block) => {
    const next = { ...block, id: crypto.randomUUID() };
    if (next.type === "columns") {
      next.columns = next.columns.map((column) =>
        column.map((child) => ({ ...child, id: crypto.randomUUID() })),
      );
    }
    return next;
  });
}

export default function TemplatePicker({
  templates,
  onPick,
  onSkip,
}: {
  templates: TemplateChoice[];
  onPick: (blocks: Block[]) => void;
  onSkip: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-[var(--surface-raised)] p-6">
      <h2 className="font-heading text-[1.05rem] font-semibold tracking-[-0.015em] text-foreground">
        Empezar desde una plantilla
      </h2>
      <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[var(--text-secondary)]">
        Una plantilla trae los bloques ya armados como punto de partida. Podés
        cambiar todo después.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => onPick(withFreshIds(template.blocks))}
            className="rounded-lg border border-border bg-white px-4 py-4 text-left transition-colors hover:border-petroleo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
          >
            <p className="text-[0.92rem] font-semibold text-foreground">{template.name}</p>
            <p className="mt-1 text-[0.76rem] text-[var(--text-tertiary)]">
              {template.blocks.length} {template.blocks.length === 1 ? "bloque" : "bloques"}
              {template.origin === "saved" && template.authorName ? ` · ${template.authorName}` : ""}
            </p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-5 text-[0.85rem] font-semibold text-petroleo underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
      >
        Empezar en blanco
      </button>
    </section>
  );
}
