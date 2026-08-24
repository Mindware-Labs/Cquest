"use client";

import type { Block } from "@/lib/blocks";
import { TYPE_LABEL } from "./blockFactory";
import { canLiveInColumn, locateBlock } from "./blockTree";

// <select> nativo (no arrastrar-y-soltar) para mover un bloque entre cuerpo y columna: el arrastre HTML5 no existe en táctil ni con teclado.

export type MoveTarget =
  | { scope: "root" }
  | { scope: "column"; columnsBlockId: string; columnIndex: number };

const ROOT_VALUE = "root";

export default function MoveBlockControl({
  block,
  blocks,
  onMove,
}: {
  block: Block;
  blocks: Block[];
  onMove: (target: MoveTarget) => void;
}) {
  const location = locateBlock(blocks, block.id);
  if (!location) return null;

  // Sólo los bloques de columnas del NIVEL RAÍZ son destinos: el árbol tiene dos niveles exactos, no hay columnas dentro de columnas.
  const columnsBlocks = blocks.filter((candidate) => candidate.type === "columns");
  const admitted = canLiveInColumn(block);

  // Sin destinos válidos el control no se dibuja, en vez de dibujarse con una sola opción que no hace nada.
  if (!admitted || columnsBlocks.length === 0) return null;

  const current =
    location.scope === "root"
      ? ROOT_VALUE
      : `${location.columnsBlockId}:${location.columnIndex}`;

  return (
    <div>
      <label htmlFor={`move-${block.id}`} className="cq-label">
        Mover a
      </label>
      <select
        id={`move-${block.id}`}
        className="cq-select mt-1.5"
        value={current}
        onChange={(event) => {
          const value = event.target.value;
          if (value === ROOT_VALUE) {
            onMove({ scope: "root" });
            return;
          }
          const [columnsBlockId, columnIndex] = value.split(":");
          onMove({ scope: "column", columnsBlockId, columnIndex: Number(columnIndex) });
        }}
      >
        <option value={ROOT_VALUE}>Cuerpo del artículo</option>
        {columnsBlocks.map((columnsBlock, blockIndex) => {
          if (columnsBlock.type !== "columns") return null;
          return columnsBlock.columns.map((_, columnIndex) => (
            <option
              key={`${columnsBlock.id}:${columnIndex}`}
              value={`${columnsBlock.id}:${columnIndex}`}
            >
              {/* Número de orden, no el id (UUID ilegible): así se distinguen "Columnas 2" de "Columnas 3" en el mismo artículo. */}
              {TYPE_LABEL.columns} {blockIndex + 1} · Columna {columnIndex + 1}
            </option>
          ));
        })}
      </select>
    </div>
  );
}
