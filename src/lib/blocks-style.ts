import type { Block, BlockType, BrandAccent, Spacing } from "@/lib/blocks";

// Vive fuera de los componentes: el editor admin necesita el mismo mapeo para su vista previa (PERS-5), y dos copias se desincronizan el día que alguien toque una sola.

/** El bloque de un tipo concreto, sacado del union de blocks.ts. */
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

// Tailwind no puede construir clases en tiempo de ejecución (mt-${size} no existe para el compilador), así que cada combinación va entera.
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

// "neutral" no es color de marca, es ausencia de acento. Un futuro acento de TEXTO no puede salir de --brand-verde: da 2.85:1 sobre blanco, no llega al 4.5:1 de WCAG 1.4.3 (usar --brand-verde-oscuro).
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
