"use client";

import type { ReactNode } from "react";
import type { Block } from "@/lib/blocks";
import { Ident } from "@/components/admin/ui/Surface";

export type TemplateChoice = {
  key: string;
  name: string;
  blocks: Block[];
  /* Las 4 fijas viven en código; las propias, en la tabla Template. Se
     distinguen para que el admin sepa cuál puede borrar. */
  origin: "starter" | "saved";
  authorName?: string;
  /* La miniatura, YA RENDERIZADA desde el servidor.

     Es el mismo render real que usa la pantalla de Plantillas —`TemplateThumb`,
     que monta `BlockRenderer` a escala— y no la silueta de barras que había
     acá. Dos motivos para unificar: la silueta se leía como esqueleto de carga
     (mismo material que `.cq-skeleton`), y era un segundo mapa de siluetas que
     había que ampliar a mano con cada tipo de bloque nuevo.

     Llega como `ReactNode` y no se construye acá porque `BlockRenderer` es un
     server component y este selector es de cliente: importarlo arrastraría los
     once renderers de bloque al bundle del navegador. */
  thumb?: ReactNode;
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
            className="cq-tcard cq-enter text-left"
            style={{ "--cq-i": Math.min(index, 8) } as React.CSSProperties}
          >
            {template.thumb}
            {/* El cuerpo lleva su propio relleno: la lámina va al ras del borde
                de la tarjeta —es una hoja apoyada, no una imagen con marco— así
                que el respiro tiene que vivir acá abajo y no en la tarjeta. */}
            <div className="cq-tcard-body">
              <p className="cq-title truncate" title={template.name}>
                {template.name}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-1.5">
                <Ident>
                  {template.blocks.length} {template.blocks.length === 1 ? "bloque" : "bloques"}
                </Ident>
                <span aria-hidden="true" className="cq-meta">
                  ·
                </span>
                <span className="cq-meta">
                  {template.origin === "saved" && template.authorName
                    ? template.authorName
                    : "Del sistema"}
                </span>
              </p>
            </div>
          </button>
        ))}
      </div>

      <button type="button" onClick={onSkip} className="cq-link cq-body mt-4 pb-4">
        Empezar en blanco
      </button>
    </section>
  );
}
