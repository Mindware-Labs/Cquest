import type { Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const VIEWPORT = { once: true, margin: "-80px" } as const;

export const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const focusRiseVariants: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
};

/* Las cuatro salas tras el carrusel entraban con la MISMA subida, y repetida
   cuatro veces es un metrónomo: posarse, montarse, afirmar, cerrar. */

/* Posarse. Sin desplazamiento: viene justo detrás del carrusel, que es el
   momento interactivo grande, y aquí toca aterrizar y no volver a actuar. */
export const settleVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 1.05, ease: EASE_OUT },
  },
};

/* Cerrar. Solo opacidad, y más lenta: la última sala no se presenta. */
export const closeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.15, ease: EASE_OUT } },
};

/* Afirmar. Máscara por línea, la misma gramática que el h1 del hero — las dos
   únicas veces que la página afirma algo en vez de enumerarlo. */
export const lineMaskGroupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.04 } },
};

export const lineMaskVariants: Variants = {
  hidden: { y: "112%" },
  visible: { y: "0%", transition: { duration: 1.05, ease: EASE_OUT } },
};

export const softRiseVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.85, ease: EASE_OUT } },
};

export const ruleXVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};
export const ruleYVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const stepVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
export const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};

export const heroCopyVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
export const heroLinesVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};
export const heroCurtainVariants: Variants = {
  hidden: { y: "120%" },
  visible: { y: "0%", transition: { duration: 1.05, ease: EASE_OUT } },
};

export const passThroughVariants: Variants = { hidden: {}, visible: {} };

export const statCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.85, ease: EASE_OUT, staggerChildren: 0.09, delayChildren: 0.1 },
  },
};
export const statLineVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export const dropGroupVariants: Variants = {
  hidden: {},

  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
};
export const dropCardVariants: Variants = {
  hidden: { opacity: 0, y: -64, rotate: -1.5, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 190,
      damping: 17,
      mass: 0.9,
      opacity: { duration: 0.25, ease: EASE_OUT },
    },
  },
};

export const mediaRevealVariants: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.05, ease: EASE_OUT } },
};
export const mediaSettleVariants: Variants = {
  hidden: { scale: 1.16 },
  visible: { scale: 1, transition: { duration: 1.35, ease: EASE_OUT } },
};
