"use client";

import { useEffect, useRef } from "react";

/**
 * Counts up from 0 to `target` once the returned ref's element enters the
 * viewport, easing along the same quint ease-out used by the rest of the
 * site's scroll reveals. Reduced-motion users get the target value straight
 * away — no numeric flicker to sit through.
 *
 * ── Where the number lives ──────────────────────────────────────────────
 * The animating value is written straight into the ref'd element's text,
 * not held in React state. A `setState` per frame meant every metric on the
 * band re-rendered sixty times a second for the whole 1.4s run — four
 * components' worth of reconciliation for text that only ever changes one
 * text node. `format` composes the final string (separators, suffix), so
 * the element still renders exactly what the consumer used to interpolate;
 * `initial` is that same formatter applied to the starting value, for the
 * server-rendered markup.
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(
  target: number,
  {
    reduced = false,
    duration = 1400,
    format = (n: number) => String(n),
  }: { reduced?: boolean; duration?: number; format?: (value: number) => string } = {},
) {
  const ref = useRef<T | null>(null);
  const startedRef = useRef(false);
  /* Read at write time so a language/suffix change never stales the loop. */
  const formatRef = useRef(format);
  useEffect(() => {
    formatRef.current = format;
  });

  useEffect(() => {
    const write = (value: number) => {
      if (ref.current) ref.current.textContent = formatRef.current(value);
    };
    const node = ref.current;
    if (reduced || !node || typeof IntersectionObserver === "undefined") {
      write(target);
      return;
    }
    let frame: number;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        const start = performance.now();
        const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          write(Math.round(target * easeOutQuint(progress)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration, reduced]);

  return { ref, initial: format(reduced ? target : 0) };
}
