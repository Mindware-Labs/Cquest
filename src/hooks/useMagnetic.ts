"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";

const SPRING = { stiffness: 320, damping: 24, mass: 0.6 } as const;

/**
 * Magnetic pointer-follow: the element leans toward the cursor within its
 * own bounds and eases back on leave. Springs are critically-damped (no
 * overshoot) so the pull reads as elegant, not bouncy. No-ops under
 * prefers-reduced-motion — callers still get x/y motion values, they just
 * never move.
 *
 * ── Measuring ───────────────────────────────────────────────────────────
 * The element's box is read once when the pointer arrives, then reused. It
 * used to be read inside `onMouseMove`, which meant a `getBoundingClientRect`
 * — a forced synchronous layout, flushing whatever style and layout work was
 * pending — on every one of the hundred-odd mousemove events a second a
 * trackpad emits. On the carousel's CTA that flush landed in the middle of a
 * stage full of running animations, which is precisely when a layout flush is
 * most expensive. Now the pointer position is parked on a ref and read back
 * inside one rAF, so there is at most one update per frame and never a
 * measurement while the pointer is still. Scroll invalidates the cached box
 * (the element moves under a stationary cursor), and only while hovering.
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

  const rect = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);

  const apply = useCallback(() => {
    frame.current = 0;
    const node = ref.current;
    if (!node || !hovering.current) return;
    if (!rect.current) rect.current = node.getBoundingClientRect();
    const box = rect.current;
    if (!box.width || !box.height) return;
    const relX = pointer.current.x - box.left - box.width / 2;
    const relY = pointer.current.y - box.top - box.height / 2;
    x.set(relX * strength);
    y.set(relY * strength - liftPx);
  }, [liftPx, strength, x, y]);

  /* Only mounted for the life of a hover — a scroll listener per magnetic
     element, always on, would be its own tax. */
  useEffect(() => {
    const invalidate = () => {
      if (hovering.current) rect.current = null;
    };
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onMouseEnter = () => {
    if (reduced) return;
    hovering.current = true;
    rect.current = ref.current?.getBoundingClientRect() ?? null;
    y.set(-liftPx);
  };

  const onMouseMove = (event: React.MouseEvent) => {
    if (reduced) return;
    pointer.current.x = event.clientX;
    pointer.current.y = event.clientY;
    if (!frame.current) frame.current = requestAnimationFrame(apply);
  };

  const onMouseLeave = () => {
    hovering.current = false;
    rect.current = null;
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
