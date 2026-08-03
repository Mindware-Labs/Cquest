import type { Variants } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";

/**
 * Bespoke beats for the compass illustration and its text block — the
 * per-line reveal itself runs on the shared `focusRiseVariants` /
 * `ruleXVariants` from services/motion.ts. These exist here because nothing
 * else on the site drops a weighted needle or breathes a search ring, so
 * there is no shared vocabulary to reuse for those, and the text needs a
 * later `delayChildren` than the default `groupVariants` gives it — it
 * waits for the compass to have mostly drawn itself in first. */

/** Text block stagger — starts once the compass's ring/ticks have landed. */
export const textGroupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.75 } },
};

/** Outer ring + tick marks draw themselves in before the needle commits. */
export const ringVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.1, ease: EASE_OUT }, opacity: { duration: 0.4 } },
  },
};

export const tickVariants: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT, delayChildren: 0.2, staggerChildren: 0.035 },
  },
};

/**
 * The needle doesn't settle on North — that's the whole joke. It swings past
 * a plausible heading with a real spring (weight, one small overshoot), then
 * `NEEDLE_DRIFT` takes over: a slow, linear, never-resting sway, because a
 * compass that can't find its bearing shouldn't ever look fully at rest.
 */
export const needleVariants: Variants = {
  hidden: { rotate: -146, opacity: 0 },
  visible: {
    rotate: 128,
    opacity: 1,
    transition: { rotate: { type: "spring", stiffness: 130, damping: 11, mass: 1, delay: 0.55 }, opacity: { duration: 0.3, delay: 0.55 } },
  },
};

/**
 * Applied to a *child* of the needle group, so its small back-and-forth adds
 * on top of the parent's spring-settled rotation instead of replacing it —
 * both pivot around the same 100,100 center, so the two compose cleanly.
 */
export const NEEDLE_WOBBLE_TRANSITION = {
  duration: 9,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  delay: 1.7,
};

/** Radar ping — a search sweep that never finds anything, so it repeats. */
export const PING_TRANSITION = {
  duration: 2.6,
  ease: "easeOut" as const,
  repeat: Infinity,
  repeatDelay: 0.6,
};
