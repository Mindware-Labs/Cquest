"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

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

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: reduced ? scrollYProgress : springProgress }}
      className="cq-scroll-progress"
    />
  );
}
