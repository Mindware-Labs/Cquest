"use client";

import { useState } from "react";
import type { Block, ColumnSimpleBlock } from "@/lib/blocks";
import { IconArrowDown, IconArrowUp, IconClose } from "@/components/admin/ui/icons";
import { COLUMN_TYPES, TYPE_LABEL, type ColumnType } from "./blockFactory";
import { MOVE_BLOCK_MIME, NEW_BLOCK_MIME } from "./BlockPalette";

/* Lienzo del editor (AD-8). Hace tres cosas que el plan pide por separado:
   reordenar arrastrando (AD-9), insertar desde la paleta en una posición
   concreta (AD-10), y todo eso con equivalente por teclado (RNF-5) — los
   botones ↑↓ no son un extra, son la ruta accesible del mismo gesto. */

const ICON_BUTTON = "cq-icon-btn";

/* Una imagen subida sin describir bloquea el guardado (RNF-5, comprobado en
   blockArraySchema). Marcarlo en el lienzo evita que el admin lo descubra
   recién al apretar "Publicar", con el error a diez bloques de distancia. */
function missingAltText(block: Block): boolean {
  if (block.type === "image") return Boolean(block.src) && block.alt.length === 0;
  if (block.type === "gallery") return block.images.some((image) => image.src && !image.alt);
  if (block.type === "columns") {
    return block.columns.some((column) => column.some(missingAltText));
  }
  return false;
}

function summarize(block: Block): string {
  switch (block.type) {
    case "heading":
    case "paragraph":
    case "quote":
      return block.text || "(vacío)";
    case "image":
      return block.alt || (block.src ? "(sin texto alternativo)" : "(sin imagen)");
    case "gallery":
      return `${block.images.length} ${block.images.length === 1 ? "imagen" : "imágenes"}`;
    case "video":
      return block.videoId ? `${block.provider}: ${block.videoId}` : "(sin video)";
    case "list":
      return block.items.filter(Boolean).join(" · ") || "(vacía)";
    case "table":
      return `${block.headers.length} columnas × ${block.rows.length} filas`;
    case "cta":
      return block.heading || "(sin título)";
    case "columns":
      return `${block.columnCount} columnas`;
    case "divider":
      return block.style === "line" ? "Línea" : "Espacio";
  }
}

export default function BlockCanvas({
  blocks,
  selectedId,
  onSelect,
  onMove,
  onRemove,
  onInsertNew,
  onAddToColumn,
  onMoveInColumn,
  onAnnounce,
}: {
  blocks: Block[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
  onInsertNew: (type: Block["type"], at: number) => void;
  onAddToColumn: (columnsBlockId: string, columnIndex: number, type: ColumnType) => void;
  onMoveInColumn: (columnsBlockId: string, columnIndex: number, from: number, to: number) => void;
  onAnnounce: (message: string) => void;
}) {
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  function handleDragOver(event: React.DragEvent, index: number) {
    /* Sin preventDefault el navegador no considera el elemento una zona válida
       y nunca dispara el drop. */
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const isTopHalf = event.clientY < rect.top + rect.height / 2;
    setDropIndex(isTopHalf ? index : index + 1);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    const target = dropIndex;
    setDropIndex(null);
    if (target === null) return;

    const newType = event.dataTransfer.getData(NEW_BLOCK_MIME);
    if (newType) {
      onInsertNew(newType as Block["type"], target);
      onAnnounce(`${TYPE_LABEL[newType as Block["type"]]} insertado en la posición ${target + 1}.`);
      return;
    }

    const movedId = event.dataTransfer.getData(MOVE_BLOCK_MIME);
    if (!movedId) return;
    const from = blocks.findIndex((block) => block.id === movedId);
    if (from === -1) return;

    /* Al mover hacia abajo, quitar el bloque de su posición corre el índice de
       destino un lugar: sin este ajuste, arrastrar un bloque una posición hacia
       abajo lo deja donde estaba. */
    const to = target > from ? target - 1 : target;
    onMove(from, to);
    onAnnounce(`Bloque movido a la posición ${to + 1} de ${blocks.length}.`);
  }

  if (blocks.length === 0) {
    return (
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDropIndex(0);
        }}
        onDrop={handleDrop}
        data-over={dropIndex === 0 ? "true" : undefined}
        className="cq-ghost cq-body mt-4 py-12 text-center data-[over=true]:border-[var(--p-accent)] data-[over=true]:bg-[var(--p-accent-tint)] data-[over=true]:text-[var(--p-accent)]"
      >
        Arrastrá un bloque acá, o hacé clic en uno de la paleta.
      </div>
    );
  }

  return (
    <ul
      className="mt-4"
      onDragLeave={(event) => {
        /* dragleave burbujea desde cada hijo: sin esta comprobación, pasar el
           cursor de un bloque al siguiente borraría el indicador y volvería a
           pintarlo en cada movimiento. Solo cuenta salir de la lista entera. */
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDropIndex(null);
        }
      }}
      onDrop={handleDrop}
    >
      {blocks.map((block, index) => {
        const isSelected = block.id === selectedId;

        return (
          <li key={block.id} onDragOver={(event) => handleDragOver(event, index)}>
            {/* Indicador de inserción: una línea, no un hueco que desplace todo
                el lienzo mientras se arrastra. */}
            <div
              aria-hidden
              className={`h-0.5 rounded-full transition-colors ${dropIndex === index ? "bg-[var(--p-accent)]" : "bg-transparent"}`}
            />

            <div
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(MOVE_BLOCK_MIME, block.id);
                event.dataTransfer.effectAllowed = "move";
              }}
              className={`cq-card my-1.5 cursor-grab active:cursor-grabbing ${
                isSelected
                  ? "border-[var(--p-accent)] bg-[var(--p-accent-tint)]"
                  : "hover:border-[var(--p-line-strong)]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(block.id)}
                  aria-pressed={isSelected}
                  className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
                >
                  <span className="cq-label text-[var(--p-accent)]">{TYPE_LABEL[block.type]}</span>
                  <span className="cq-body mt-0.5 block truncate text-[var(--p-ink)]">
                    {summarize(block)}
                  </span>
                  {/* El aviso de accesibilidad faltante va en la propia fila del
                      bloque y no en un resumen al final: quien puede arreglarlo
                      es quien está mirando ese bloque, ahora. */}
                  {missingAltText(block) && (
                    <span className="cq-badge mt-1" data-tone="hidden" style={{ color: "var(--p-danger)" }}>
                      Falta texto alternativo
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Subir ${TYPE_LABEL[block.type]}`}
                    disabled={index === 0}
                    onClick={() => {
                      onMove(index, index - 1);
                      onAnnounce(`Bloque movido a la posición ${index} de ${blocks.length}.`);
                    }}
                    className={ICON_BUTTON}
                  >
                    <IconArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Bajar ${TYPE_LABEL[block.type]}`}
                    disabled={index === blocks.length - 1}
                    onClick={() => {
                      onMove(index, index + 1);
                      onAnnounce(`Bloque movido a la posición ${index + 2} de ${blocks.length}.`);
                    }}
                    className={ICON_BUTTON}
                  >
                    <IconArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar ${TYPE_LABEL[block.type]}`}
                    onClick={() => {
                      onRemove(block.id);
                      onAnnounce(`${TYPE_LABEL[block.type]} eliminado.`);
                    }}
                    className={ICON_BUTTON}
                    data-tone="danger"
                  >
                    <IconClose size={15} />
                  </button>
                </div>
              </div>

              {block.type === "columns" && (
                <ColumnsEditor
                  block={block}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onRemove={onRemove}
                  onAddToColumn={onAddToColumn}
                  onMoveInColumn={onMoveInColumn}
                />
              )}
            </div>
          </li>
        );
      })}

      {/* Zona final: sin esto no hay forma de soltar un bloque DESPUÉS del
          último, solo antes. */}
      <li
        onDragOver={(event) => {
          event.preventDefault();
          setDropIndex(blocks.length);
        }}
        className="pt-1"
      >
        <div
          aria-hidden
          className={`h-0.5 rounded-full transition-colors ${dropIndex === blocks.length ? "bg-[var(--p-accent)]" : "bg-transparent"}`}
        />
      </li>
    </ul>
  );
}

