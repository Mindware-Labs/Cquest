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

    const lenis = new Lenis({ lerp: 0.1 });

    /* In-page anchors are handled here instead of Lenis's `anchors: true`,
       because that built-in ignores CSS scroll-margin. Reading the target's
       computed scroll-margin-top keeps both scroll paths in agreement: the
       services sheet declares a NEGATIVE margin (land one curtain past its
       top, hero fully hidden), and any future section can tune its own
       landing the same way — in CSS, adaptively, with no JS changes. */
    const onAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent((link.getAttribute("href") ?? "").slice(1));
      const target = id ? document.getElementById(id) : document.body;
      if (!target) return;
      event.preventDefault();
      const scrollMargin =
        parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      history.pushState(null, "", id ? `#${id}` : location.pathname);
      lenis.scrollTo(target, { offset: -scrollMargin });
    };
    document.addEventListener("click", onAnchorClick);

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
