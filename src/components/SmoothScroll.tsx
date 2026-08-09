"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __lenis?: import("lenis").default;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = true;
    let starting = false;
    let lenis: import("lenis").default | undefined;
    let removeAnchorListener: (() => void) | undefined;
    let detachTicker: (() => void) | undefined;

    const stop = () => {
      removeAnchorListener?.();
      removeAnchorListener = undefined;
      detachTicker?.();
      detachTicker = undefined;
      lenis?.destroy();
      lenis = undefined;
      delete window.__lenis;
    };

    const start = async () => {
      if (starting || lenis || reducedMotion.matches) return;
      starting = true;

      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("@/lib/gsap"),
      ]);
      starting = false;
      if (!active || reducedMotion.matches) return;

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

      const onTick = (time: number) => instance.raf(time * 1000);
      instance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      detachTicker = () => {
        gsap.ticker.remove(onTick);

        gsap.ticker.lagSmoothing(500, 33);
      };
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
