"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";

const SPRING = { stiffness: 320, damping: 24, mass: 0.6 } as const;

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
