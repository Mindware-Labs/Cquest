import type { Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const HEADLINE = [
  ["One", "operation."],
  ["Three", "ways", "to", "move", "forward."],
] as const;

export const wordVariants: Variants = {
  hidden: { y: "112%" },
  show: (index: number) => ({
    y: "0%",
    transition: { duration: 0.75, ease: EASE_OUT, delay: 0.08 + index * 0.06 },
  }),
};

export const guideRingVariants: Variants = {
  hidden: { opacity: 0, scale: 0.78, filter: "blur(6px)" },
  show: (index: number) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_OUT, delay: 0.12 + index * 0.11 },
  }),
};

export const nodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.45 },
  show: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.42 + index * 0.13 },
  }),
};

export const sealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 26, delay: 0.72 },
  },
};
