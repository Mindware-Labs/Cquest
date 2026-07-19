"use client";

import { useEffect } from "react";
import { useReducedMotion } from "motion/react";
import Lenis from "lenis";

/* Lenis wheel smoothing — native scroll position stays authoritative (so
   Motion's useScroll hooks keep working untouched), but wheel input eases
   into it with inertia instead of stepping. `anchors` makes the in-page
   links (#services, #contact…) glide with the same physics.

   Under prefers-reduced-motion the component mounts nothing: scrolling
   stays fully native and instant. */
export default function SmoothScroll() {
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
