import type { Variants } from "motion/react";

/* ── Shared motion language ───────────────────────────────
   One curve carries every service page (ease-out-quint), and two gestures
   do the talking: content rises into place with presence (never a flat
   fade), and hero lines rise from behind a clipped edge like a curtain
   lifting. Previously duplicated byte-for-byte across CallCenterDetail.tsx,
   OperationsDetail.tsx and SystemsDetail.tsx — now shared.

   Transform + opacity ONLY, on every variant below — no `filter`. This used
   to be a focus-pull out of `blur()`, but `filter` is not a compositor
   property: every frame of the reveal re-rasterises the element at a new
   blur radius on the main thread, and every section on every service page
   staggers several of these at once, right as the route curtain is
   revealing the page. ServicesCarousel.tsx hit the identical bug first (see
   its stageItemVariants) — six simultaneous blurs made its page turn
   stutter. Same fix here: the travel/duration carries the weight the blur
   used to. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const VIEWPORT = { once: true, margin: "-80px" } as const;

// Stagger container — reveals its children in sequence, not all at once.
export const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

// The premium replacement for a flat fade: a deeper y-rise carries the
// weight the focus-pull-out-of-blur used to.
export const focusRiseVariants: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
};

// Opacity-only reveal for elements that own a CSS hover transform —
// animating a transform here would leave a lingering inline value that
// blocks the hover (and `filter` is off the table for the reason above).
export const softRiseVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.85, ease: EASE_OUT } },
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

// Stat/ledger card: the card itself only fades in (its CSS owns the hover
// transform, and `filter` is off the table — see the note up top), then its
// inner lines cascade up inside it — the row lands first, the figures settle
// a beat later.
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

/* Drop-in: a card falls into place rather than fading up. The transition is a
   SPRING, not the shared quint — gravity is the whole point, and a fixed
   duration cannot produce the short overshoot on landing that makes a solid
   object read as having weight. `damping: 17` against `stiffness: 190` is that
   overshoot: about 3px past the mark and back, which registers as a settle
   rather than as a bounce.

   Opacity is pulled out into its own short tween. Left on the spring it would
   still be resolving while the card is already sitting still, so the card
   would appear to fade in AFTER it landed. It has to be solid on the way down.

   The 1.5° tilt is what keeps three identical rectangles from falling like one
   sheet: each lands square, but they are not perfectly parallel in flight. */
export const dropGroupVariants: Variants = {
  hidden: {},
  // Wider than groupVariants' 0.1 — the fall is a longer gesture than a fade,
  // and at 0.1 the second card leaves before the first has landed.
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

// Cinematic photo reveal, split across two layers of one gesture: the crop
// wipes open from its bottom edge while the image inside settles from a
// slight overscale. Both live on inner wrappers so the frame element keeps
// its border, shadow and CSS hover transform untouched.
export const mediaRevealVariants: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.05, ease: EASE_OUT } },
};
export const mediaSettleVariants: Variants = {
  hidden: { scale: 1.16 },
  visible: { scale: 1, transition: { duration: 1.35, ease: EASE_OUT } },
};
