import type { Variants } from "motion/react";

/* ── Shared motion language ───────────────────────────────
   One curve carries every service page (ease-out-quint), and two gestures
   do the talking: content sharpens up out of a soft blur (presence, never
   a flat fade), and hero lines rise from behind a clipped edge like a
   curtain lifting. Previously duplicated byte-for-byte across
   CallCenterDetail.tsx, BpoDetail.tsx and SystemsDetail.tsx — now shared. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const VIEWPORT = { once: true, margin: "-80px" } as const;

// Stagger container — reveals its children in sequence, not all at once.
export const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

// The premium replacement for a flat fade: y-rise + focus-pull out of blur.
export const focusRiseVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE_OUT } },
};

// Blur-only reveal for elements that own a CSS hover transform — animating a
// transform here would leave a lingering inline value that blocks the hover.
export const softRiseVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.85, ease: EASE_OUT } },
};

// Hairline rules draw along their length, a beat before the heading lifts.
export const ruleXVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};
export const ruleYVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};

// Timeline: the socket lights up, then its label sharpens in just behind it.
export const stepVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
export const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};

// Hero: word lines lift in sequence on load, from behind their own clip edge.
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

// Pass-through container: consumes a stagger slot and forwards the label to a
// nested motion child without adding a transform of its own.
export const passThroughVariants: Variants = { hidden: {}, visible: {} };
