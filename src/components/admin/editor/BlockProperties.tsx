"use client";

import type { Block, Spacing } from "@/lib/blocks";
import ImageUploadField from "../ImageUploadField";
import { GalleryEditor, StringListEditor, TableEditor } from "./arrayFields";
import { OptionGroup, SPACING_OPTIONS, TextAreaField, TextField } from "./fields";
import { TYPE_LABEL } from "./blockFactory";

/* Panel de propiedades (AD-11): contenido y personalización del bloque
   seleccionado. Los dos juntos y no en pestañas separadas — terminar un bloque
   no debería obligar a saltar entre dos lugares.

   Todo control de color y tipografía es un OptionGroup sobre un conjunto
   cerrado: eso es PERS-2 y PERS-3 hechos estructura, no una recomendación. */

const ALIGN_OPTIONS = [
  { value: "left", label: "Izquierda" },
  { value: "center", label: "Centro" },
] as const;

const ACCENT_OPTIONS = [
  { value: "neutral", label: "Ninguno" },
  { value: "celeste", label: "Celeste" },
  { value: "petroleo", label: "Petróleo" },
  { value: "verde", label: "Verde" },
] as const;

export default function BlockProperties({
  block,
  onChange,
  onColumnCountChange,
}: {
  block: Block;
  onChange: (block: Block) => void;
  onColumnCountChange?: (count: 2 | 3) => void;
}) {
  function patch(changes: Partial<Block>) {
    onChange({ ...block, ...changes } as Block);
  }

  return (
    <div className="space-y-5">
      <p className="cq-label text-[var(--p-accent)]">
        {TYPE_LABEL[block.type]}
      </p>

      {block.type === "heading" && (
        <>
          <TextField label="Texto" value={block.text} maxLength={160} onChange={(text) => patch({ text })} />
          <OptionGroup
            label="Nivel"
            value={block.level}
            options={[
              { value: "h2", label: "H2" },
              { value: "h3", label: "H3" },
              { value: "h4", label: "H4" },
            ]}
            onChange={(level) => patch({ level })}
          />
          <OptionGroup
            label="Peso"
            value={block.weight}
            options={[
              { value: "regular", label: "Regular" },
              { value: "medium", label: "Medio" },
            ]}
            onChange={(weight) => patch({ weight })}
          />
          <OptionGroup label="Alineación" value={block.align} options={ALIGN_OPTIONS} onChange={(align) => patch({ align })} />
        </>
      )}

      {block.type === "paragraph" && (
        <>
          <TextAreaField label="Texto" value={block.text} rows={6} onChange={(text) => patch({ text })} />
          <OptionGroup
            label="Variante"
            value={block.variant}
            options={[
              { value: "body", label: "Cuerpo" },
              { value: "lead", label: "Destacado" },
              { value: "muted", label: "Atenuado" },
            ]}
            onChange={(variant) => patch({ variant })}
          />
          <OptionGroup label="Alineación" value={block.align} options={ALIGN_OPTIONS} onChange={(align) => patch({ align })} />
        </>
      )}

      {block.type === "image" && (
        <>
          {/* Las dimensiones se guardan con la imagen: son lo que permite que
              next/image reserve el espacio exacto en el artículo publicado. */}
          <ImageUploadField
            label="Imagen"
            value={block.src}
            onChange={({ url, width, height }) => patch({ src: url, width, height })}
            required
          />
          <div>
            <TextField
              label="Texto alternativo"
              value={block.alt}
              maxLength={200}
              placeholder="Qué muestra la imagen"
              onChange={(alt) => patch({ alt })}
            />
            {block.src && block.alt.length === 0 && (
              <p className="cq-meta mt-1 text-[var(--p-danger)]">
                Obligatorio: sin esto el artículo no se puede guardar.
              </p>
            )}
          </div>
          <TextField
            label="Leyenda (opcional)"
            value={block.caption ?? ""}
            maxLength={200}
            onChange={(caption) => patch({ caption: caption || undefined })}
          />
          <OptionGroup
            label="Ancho"
            value={block.display}
            options={[
              { value: "inset", label: "Recuadro" },
              { value: "full", label: "Completo" },
            ]}
            onChange={(display) => patch({ display })}
          />
          <OptionGroup
            label="Acento"
            value={block.accent ?? "neutral"}
            options={ACCENT_OPTIONS}
            onChange={(accent) => patch({ accent: accent === "neutral" ? undefined : accent })}
          />
        </>
      )}

      {block.type === "gallery" && (
        <>
          <GalleryEditor images={block.images} onChange={(images) => patch({ images })} />
          <OptionGroup
            label="Diseño"
            value={block.layout}
            options={[
              { value: "grid-2", label: "2 columnas" },
              { value: "grid-3", label: "3 columnas" },
            ]}
            onChange={(layout) => patch({ layout })}
          />
        </>
      )}

      {block.type === "video" && (
        <>
          <OptionGroup
            label="Proveedor"
            value={block.provider}
            options={[
              { value: "youtube", label: "YouTube" },
              { value: "vimeo", label: "Vimeo" },
            ]}
            onChange={(provider) => patch({ provider })}
          />
          {/* Se pide el id, no la URL ni el embed: pegar código externo sería un
              agujero de inyección, y el schema ya valida el formato del id. */}
          <TextField
            label="ID del video"
            value={block.videoId}
            placeholder="dQw4w9WgXcQ"
            onChange={(videoId) => patch({ videoId })}
          />
          <p className="cq-meta">
            Solo el identificador, no la URL completa. En YouTube es lo que sigue
            a <code>v=</code>; en Vimeo, el número final.
          </p>
          <TextField
            label="Leyenda (opcional)"
            value={block.caption ?? ""}
            maxLength={200}
            onChange={(caption) => patch({ caption: caption || undefined })}
          />
        </>
      )}

      {block.type === "quote" && (
        <>
          <TextAreaField label="Cita" value={block.text} rows={4} onChange={(text) => patch({ text })} />
          <TextField
            label="Nombre (opcional)"
            value={block.attributionName ?? ""}
            maxLength={120}
            onChange={(value) => patch({ attributionName: value || undefined })}
          />
          <TextField
            label="Cargo (opcional)"
            value={block.attributionRole ?? ""}
            maxLength={120}
            onChange={(value) => patch({ attributionRole: value || undefined })}
          />
          <OptionGroup
            label="Estilo"
            value={block.style}
            options={[
              { value: "bordered", label: "Con borde" },
              { value: "large", label: "Grande" },
            ]}
            onChange={(style) => patch({ style })}
          />
        </>
      )}

      {block.type === "list" && (
        <>
          <StringListEditor
            label="Elementos"
            items={block.items}
            max={30}
            onChange={(items) => patch({ items })}
          />
          <OptionGroup
            label="Tipo"
            value={block.ordered ? "ordered" : "unordered"}
            options={[
              { value: "unordered", label: "Viñetas" },
              { value: "ordered", label: "Numerada" },
            ]}
            onChange={(value) => patch({ ordered: value === "ordered" })}
          />
          {!block.ordered && (
            <OptionGroup
              label="Marcador"
              value={block.markerStyle}
              options={[
                { value: "bullet", label: "Punto" },
                { value: "check", label: "Check" },
              ]}
              onChange={(markerStyle) => patch({ markerStyle })}
            />
          )}
        </>
      )}

      {block.type === "table" && (
        <>
          <TableEditor
            headers={block.headers}
            rows={block.rows}
            onChange={({ headers, rows }) => patch({ headers, rows })}
          />
          <OptionGroup
            label="Rayado de filas"
            value={block.striped ? "on" : "off"}
            options={[
              { value: "on", label: "Sí" },
              { value: "off", label: "No" },
            ]}
            onChange={(value) => patch({ striped: value === "on" })}
          />
        </>
      )}

      {block.type === "cta" && (
        <>
          <TextField label="Título" value={block.heading} onChange={(heading) => patch({ heading })} />
          <TextAreaField
            label="Texto (opcional)"
            value={block.body ?? ""}
            rows={3}
            onChange={(body) => patch({ body: body || undefined })}
          />
          <TextField
            label="Texto del botón"
            value={block.buttonLabel}
            onChange={(buttonLabel) => patch({ buttonLabel })}
          />
          <OptionGroup
            label="Destino"
            value={block.hrefKind}
            options={[
              { value: "internal", label: "Interno" },
              { value: "external", label: "Externo" },
            ]}
            onChange={(hrefKind) => patch({ hrefKind })}
          />
          <TextField
            label={block.hrefKind === "internal" ? "Ruta interna" : "URL externa"}
            value={block.href}
            placeholder={block.hrefKind === "internal" ? "/quote" : "https://…"}
            onChange={(href) => patch({ href })}
          />
          {block.hrefKind === "internal" && (
            <p className="cq-meta">
              Sin el prefijo de idioma: se agrega solo según el idioma de quien
              visita la página.
            </p>
          )}
          <OptionGroup
            label="Estilo del botón"
            value={block.style}
            options={[
              { value: "primary", label: "Verde" },
              { value: "secondary", label: "Petróleo" },
            ]}
            onChange={(style) => patch({ style })}
          />
        </>
      )}

      {block.type === "columns" && (
        <>
          <OptionGroup
            label="Cantidad de columnas"
            value={String(block.columnCount) as "2" | "3"}
            options={[
              { value: "2", label: "2" },
              { value: "3", label: "3" },
            ]}
            onChange={(value) => onColumnCountChange?.(Number(value) as 2 | 3)}
          />
          <p className="cq-meta">
            Los bloques de cada columna se agregan y se ordenan desde el lienzo.
            Al pasar de 3 a 2 columnas, el contenido de la tercera se mueve a la
            última — nunca se pierde.
          </p>
        </>
      )}

      {block.type === "divider" && (
        <OptionGroup
          label="Estilo"
          value={block.style}
          options={[
            { value: "line", label: "Línea" },
            { value: "space", label: "Solo espacio" },
          ]}
          onChange={(style) => patch({ style })}
        />
      )}

      {/* Espaciado: lo tiene todo bloque, sin importar el tipo (PERS-1). */}
      <div className="space-y-4 border-t border-[var(--p-line)] pt-4">
        <OptionGroup
          label="Espacio antes"
          value={block.spacingTop}
          options={SPACING_OPTIONS}
          onChange={(spacingTop: Spacing) => patch({ spacingTop })}
        />
        <OptionGroup
          label="Espacio después"
          value={block.spacingBottom}
          options={SPACING_OPTIONS}
          onChange={(spacingBottom: Spacing) => patch({ spacingBottom })}
        />
      </div>
    </div>
  );
}
