import { z } from "zod";

/* Fuente única de verdad del contenido de un Post: el renderer público, el
   editor del admin y la validación de posts.ts comparten este archivo. */

export const spacingSchema = z.enum(["none", "sm", "md", "lg"]);
export type Spacing = z.infer<typeof spacingSchema>;

/* Todo color de bloque sale de este enum — nunca un picker libre. Mismos
   tokens que ya vive en tokens.css (celeste/petroleo/verde), más "neutral"
   para cuando el bloque no necesita acento. */
export const brandAccentSchema = z.enum(["celeste", "petroleo", "verde", "neutral"]);
export type BrandAccent = z.infer<typeof brandAccentSchema>;

/* Una imagen puede quedar sin subir mientras el post es borrador — por eso
   "" es válido acá, a diferencia de Post.coverImageUrl (esa sí es obligatoria
   desde el primer guardado). Con contenido, exige que venga de nuestra propia
   subida a Blob, nunca una URL externa arbitraria. */
const imageSrcSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || value.startsWith("/api/images/"), {
    message: "La imagen debe salir de la subida a Vercel Blob.",
  });

/* Dimensiones reales del archivo, medidas en el servidor al subirlo. Son
   opcionales porque un bloque guardado antes de que existiera este campo sigue
   siendo válido — el renderer cae a un contenedor de proporción fija cuando
   faltan, en vez de rechazar el artículo entero. */
const dimensionSchema = z.number().int().positive().optional();

const blockBase = {
  id: z.string().min(1),
  spacingTop: spacingSchema.default("md"),
  spacingBottom: spacingSchema.default("md"),
};

const headingBlockSchema = z.object({
  ...blockBase,
  type: z.literal("heading"),
  text: z.string().trim().min(1, "El título no puede estar vacío.").max(160, "Máximo 160 caracteres."),
  level: z.enum(["h2", "h3", "h4"]).default("h2"),
  weight: z.enum(["regular", "medium"]).default("medium"),
  align: z.enum(["left", "center"]).default("left"),
});

const paragraphBlockSchema = z.object({
  ...blockBase,
  type: z.literal("paragraph"),
  text: z.string().trim().min(1, "El párrafo no puede estar vacío."),
  variant: z.enum(["body", "lead", "muted"]).default("body"),
  align: z.enum(["left", "center"]).default("left"),
});

const imageBlockSchema = z.object({
  ...blockBase,
  type: z.literal("image"),
  src: imageSrcSchema,
  /* Obligatorio, no opcional con aviso: una imagen sin texto alternativo es
     invisible para un lector de pantalla, y el panel ya promete que sin esto
     el artículo no se guarda. La validación tiene que sostener esa promesa. */
  alt: z.string().trim().min(1, "El texto alternativo es obligatorio.").max(200),
  width: dimensionSchema,
  height: dimensionSchema,
  caption: z.string().trim().max(200).optional(),
  display: z.enum(["full", "inset"]).default("inset"),
  accent: brandAccentSchema.optional(),
});

const galleryImageSchema = z.object({
  src: imageSrcSchema,
  alt: z.string().trim().min(1, "Cada imagen de la galería necesita texto alternativo.").max(200),
  /* La grilla recorta a una altura común, así que acá las dimensiones no
     deciden el encuadre — se guardan igual para no perder el dato si algún día
     la galería ofrece un modo que respete la proporción original. */
  width: dimensionSchema,
  height: dimensionSchema,
  caption: z.string().trim().max(200).optional(),
});

const galleryBlockSchema = z.object({
  ...blockBase,
  type: z.literal("gallery"),
  images: z.array(galleryImageSchema).min(1, "La galería necesita al menos una imagen.").max(12, "Máximo 12 imágenes."),
  layout: z.enum(["grid-2", "grid-3"]).default("grid-2"),
});

const videoBlockSchema = z.object({
  ...blockBase,
  type: z.literal("video"),
  provider: z.enum(["youtube", "vimeo"]),
  videoId: z
    .string()
    .trim()
    .min(1, "Falta el id del video.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Id de video inválido — solo letras, números, guiones y guion bajo."),
  caption: z.string().trim().max(200).optional(),
});

const quoteBlockSchema = z.object({
  ...blockBase,
  type: z.literal("quote"),
  text: z.string().trim().min(1, "La cita no puede estar vacía."),
  attributionName: z.string().trim().max(120).optional(),
  attributionRole: z.string().trim().max(120).optional(),
  style: z.enum(["bordered", "large"]).default("bordered"),
});

