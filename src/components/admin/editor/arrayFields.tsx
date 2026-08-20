"use client";

import ImageUploadField from "../ImageUploadField";
import { INPUT_CLASS } from "./fields";

/* Editores para los bloques que guardan listas: lista, tabla y galería. Van
   aparte de BlockProperties porque son los únicos controles con lógica propia
   (agregar, quitar, reordenar filas) y mezclarlos ahí volvía ese archivo
   imposible de leer. */

const SMALL_BUTTON =
  "rounded-md border border-border bg-white px-2.5 py-1 text-[0.75rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo disabled:cursor-not-allowed disabled:opacity-30";

export function StringListEditor({
  label,
  items,
  onChange,
  max,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
}) {
  return (
    <div>
      <span className="text-[0.78rem] font-semibold text-foreground">{label}</span>
      <ul className="mt-1.5 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <input
              type="text"
              value={item}
              aria-label={`${label} ${index + 1}`}
              onChange={(event) => {
                const next = [...items];
                next[index] = event.target.value;
                onChange(next);
              }}
              className={`${INPUT_CLASS} mt-0`}
            />
            <button
              type="button"
              aria-label={`Quitar elemento ${index + 1}`}
              disabled={items.length === 1}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className={SMALL_BUTTON}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={items.length >= max}
        onClick={() => onChange([...items, ""])}
        className={`${SMALL_BUTTON} mt-2`}
      >
        + Agregar
      </button>
    </div>
  );
}

export function TableEditor({
  headers,
  rows,
  onChange,
}: {
  headers: string[];
  rows: string[][];
  onChange: (value: { headers: string[]; rows: string[][] }) => void;
}) {
  /* Agregar o quitar una columna toca la cabecera Y todas las filas a la vez.
     Si se desincronizan, el schema rechaza el guardado — por eso nunca se
     modifica una sola de las dos estructuras. */
  function addColumn() {
    onChange({ headers: [...headers, ""], rows: rows.map((row) => [...row, ""]) });
  }

  function removeColumn(index: number) {
    onChange({
      headers: headers.filter((_, i) => i !== index),
      rows: rows.map((row) => row.filter((_, i) => i !== index)),
    });
  }

  return (
    <div>
      <span className="text-[0.78rem] font-semibold text-foreground">Tabla</span>

      <div className="mt-1.5 space-y-2">
        {headers.map((header, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              type="text"
              value={header}
              placeholder={`Encabezado ${index + 1}`}
              aria-label={`Encabezado ${index + 1}`}
              onChange={(event) => {
                const next = [...headers];
                next[index] = event.target.value;
                onChange({ headers: next, rows });
              }}
              className={`${INPUT_CLASS} mt-0`}
            />
            <button
              type="button"
              aria-label={`Quitar columna ${index + 1}`}
              disabled={headers.length === 1}
              onClick={() => removeColumn(index)}
              className={SMALL_BUTTON}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={headers.length >= 8}
        onClick={addColumn}
        className={`${SMALL_BUTTON} mt-2`}
      >
        + Columna
      </button>

      <div className="mt-4 space-y-3">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="rounded-md border border-border p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                Fila {rowIndex + 1}
              </span>
              <button
                type="button"
                aria-label={`Quitar fila ${rowIndex + 1}`}
                disabled={rows.length === 1}
                onClick={() => onChange({ headers, rows: rows.filter((_, i) => i !== rowIndex) })}
                className={SMALL_BUTTON}
              >
                ✕
              </button>
            </div>
            <div className="mt-2 space-y-1.5">
              {row.map((cell, cellIndex) => (
                <input
                  key={cellIndex}
                  type="text"
                  value={cell}
                  placeholder={headers[cellIndex] || `Columna ${cellIndex + 1}`}
                  aria-label={`Fila ${rowIndex + 1}, ${headers[cellIndex] || `columna ${cellIndex + 1}`}`}
                  onChange={(event) => {
                    const next = rows.map((r) => [...r]);
                    next[rowIndex][cellIndex] = event.target.value;
                    onChange({ headers, rows: next });
                  }}
                  className={`${INPUT_CLASS} mt-0`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={rows.length >= 50}
        onClick={() => onChange({ headers, rows: [...rows, headers.map(() => "")] })}
        className={`${SMALL_BUTTON} mt-2`}
      >
        + Fila
      </button>
    </div>
  );
}

export type GalleryImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
};

export function GalleryEditor({
  images,
  onChange,
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}) {
  function patch(index: number, changes: Partial<GalleryImage>) {
    onChange(images.map((image, i) => (i === index ? { ...image, ...changes } : image)));
  }

  return (
    <div>
      <span className="text-[0.78rem] font-semibold text-foreground">Imágenes</span>

      <div className="mt-1.5 space-y-4">
        {images.map((image, index) => (
          <div key={index} className="space-y-2.5 rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                Imagen {index + 1}
              </span>
              <button
                type="button"
                aria-label={`Quitar imagen ${index + 1}`}
                disabled={images.length === 1}
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className={SMALL_BUTTON}
              >
                ✕
              </button>
            </div>

            <ImageUploadField
              label="Archivo"
              value={image.src}
              onChange={({ url, width, height }) => patch(index, { src: url, width, height })}
              required
            />
            <input
              type="text"
              value={image.alt}
              maxLength={200}
              placeholder="Texto alternativo"
              aria-label={`Texto alternativo de la imagen ${index + 1}`}
              onChange={(event) => patch(index, { alt: event.target.value })}
              className={`${INPUT_CLASS} mt-0`}
            />
            <input
              type="text"
              value={image.caption ?? ""}
              maxLength={200}
              placeholder="Leyenda (opcional)"
              aria-label={`Leyenda de la imagen ${index + 1}`}
              onChange={(event) => patch(index, { caption: event.target.value || undefined })}
              className={`${INPUT_CLASS} mt-0`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={images.length >= 12}
        onClick={() => onChange([...images, { src: "", alt: "" }])}
        className={`${SMALL_BUTTON} mt-2`}
      >
        + Imagen
      </button>
    </div>
  );
}
