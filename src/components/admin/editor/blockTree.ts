import type { Block, ColumnSimpleBlock } from "@/lib/blocks";

// El contenido es un árbol de dos niveles exactos desde que existe el bloque de columnas; estas funciones son la única vía de acceso, para no tener dos formas de mover un bloque.

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

// Mover entre niveles (root <-> columna): sacar e insertar en una sola pasada, sin estado intermedio donde el bloque no exista o exista dos veces.

export type BlockLocation =
  | { scope: "root"; index: number }
  | { scope: "column"; columnsBlockId: string; columnIndex: number; index: number };

/** Dónde vive un bloque hoy. Devuelve null si no está. */
export function locateBlock(blocks: readonly Block[], id: string): BlockLocation | null {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.id === id) return { scope: "root", index };

    if (block.type === "columns") {
      for (let columnIndex = 0; columnIndex < block.columns.length; columnIndex += 1) {
        const childIndex = block.columns[columnIndex].findIndex((child) => child.id === id);
        if (childIndex !== -1) {
          return { scope: "column", columnsBlockId: block.id, columnIndex, index: childIndex };
        }
      }
    }
  }
  return null;
}

// Sólo cinco de los once tipos entran en columna (lo decide columnSimpleBlockSchema); se pregunta acá para no ofrecer un destino que Zod rechazaría al guardar.
export function canLiveInColumn(block: Block): block is ColumnSimpleBlock {
  return (
    block.type === "heading" ||
    block.type === "paragraph" ||
    block.type === "image" ||
    block.type === "list" ||
    block.type === "cta"
  );
}

/** Mete un bloque del cuerpo —o de otra columna— dentro de una columna. */
export function moveIntoColumn(
  blocks: readonly Block[],
  id: string,
  columnsBlockId: string,
  columnIndex: number,
): Block[] {
  const block = findBlock(blocks, id);
  if (!block || !canLiveInColumn(block)) return [...blocks];
  // Un bloque de columnas no puede meterse dentro de sí mismo (rompería el árbol de dos niveles); canLiveInColumn ya lo impide por tipo, esto lo hace explícito.
  if (id === columnsBlockId) return [...blocks];

  const without = removeBlock(blocks, id);

  return without.map((candidate) => {
    if (candidate.id !== columnsBlockId || candidate.type !== "columns") return candidate;
    const columns = candidate.columns.map((column, index) =>
      index === columnIndex ? [...column, block] : column,
    );
    return { ...candidate, columns };
  });
}

/** Saca un bloque de su columna y lo deja en el cuerpo, justo debajo del bloque de columnas del que salió. */
export function moveOutOfColumn(blocks: readonly Block[], id: string): Block[] {
  const location = locateBlock(blocks, id);
  if (!location || location.scope !== "column") return [...blocks];

  const block = findBlock(blocks, id);
  if (!block) return [...blocks];

  const without = removeBlock(blocks, id);
  const anchor = without.findIndex((candidate) => candidate.id === location.columnsBlockId);

  return insertBlock(without, block, anchor === -1 ? without.length : anchor + 1);
}

/** Inserta un bloque nuevo en una columna, en una posición concreta. */
export function insertIntoColumn(
  blocks: readonly Block[],
  columnsBlockId: string,
  columnIndex: number,
  child: ColumnSimpleBlock,
  at: number,
): Block[] {
  return blocks.map((block) => {
    if (block.id !== columnsBlockId || block.type !== "columns") return block;
    const columns = block.columns.map((column, index) => {
      if (index !== columnIndex) return column;
      const next = [...column];
      next.splice(Math.max(0, Math.min(at, next.length)), 0, child);
      return next;
    });
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

// Al reducir columnas no se pierde contenido en silencio: lo que sobra se anexa a la última columna que queda.
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
