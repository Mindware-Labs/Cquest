"use client";

import { motion, type MotionStyle, type MotionValue } from "motion/react";
import { EASE_IN_EXPO, EASE_OUT, REVEAL } from "./animation";

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
  cueDelay = REVEAL.cue,
}: {
  reduced: boolean;
  ambient: boolean;
  /** False during act one, while the mascot has the stage to itself. */
  revealed: boolean;
  opacity: MotionValue<number>;
  /**
   * When the cue enters, seconds after the reveal. Locale-dependent — it
   * follows the lead, whose own beat follows the headline's word count
   * (leadDelayFor in animation.ts) — so HeroImage passes it down.
   */
  cueDelay?: number;
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
        transition={
          revealed
            ? { duration: 0.9, ease: EASE_OUT, delay: cueDelay }
            : { duration: 0.3, ease: EASE_IN_EXPO }
        }
        data-ambient={ambient ? "on" : "off"}
        /* Phase-locks the running light to this entrance: the loop's
           animation is `none` until the flip (see site.css), and its delay
           — entrance delay plus ~0.35s, the hairline ~80% seated on the
           ease — lands the FIRST sweep dropping from the top of a line
           that has just finished materialising. Every load, same frame. */
        data-revealed={revealed ? "true" : "false"}
        /* Cast because MotionStyle's type doesn't admit custom properties,
           though Motion writes them through just fine. */
        style={{ "--cq-cue-run-delay": `${(cueDelay + 0.35).toFixed(2)}s` } as MotionStyle}
        className="cq-scroll-cue origin-top"
      />
    </motion.div>
  );
}
