"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";

// A route change resets scroll in one step, well past anything a single
// frame of real scrolling could cover — that gap is what marks it as a
// reset rather than motion to smooth.
const JUMP_THRESHOLD = 0.08;

/* Page scroll progress — a brand hairline growing along the top edge.
   Spring-smoothed so it trails the thumb like a needle, not a scrubber;
   under reduced motion it tracks raw progress with no spring. */
export default function ScrollProgress() {
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  // Relying on route-change timing (pathname effects, rAFs) to catch the
  // reset is a race against wherever Next settles the new scroll position —
  // it can still land after a frame or two has already painted the spring
  // mid-rewind. Watching the raw value directly sidesteps that: any jump
  // this large, from whatever caused it, snaps instead of easing.
  const lastValue = useRef(scrollYProgress.get());
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (Math.abs(latest - lastValue.current) > JUMP_THRESHOLD) {
      springProgress.jump(latest);
    }
    lastValue.current = latest;
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: reduced ? scrollYProgress : springProgress }}
      className="cq-scroll-progress"
    />
  );
}