const listBlockSchema = z.object({
  ...blockBase,
  type: z.literal("list"),
  items: z.array(z.string().trim().min(1)).min(1, "La lista necesita al menos un elemento.").max(30, "Máximo 30 elementos."),
  ordered: z.boolean().default(false),
  markerStyle: z.enum(["bullet", "check"]).default("bullet"),
});

const tableBlockSchema = z.object({
  ...blockBase,
  type: z.literal("table"),
  headers: z.array(z.string().trim()).min(1, "La tabla necesita al menos una columna.").max(8, "Máximo 8 columnas."),
  rows: z.array(z.array(z.string().trim())).min(1, "La tabla necesita al menos una fila.").max(50, "Máximo 50 filas."),
  striped: z.boolean().default(true),
});

const ctaBlockSchema = z.object({
  ...blockBase,
  type: z.literal("cta"),
  heading: z.string().trim().min(1, "Falta el título del CTA."),
  body: z.string().trim().max(300).optional(),
  buttonLabel: z.string().trim().min(1, "Falta el texto del botón."),
  href: z.string().trim().min(1, "Falta el destino del botón."),
  /* Decide si el renderer envuelve el botón en LocalizedLink (rutas propias,
     con prefijo de idioma) o en un <a> normal (destinos externos). */
  hrefKind: z.enum(["internal", "external"]).default("internal"),
  style: z.enum(["primary", "secondary"]).default("primary"),
});

const dividerBlockSchema = z.object({
  ...blockBase,
  type: z.literal("divider"),
  style: z.enum(["line", "space"]).default("line"),
});

/* Un solo nivel de anidamiento: una columna solo admite bloques simples,
   nunca otra columna ni bloques con su propia lista (galería/tabla). */
const columnSimpleBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  imageBlockSchema,
  listBlockSchema,
  ctaBlockSchema,
]);
export type ColumnSimpleBlock = z.infer<typeof columnSimpleBlockSchema>;

const columnsBlockSchema = z.object({
  ...blockBase,
  type: z.literal("columns"),
  columnCount: z.union([z.literal(2), z.literal(3)]),
  columns: z
    .array(z.array(columnSimpleBlockSchema).max(10, "Máximo 10 bloques por columna."))
    .min(2, "Mínimo 2 columnas.")
    .max(3, "Máximo 3 columnas."),
});

export const blockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  imageBlockSchema,
  galleryBlockSchema,
  videoBlockSchema,
  quoteBlockSchema,
  listBlockSchema,
  tableBlockSchema,
  ctaBlockSchema,
  columnsBlockSchema,
  dividerBlockSchema,
]);
export type Block = z.infer<typeof blockSchema>;

/* RNF-5 exige texto alternativo en TODA imagen. No se pone como `min(1)` en
   el campo `alt` por dos razones: rompería el borrador a medio escribir (una
   imagen recién agregada todavía no tiene ni archivo ni descripción), y un
   `.refine()` sobre el objeto lo sacaría del discriminatedUnion.

   Así que la regla es "si hay imagen, hay alt" y se comprueba sobre el
   arreglo completo, incluidas las imágenes anidadas en columnas. Una imagen
   sin subir no molesta; una subida sin describir no se publica. */
function checkAltText(blocks: Block[], ctx: z.RefinementCtx): void {
  function check(block: Block, path: (string | number)[]): void {
    if (block.type === "image" && block.src && block.alt.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: [...path, "alt"],
        message: "Toda imagen necesita texto alternativo.",
      });
    }

    if (block.type === "gallery") {
      block.images.forEach((image, index) => {
        if (image.src && image.alt.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: [...path, "images", index, "alt"],
            message: `La imagen ${index + 1} de la galería necesita texto alternativo.`,
          });
        }
      });
    }

    if (block.type === "columns") {
      block.columns.forEach((column, columnIndex) => {
        column.forEach((child, childIndex) => {
          check(child, [...path, "columns", columnIndex, childIndex]);
        });
      });
    }
  }

  blocks.forEach((block, index) => check(block, [index]));
}

export const blockArraySchema = z
  .array(blockSchema)
  .min(1, "El artículo necesita al menos un bloque.")
  .superRefine(checkAltText);
export type BlockArray = z.infer<typeof blockArraySchema>;

export const BLOCK_TYPES = [
  "heading",
  "paragraph",
  "image",
  "gallery",
  "video",
  "quote",
  "list",
  "table",
  "cta",
  "columns",
  "divider",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];
