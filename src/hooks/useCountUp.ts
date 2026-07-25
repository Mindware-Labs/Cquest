"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 to `target` once the returned ref's element enters the
 * viewport, easing along the same quint ease-out used by the rest of the
 * site's scroll reveals. Reduced-motion users get the target value straight
 * away — no numeric flicker to sit through.
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(
  target: number,
  { reduced = false, duration = 1400 }: { reduced?: boolean; duration?: number } = {},
) {
  const ref = useRef<T | null>(null);
  const [value, setValue] = useState(reduced ? target : 0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      // Deferred a tick so this stays an async update from React's
      // perspective, not a synchronous setState-in-effect cascade.
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
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
          setValue(Math.round(target * easeOutQuint(progress)));
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

  return { ref, value };
}
