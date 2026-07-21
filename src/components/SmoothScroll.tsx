"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    /* The live Lenis instance, exposed so components that need programmatic
       travel (e.g. the services lateral journey) scroll through the same
       easing pipeline instead of fighting it with native scrollTo. */
    __lenis?: import("lenis").default;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = true;
    let starting = false;
    let frame: number | undefined;
    let lenis: import("lenis").default | undefined;
    let removeAnchorListener: (() => void) | undefined;

    const stop = () => {
      removeAnchorListener?.();
      removeAnchorListener = undefined;
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      lenis?.destroy();
      lenis = undefined;
      delete window.__lenis;
    };

    const start = async () => {
      if (starting || lenis || reducedMotion.matches) return;
      starting = true;
      const { default: Lenis } = await import("lenis");
      starting = false;
      if (!active || reducedMotion.matches) return;

      // Without this, Lenis keeps its previous page's scroll target alive
      // across a client-side route change (this component never unmounts),
      // so the next raf tick drags the real scroll back toward wherever the
      // old page had it — landing past the new page's hero. Internal-link
      // clicks (Next's <Link>) now stop that inertia so navigation starts
      // clean from wherever Next.js settles the new page's scroll.
      lenis = new Lenis({ lerp: 0.1, stopInertiaOnNavigate: true });
      const instance = lenis;
      window.__lenis = instance;
      const onAnchorClick = (event: MouseEvent) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
        if (!link) return;
        const id = decodeURIComponent((link.getAttribute("href") ?? "").slice(1));
        const target = id ? document.getElementById(id) : document.body;
        if (!target) return;

        event.preventDefault();
        const styles = getComputedStyle(target);
        const scrollMargin = Number.parseFloat(styles.scrollMarginTop) || 0;
        const overlap = Math.min(Number.parseFloat(styles.marginTop) || 0, 0);
        const offset = scrollMargin === 0 && overlap < 0 ? -overlap : -scrollMargin;
        history.pushState(null, "", id ? `#${id}` : location.pathname);
        instance.scrollTo(target, { offset });
      };

      document.addEventListener("click", onAnchorClick);
      removeAnchorListener = () => document.removeEventListener("click", onAnchorClick);
      frame = requestAnimationFrame(function update(time) {
        instance.raf(time);
        frame = requestAnimationFrame(update);
      });
    };

    const syncPreference = () => {
      if (reducedMotion.matches) stop();
      else void start();
    };

    reducedMotion.addEventListener("change", syncPreference);
    syncPreference();

    return () => {
      active = false;
      reducedMotion.removeEventListener("change", syncPreference);
      stop();
    };
  }, []);

  return null;
}
