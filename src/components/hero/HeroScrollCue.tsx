"use client";

import { motion, type MotionValue } from "motion/react";
import { EASE_OUT, REVEAL } from "./animation";

/**
 * Hairline scroll affordance, centred in the hero's bottom padding band so it
 * never competes with the headline or the CTA. Purely decorative — the page
 * scrolls fine without it — so it's hidden from assistive tech, and it's
 * suppressed below `md` where the fold is obvious and the space is tight.
 *
 * It fades out as soon as the user actually scrolls: a prompt that keeps
 * prompting after you've obeyed it is noise. `ambient` parks the running
 * light when the hero leaves the viewport or the tab is hidden.
 */
export default function HeroScrollCue({
  reduced,
  ambient,
  revealed,
  opacity,
}: {
  reduced: boolean;
  ambient: boolean;
  /** False during act one, while the mascot has the stage to itself. */
  revealed: boolean;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--curtain)+0.4rem)] z-10 hidden justify-center md:flex"
    >
      <motion.span
        initial={reduced ? false : { opacity: 0, scaleY: 0.4 }}
        animate={revealed ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0.4 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: revealed ? REVEAL.cue : 0 }}
        data-ambient={ambient ? "on" : "off"}
        className="cq-scroll-cue origin-top"
      />
    </motion.div>
  );
}