function ColumnsEditor({
  block,
  selectedId,
  onSelect,
  onRemove,
  onAddToColumn,
  onMoveInColumn,
}: {
  block: Extract<Block, { type: "columns" }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddToColumn: (columnsBlockId: string, columnIndex: number, type: ColumnType) => void;
  onMoveInColumn: (columnsBlockId: string, columnIndex: number, from: number, to: number) => void;
}) {
  return (
    <div
      className={`mt-3 grid gap-3 border-t border-[var(--p-line)] pt-3 ${
        block.columnCount === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      }`}
    >
      {block.columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="rounded-[var(--p-radius-sm)] bg-[var(--p-surface-sunken)] p-2.5"
        >
          <p className="cq-label">Columna {columnIndex + 1}</p>

          <ul className="mt-2 space-y-1.5">
            {column.map((child: ColumnSimpleBlock, childIndex) => (
              <li
                key={child.id}
                className={`flex items-center gap-1 rounded-[var(--p-radius-sm)] border px-2 py-1 ${
                  child.id === selectedId
                    ? "border-[var(--p-accent)] bg-[var(--p-accent-tint)]"
                    : "border-[var(--p-line)] bg-[var(--p-surface)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(child.id)}
                  aria-pressed={child.id === selectedId}
                  className="cq-meta min-w-0 flex-1 truncate text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
                >
                  <span className="font-semibold text-[var(--p-accent)]">
                    {TYPE_LABEL[child.type]}
                  </span>{" "}
                  {summarize(child)}
                </button>
                <button
                  type="button"
                  aria-label={`Subir en columna ${columnIndex + 1}`}
                  disabled={childIndex === 0}
                  onClick={() => onMoveInColumn(block.id, columnIndex, childIndex, childIndex - 1)}
                  className={ICON_BUTTON}
                >
                  <IconArrowUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Bajar en columna ${columnIndex + 1}`}
                  disabled={childIndex === column.length - 1}
                  onClick={() => onMoveInColumn(block.id, columnIndex, childIndex, childIndex + 1)}
                  className={ICON_BUTTON}
                >
                  <IconArrowDown size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar de columna ${columnIndex + 1}`}
                  onClick={() => onRemove(child.id)}
                  className={ICON_BUTTON}
                >
                  <IconClose size={14} />
                </button>
              </li>
            ))}
          </ul>

          {/* Solo los 5 tipos que el schema admite dentro de una columna: la
              restricción se ve en la interfaz, no se descubre al guardar. */}
          <div className="mt-2 flex flex-wrap gap-1">
            {COLUMN_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onAddToColumn(block.id, columnIndex, type)}
                className="cq-btn"
                data-variant="ghost"
                data-size="sm"
              >
                + {TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
