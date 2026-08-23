"use client";

import type { Block } from "@/lib/blocks";
import { Ident } from "@/components/admin/ui/Surface";
import { TemplateShape } from "@/components/admin/ui/TemplateShape";

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
    <section className="cq-section">
      <div className="cq-section-head">
        <div className="flex items-end gap-3">
          <span aria-hidden="true" className="cq-section-figure">
            {String(templates.length).padStart(2, "0")}
          </span>
          <h2 className="cq-section-title pb-1.5">Empezar desde una plantilla</h2>
        </div>
      </div>

      <p className="cq-meta max-w-[64ch]">
        Una plantilla trae los bloques ya armados como punto de partida. Podés cambiar todo después.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <button
            key={template.key}
            type="button"
            onClick={() => onPick(withFreshIds(template.blocks))}
            className="cq-card cq-enter text-left"
            style={{ "--cq-i": Math.min(index, 8) } as React.CSSProperties}
          >
            <TemplateShape types={template.blocks.map((block) => block.type)} />
            <p className="cq-title mt-3">{template.name}</p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5">
              <Ident>
                {template.blocks.length} {template.blocks.length === 1 ? "bloque" : "bloques"}
              </Ident>
              {template.origin === "saved" && template.authorName && (
                <>
                  <span aria-hidden="true" className="cq-meta">
                    ·
                  </span>
                  <span className="cq-meta">{template.authorName}</span>
                </>
              )}
            </p>
          </button>
        ))}
      </div>

      <button type="button" onClick={onSkip} className="cq-link cq-body mt-4 pb-4">
        Empezar en blanco
      </button>
    </section>
  );
}
