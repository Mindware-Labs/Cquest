"use client";

import type { Block } from "@/lib/blocks";
import { BLOCK_TYPES, TYPE_LABEL } from "./blockFactory";

// Dos claves de dataTransfer distintas (crear vs. mover): si compartieran clave, soltar en el lienzo no podría distinguirlas.
export const NEW_BLOCK_MIME = "text/x-cq-new-block";
export const MOVE_BLOCK_MIME = "text/x-cq-move-block";

export default function BlockPalette({ onAdd }: { onAdd: (type: Block["type"]) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--p-line)] pb-3">
      <span className="cq-label pr-1">Bloques</span>
      {BLOCK_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(NEW_BLOCK_MIME, type);
            event.dataTransfer.effectAllowed = "copy";
          }}
          // Click además de arrastre (AD-7 + RNF-5): con teclado no se arrastra, agregar al final + reordenar con ↑↓ tiene que alcanzar.
          onClick={() => onAdd(type)}
          className="cq-btn cursor-grab active:cursor-grabbing"
          data-variant="outline"
          data-size="sm"
        >
          + {TYPE_LABEL[type]}
        </button>
      ))}
    </div>
  );
}
