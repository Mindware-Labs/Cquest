"use client";

import type { Block } from "@/lib/blocks";
import { TYPE_LABEL } from "./blockFactory";
import { canLiveInColumn, locateBlock } from "./blockTree";

/* "Mover a…" — el destino de un bloque, como lista desplegable.

   Reemplaza a nada: hasta ahora mover un bloque entre el cuerpo y una columna
   era imposible por cualquier vía, y reordenar sólo se podía arrastrando o con
   ↑↓ dentro del mismo nivel.

   Por qué un <select> nativo y no arrastrar-y-soltar entre columnas:

   1. El arrastre HTML5 no existe en táctil. En una tablet, la función entera
      quedaba sin ninguna alternativa.
   2. Con teclado tampoco hay arrastre. Un <select> se abre con la barra
      espaciadora y se recorre con flechas, sin nada que programar.
   3. En un teléfono el nativo abre la rueda del sistema, que es más grande y
      más precisa que cualquier menú propio.

   El arrastre se queda para reordenar dentro del cuerpo, donde funciona bien y
   es rápido con mouse. Esto cubre lo que aquello no puede. */

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

  /* Sólo los bloques de columnas del NIVEL RAÍZ son destinos. El árbol tiene
     dos niveles exactos, así que no hay columnas dentro de columnas. */
  const columnsBlocks = blocks.filter((candidate) => candidate.type === "columns");
  const admitted = canLiveInColumn(block);

  /* Sin bloques de columnas —o con un tipo que no entra en una— no hay a dónde
     mover: el control no se dibuja en vez de dibujarse con una sola opción,
     que es un control que no hace nada. */
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
              {/* El número de orden y no el id: el id es un UUID y no le dice
                  nada a nadie. Si hay tres bloques de columnas en el artículo,
                  "Columnas 2" es lo que permite distinguirlos. */}
              {TYPE_LABEL.columns} {blockIndex + 1} · Columna {columnIndex + 1}
            </option>
          ));
        })}
      </select>
    </div>
  );
}
