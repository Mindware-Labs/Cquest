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
      // Both loaded dynamically and together: GSAP is only ever needed here
      // in the same breath as Lenis, so it stays out of the initial bundle
      // for anyone on reduced motion, who gets neither.
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("@/lib/gsap"),
      ]);
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

      /* ── Lenis ⇄ ScrollTrigger ────────────────────────────
         Two fixes to one problem: Lenis used to advance on its own
         requestAnimationFrame while ScrollTrigger advanced on GSAP's ticker.
         Two independent loops means the scroll position ScrollTrigger reads
         can be one frame behind the position Lenis has already rendered —
         visible during fast scrolling as About's reveals firing slightly out
         of step with the content they belong to.

         1. Lenis is driven BY the GSAP ticker instead of its own rAF, so
            there is one clock. The ticker reports seconds; Lenis wants
            milliseconds.
         2. ScrollTrigger.update runs on Lenis's own scroll event, so
            triggers are evaluated against the position Lenis just set rather
            than whenever the browser happens to emit a native scroll event.

         lagSmoothing(0) turns off GSAP's frame-drop compensation. It exists
         to keep tweens on schedule after a stall by inventing a large time
         delta — helpful for a timeline, actively wrong for a scroll position,
         where it would make Lenis jump. */
      const onTick = (time: number) => instance.raf(time * 1000);
      instance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      detachTicker = () => {
        gsap.ticker.remove(onTick);
        // Back to GSAP's documented default (500ms threshold, 33ms adjusted
        // frame) so tearing this down doesn't leave the setting flipped for
        // every other animation on the page.
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
