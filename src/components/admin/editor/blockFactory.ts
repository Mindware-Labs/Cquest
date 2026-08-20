import type { Block, ColumnSimpleBlock } from "@/lib/blocks";

/* Los 11 tipos del catálogo (sección 2.3 del plan). El orden es el de la
   paleta: primero los que se usan en casi todo artículo, después los
   estructurales. */
export const BLOCK_TYPES = [
  "heading",
  "paragraph",
  "image",
  "list",
  "quote",
  "cta",
  "gallery",
  "video",
  "table",
  "columns",
  "divider",
] as const;

/* Los que una columna admite: mismo conjunto que columnSimpleBlockSchema en
   blocks.ts. Si divergen, Zod rechaza al guardar — por eso sale del mismo
   lugar conceptual y se verifica con el tipo de abajo. */
export const COLUMN_TYPES = ["heading", "paragraph", "image", "list", "cta"] as const;
export type ColumnType = (typeof COLUMN_TYPES)[number];

export const TYPE_LABEL: Record<Block["type"], string> = {
  heading: "Título",
  paragraph: "Párrafo",
  image: "Imagen",
  gallery: "Galería",
  video: "Video",
  quote: "Cita",
  list: "Lista",
  table: "Tabla",
  cta: "CTA",
  columns: "Columnas",
  divider: "Separador",
};

function newId(): string {
  return crypto.randomUUID();
}

/* Cada bloque nace con TODOS los campos que pide el schema, incluidos los que
   tienen default. Zod los completaría al validar, pero entonces el panel de
   propiedades arrancaría mostrando valores que no son los que se van a
   guardar. */
export function createBlock(type: Block["type"]): Block {
  const base = { id: newId(), spacingTop: "md", spacingBottom: "md" } as const;

  switch (type) {
    case "heading":
      return { ...base, type: "heading", text: "", level: "h2", weight: "medium", align: "left" };
    case "paragraph":
      return { ...base, type: "paragraph", text: "", variant: "body", align: "left" };
    case "image":
      return { ...base, type: "image", src: "", alt: "", display: "inset" };
    case "gallery":
      return { ...base, type: "gallery", images: [{ src: "", alt: "" }], layout: "grid-2" };
    case "video":
      return { ...base, type: "video", provider: "youtube", videoId: "" };
    case "quote":
      return { ...base, type: "quote", text: "", style: "bordered" };
    case "list":
      return { ...base, type: "list", items: [""], ordered: false, markerStyle: "bullet" };
    case "table":
      return { ...base, type: "table", headers: ["", ""], rows: [["", ""]], striped: true };
    case "cta":
      return {
        ...base,
        type: "cta",
        heading: "",
        buttonLabel: "",
        href: "/quote",
        hrefKind: "internal",
        style: "primary",
      };
    case "columns":
      return {
        ...base,
        type: "columns",
        columnCount: 2,
        columns: [[], []],
      };
    case "divider":
      return { ...base, type: "divider", style: "line" };
  }
}

/* Misma fábrica, acotada a lo que una columna acepta. El tipo de retorno lo
   garantiza: si alguien agrega un tipo a COLUMN_TYPES que el schema anidado no
   admite, esto deja de compilar. */
export function createColumnBlock(type: ColumnType): ColumnSimpleBlock {
  return createBlock(type) as ColumnSimpleBlock;
}
