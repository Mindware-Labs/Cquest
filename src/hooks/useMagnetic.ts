"use client";

import { useRef } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";

const SPRING = { stiffness: 320, damping: 24, mass: 0.6 } as const;

/**
 * Magnetic pointer-follow: the element leans toward the cursor within its
 * own bounds and eases back on leave. Springs are critically-damped (no
 * overshoot) so the pull reads as elegant, not bouncy. No-ops under
 * prefers-reduced-motion — callers still get x/y motion values, they just
 * never move.
 */
export function useMagnetic<T extends HTMLElement>(
  strength = 0.3,
  liftPx = 3,
) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  const onMouseEnter = () => {
    if (reduced) return;
    y.set(-liftPx);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * strength);
    y.set(relY * strength - liftPx);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    style: { x: springX, y: springY },
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  };
}
