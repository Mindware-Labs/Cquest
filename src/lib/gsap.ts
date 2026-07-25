"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The one curve the whole site moves on. Registered here as a named GSAP ease
 * so scroll-driven tweens land on exactly the same cubic-bezier as
 * `--ease-out` in tokens.css and `EASE_OUT` in components/services/motion.ts —
 * a GSAP tween and a CSS transition running side by side are then
 * indistinguishable instead of "close enough".
 */
export const CQ_EASE = "cq-out";

/**
 * Overshoot variant, reserved for the few low-frequency "flourish" beats
 * (chips popping in, sector icons snapping to rest). Same family, more snap.
 */
export const CQ_EASE_SNAP = "back.out(1.7)";

// Registered once, at module load — every About component that needs
// scroll-driven GSAP work imports from here instead of registering its own
// copy of the plugin.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create(CQ_EASE, "M0,0 C0.22,1 0.36,1 1,1");
}

export { gsap, ScrollTrigger };
