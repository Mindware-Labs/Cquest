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
   de marca: es la ausencia de acento, y cae al borde/texto normal del sitio. */
export const ACCENT_TEXT: Record<BrandAccent, string> = {
  celeste: "text-celeste",
  petroleo: "text-petroleo",
  verde: "text-verde",
  neutral: "text-[var(--text-tertiary)]",
};

export const ACCENT_BORDER: Record<BrandAccent, string> = {
  celeste: "border-celeste",
  petroleo: "border-petroleo",
  verde: "border-verde",
  neutral: "border-border",
};

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
