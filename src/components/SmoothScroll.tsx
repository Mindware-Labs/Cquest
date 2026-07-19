"use client";

import { useEffect } from "react";

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
    };

    const start = async () => {
      if (starting || lenis || reducedMotion.matches) return;
      starting = true;
      const { default: Lenis } = await import("lenis");
      starting = false;
      if (!active || reducedMotion.matches) return;

      lenis = new Lenis({ lerp: 0.1 });
      const instance = lenis;
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
