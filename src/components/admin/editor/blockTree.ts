import type { Block, ColumnSimpleBlock } from "@/lib/blocks";

/* El contenido dejó de ser una lista plana en cuanto entró el bloque de
   columnas: ahora es un árbol de dos niveles exactos (un bloque de columnas
   contiene bloques simples, y nada más). Estas funciones son la única forma
   en que el editor lo toca, para que la selección por id funcione igual en
   ambos niveles y no haya dos maneras de mover un bloque. */

export function findBlock(blocks: readonly Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.type === "columns") {
      for (const column of block.columns) {
        const match = column.find((child) => child.id === id);
        if (match) return match;
      }
    }
  }
  return null;
}

export function updateBlock(blocks: readonly Block[], next: Block): Block[] {
  return blocks.map((block) => {
    if (block.id === next.id) return next;
    if (block.type !== "columns") return block;

    const columns = block.columns.map((column) =>
      column.map((child) => (child.id === next.id ? (next as ColumnSimpleBlock) : child)),
    );
    return { ...block, columns };
  });
}

export function removeBlock(blocks: readonly Block[], id: string): Block[] {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) => {
      if (block.type !== "columns") return block;
      return {
        ...block,
        columns: block.columns.map((column) => column.filter((child) => child.id !== id)),
      };
    });
}

/** Inserta en el nivel raíz, en una posición concreta. */
export function insertBlock(blocks: readonly Block[], block: Block, at: number): Block[] {
  const next = [...blocks];
  next.splice(Math.max(0, Math.min(at, next.length)), 0, block);
  return next;
}

/** Mueve un bloque de raíz de una posición a otra (arrastre y botones). */
export function moveBlock(blocks: readonly Block[], from: number, to: number): Block[] {
  if (from === to || from < 0 || from >= blocks.length) return [...blocks];
  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, moved);
  return next;
}

/** Agrega un bloque simple al final de una columna. */
export function appendToColumn(
  blocks: readonly Block[],
  columnsBlockId: string,
  columnIndex: number,
  child: ColumnSimpleBlock,
): Block[] {
  return blocks.map((block) => {
    if (block.id !== columnsBlockId || block.type !== "columns") return block;
    const columns = block.columns.map((column, index) =>
      index === columnIndex ? [...column, child] : column,
    );
    return { ...block, columns };
  });
}

/** Mueve un bloque simple dentro de su columna. */
export function moveWithinColumn(
  blocks: readonly Block[],
  columnsBlockId: string,
  columnIndex: number,
  from: number,
  to: number,
): Block[] {
  return blocks.map((block) => {
    if (block.id !== columnsBlockId || block.type !== "columns") return block;
    const columns = block.columns.map((column, index) => {
      if (index !== columnIndex) return column;
      if (to < 0 || to >= column.length) return column;
      const next = [...column];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    return { ...block, columns };
  });
}

/* Cambiar la cantidad de columnas no puede perder contenido en silencio: al
   pasar de 3 a 2, lo que había en la tercera se anexa a la última que queda. */
export function setColumnCount(
  blocks: readonly Block[],
  columnsBlockId: string,
  count: 2 | 3,
): Block[] {
  return blocks.map((block) => {
    if (block.id !== columnsBlockId || block.type !== "columns") return block;

    const current = block.columns;
    if (count === current.length) return { ...block, columnCount: count };

    if (count > current.length) {
      const columns = [...current, ...Array.from({ length: count - current.length }, () => [])];
      return { ...block, columnCount: count, columns };
    }

    const kept = current.slice(0, count);
    const dropped = current.slice(count).flat();
    const columns = kept.map((column, index) =>
      index === count - 1 ? [...column, ...dropped] : column,
    );
    return { ...block, columnCount: count, columns };
  });
}
