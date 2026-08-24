import type { Block, BlockType, BrandAccent, Spacing } from "@/lib/blocks";

/* Traduce las opciones de personalización de un bloque a clases concretas.
   Vive fuera de los componentes a propósito: el editor del admin va a
   necesitar exactamente el mismo mapeo para su vista previa (PERS-5), y dos
   copias de esta tabla se desincronizan el día que alguien toque una sola. */

/** El bloque de un tipo concreto, sacado del union de blocks.ts. */
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

/* Tailwind no puede construir clases en tiempo de ejecución (`mt-${size}` no
   existe para el compilador), así que cada combinación se escribe entera. */
const SPACING_TOP: Record<Spacing, string> = {
  none: "mt-0",
  sm: "mt-4",
  md: "mt-10",
  lg: "mt-20",
};

const SPACING_BOTTOM: Record<Spacing, string> = {
  none: "mb-0",
  sm: "mb-4",
  md: "mb-10",
  lg: "mb-20",
};

export function blockSpacing(top: Spacing, bottom: Spacing): string {
  return `${SPACING_TOP[top]} ${SPACING_BOTTOM[bottom]}`;
}

/* Los cuatro acentos institucionales de tokens.css. "neutral" no es un color
   de marca: es la ausencia de acento, y cae al borde/texto normal del sitio.

   Hubo también un `ACCENT_TEXT` y un `ACCENT_BORDER` acá. Se fueron: ningún
   componente los importaba. El único acento que el editor ofrece hoy es el de
   la imagen, y ése usa el anillo.

   Si algún día se agrega un acento de TEXTO, no puede salir de `--brand-verde`:
   ese verde da 2.85:1 sobre la hoja blanca del blog y no llega al 4.5:1 de
   WCAG 1.4.3. Para texto existe `--brand-verde-oscuro`. En el anillo el verde
   de marca sí sirve — ahí es un campo de color, no algo que haya que leer. */
export const ACCENT_RING: Record<BrandAccent, string> = {
  celeste: "ring-1 ring-celeste/40",
  petroleo: "ring-1 ring-petroleo/40",
  verde: "ring-1 ring-verde/40",
  neutral: "ring-1 ring-border",
};

export const ALIGN: Record<"left" | "center", string> = {
  left: "text-left",
  center: "text-center",
};
