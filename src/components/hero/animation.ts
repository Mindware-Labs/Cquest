import type { Variants } from "motion/react";
import type { Dictionary } from "@/i18n/dictionaries/types";
import type { Locale } from "@/i18n/config";
import { getServiceChildren, type NavLink } from "@/components/navigation/data";

/** ease-out-quint — espeja `--ease-out`. Por defecto para lo que entra. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** ease-out-expo — espeja `--ease-out-soft`. Asentados largos, cinematográficos. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/** ease-in-expo — para lo que SALE. Una salida que se asienta parece otra entrada. */
export const EASE_IN_EXPO = [0.7, 0, 0.84, 0] as const;

/** Acto uno. `scene` llega al CSS de la mascota como `--qb-t0`: un solo reloj. */
export const BEAT = {
  scene: 0.14,
} as const;

/* Acto dos. Offsets desde que la mascota termina de teclear — no desde el
   mount: los delays de tecleo llevan jitter y la duración no se sabe antes. */
export const REVEAL = {
  nav: 0,
  /* Marca → links → CTA. 80ms está por debajo de donde el ojo empieza a
     contar eventos, así que se lee como un gesto con dirección, no como tres. */
  navStep: 0.08,
  rule: 0.1,
  headline: 0.18,
  /** 70ms por palabra: se lee como una ola, no como siete eventos. */
  headlineStep: 0.07,
  /** BASE, no el beat: "el lead llega último" depende del idioma (ver abajo). */
  lead: 0.5,
} as const;

/* El lead 0.2s después de que arranca la última máscara. Fijo en 0.5 llegaba
   antes que el headline en inglés (9 palabras) e invertía la jerarquía. */
export function leadDelayFor(wordCount: number): number {
  return Math.max(
    REVEAL.lead,
    REVEAL.headline + (wordCount - 1) * REVEAL.headlineStep + 0.2,
  );
}

/** Beats dentro del CSS de la mascota. Espejo de QuestBotScene.module.css. */
export const SCENE = {
  roll: 1.75,
  say: 2.85,
  type: 3.0,
  settled: 3.4,
} as const;

/** Silencio tras la última tecla: sin él, la frase y la respuesta son un evento. */
export const INTRO_TAIL_MS = 420;

/** Techo duro del acto uno. Nada que el usuario necesite depende de una animación. */
export const INTRO_SAFETY_MS = 7000;

export function sceneAt(beat: number): number {
  return (BEAT.scene + beat) * 1000;
}

export function getHeroNavLinks(dict: Dictionary, lang: Locale): readonly NavLink[] {
  return [
    {
      label: dict.hero.navLinks.services,
      href: "#services",
      children: getServiceChildren(dict, lang),
    },
    { label: dict.hero.navLinks.team, href: "#metrics" },
    { label: dict.hero.navLinks.sectors, href: "#sectors" },
    { label: dict.hero.navLinks.whyUs, href: "#why-us" },
    { label: dict.nav.blog, href: "#blog" },
  ];
}

/* Índices en dict.hero.questions. [0] es la frase de apertura y nunca es
   destino de hover, por eso empieza en 1. Reordenar uno sin el otro apunta mal. */
export const SERVICE_QUESTION_INDEX: Record<string, number> = {
  "/services/operations": 1,
  "/services/call-center": 2,
  "/services/systems": 3,
};

/* Máscara por palabra. Porcentaje y nunca px, para que escale con el clamp()
   del tamaño. Sin opacity: la máscara ya oculta y un fade ensucia el borde. */
export const wordVariants: Variants = {
  /* Salida uniforme, sin stagger inverso: en un replay se van como un telón. */
  hidden: {
    y: "116%",
    transition: { duration: 0.45, ease: EASE_IN_EXPO },
  },
  visible: (i: number) => ({
    y: "0%",
    transition: {
      duration: 1.15,
      ease: EASE_OUT_EXPO,
      delay: REVEAL.headline + i * REVEAL.headlineStep,
    },
  }),
};

/* Las tres celdas del nav. Sin el blur de rise(): sobre versales de 11px un
   desenfoque se lee como error de foco, y cuesta un filtro de más. */
export function chromeRise(delay: number): Variants {
  return {
    hidden: {
      opacity: 0,
      y: -12,
      transition: { duration: 0.32, ease: EASE_IN_EXPO },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.72, ease: EASE_OUT, delay },
    },
  };
}

/** Subida genérica del lead y el CTA. El blur se queda en ≤8px (coste Safari). */
export function rise(delay: number, distance = 18): Variants {
  return {
    hidden: {
      opacity: 0,
      y: distance,
      filter: "blur(6px)",
      transition: { duration: 0.35, ease: EASE_IN_EXPO },
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.85, ease: EASE_OUT, delay },
    },
  };
}

/** Filete que se dibuja desde su borde izquierdo — y vuelve a colapsar ahí. */
export const ruleVariants: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
    transition: { duration: 0.4, ease: EASE_IN_EXPO },
  },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1, ease: EASE_OUT_EXPO, delay: REVEAL.rule },
  },
};
