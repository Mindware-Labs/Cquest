"use client";

import type { Block } from "@/lib/blocks";
import { BLOCK_TYPES, TYPE_LABEL } from "./blockFactory";

/* Formato propio de dataTransfer. Uno para "crear un bloque nuevo de este
   tipo" y otro para "mover este bloque que ya existe": si compartieran clave,
   soltar en el lienzo no podría distinguir una cosa de la otra. */
export const NEW_BLOCK_MIME = "text/x-cq-new-block";
export const MOVE_BLOCK_MIME = "text/x-cq-move-block";

export default function BlockPalette({ onAdd }: { onAdd: (type: Block["type"]) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
      <span className="text-[0.78rem] font-semibold text-foreground">Bloques:</span>
      {BLOCK_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(NEW_BLOCK_MIME, type);
            event.dataTransfer.effectAllowed = "copy";
          }}
          /* Click además de arrastre (AD-7 + RNF-5): con teclado no se arrastra,
             y agregar al final y después reordenar con ↑↓ tiene que alcanzar
             para armar un artículo completo. */
          onClick={() => onAdd(type)}
          className="cursor-grab rounded-md border border-border bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo active:cursor-grabbing"
        >
          + {TYPE_LABEL[type]}
        </button>
      ))}
    </div>
  );
}
