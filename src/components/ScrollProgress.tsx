"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";

const JUMP_THRESHOLD = 0.08;

export default function ScrollProgress() {
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

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
