"use client";

import { useEffect, useRef } from "react";

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
