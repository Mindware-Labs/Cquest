"use client";

import { useEffect, useLayoutEffect } from "react";

/* ── About's GSAP motion language ─────────────────────────
   components/services/motion.ts owns the declarative half of the system
   (motion/react variants: focus-rise out of blur, curtain clips, rule
   draws). This file owns the scroll-driven half, so a GSAP timeline in
   StorySection and a `whileInView` variant in SectionIntro are two dialects
   of one language rather than two unrelated motion systems.

   The vocabulary, matched to the variants next door:
     • REVEAL — how content arrives: rise + focus-pull, never a flat fade.
     • CURTAIN — how blocks arrive: clipped from an edge, like a wipe.
     • SCRUB — how ambient/parallax layers track scroll: smoothed, weighted. */

/** Duration of a primary content reveal — mirrors focusRiseVariants (0.9s). */
export const REVEAL_DURATION = 0.9;

/** Secondary beats (inner lines, chips) land quicker so they read as detail. */
export const DETAIL_DURATION = 0.55;

/**
 * Scroll-linked layers use a smoothed scrub rather than `true`. Raw scrub
 * pins a decorative layer 1:1 to the scrollbar, which reads mechanical;
 * a ~0.8s catch-up gives it weight — it lags, then settles.
 */
export const SCRUB = 0.8;

/** Where a reveal fires: the block is a comfortable way into the viewport. */
export const REVEAL_START = "top 82%";

/** Shared `from` state for a content reveal (rise + focus-pull out of blur). */
export const REVEAL_FROM = { y: 28, autoAlpha: 0, filter: "blur(10px)" } as const;
export const REVEAL_TO = { y: 0, autoAlpha: 1, filter: "blur(0px)" } as const;

/** Clip edges for a curtain wipe, named by the edge the content emerges from. */
export const CURTAIN = {
  fromBottom: "inset(0% 0% 100% 0%)",
  fromTop: "inset(100% 0% 0% 0%)",
  fromLeft: "inset(0% 100% 0% 0%)",
  open: "inset(0% 0% 0% 0%)",
} as const;

/**
 * GSAP wants its `from` state written before the browser paints, otherwise
 * the un-animated content flashes for a frame. `useLayoutEffect` does that
 * but warns during SSR, so it degrades to `useEffect` on the server —
 * the GSAP-recommended isomorphic pattern.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
