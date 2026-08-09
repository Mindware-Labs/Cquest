"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

export const REVEAL_DURATION = 0.9;

export const DETAIL_DURATION = 0.55;

export const SCRUB = 0.8;

export const REVEAL_START = "top 82%";

export const REVEAL_FROM = { y: 28, autoAlpha: 0, filter: "blur(10px)" } as const;
export const REVEAL_TO = { y: 0, autoAlpha: 1, filter: "blur(0px)" } as const;

export const CURTAIN = {
  fromBottom: "inset(0% 0% 100% 0%)",
  fromTop: "inset(100% 0% 0% 0%)",
  fromLeft: "inset(0% 100% 0% 0%)",
  open: "inset(0% 0% 0% 0%)",
} as const;

export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Enciende una sala al entrar y no la vuelve a apagar: al volver hacia arriba
   la luz ya está puesta, que es lo que se espera de un cuarto ya visitado. */
export function useEnteredOnce(
  ref: RefObject<HTMLElement | null>,
  { rootMargin = "-12% 0px -12% 0px", enabled = true } = {},
): boolean {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!enabled || entered) return;
    const node = ref.current;
    if (!node) return;

    /* Sin soporte, encender en el frame siguiente. Un setState en el cuerpo
       del efecto encadena renders; en un callback no. */
    /* `typeof` y no `in window`: el `in` estrecha `window` a `never` en la
       rama negativa y ahí ya no se puede llamar a nada. */
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setEntered(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setEntered(true);
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, enabled, entered]);

  /* Deshabilitado equivale a encendido, y sin pasar por estado: ni un frame a
     oscuras ni un render de más para quien pidió no ver movimiento. */
  return entered || !enabled;
}
