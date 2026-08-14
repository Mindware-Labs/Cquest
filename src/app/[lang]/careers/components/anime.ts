"use client";

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import { createScope, cubicBezier, eases, type EasingFunction, type Scope } from "animejs";

/* Todo el movimiento del módulo de empleos corre sobre anime.js v4, y sale de
   aquí. El resto del sitio usa GSAP: mezclar las dos dentro de una misma
   sección es cómo se termina con dos dueños del mismo `transform`. */

export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Curvas del módulo. Espejan `--ease-out` y el muelle de los tokens, para que
   lo que anima anime y lo que anima CSS se muevan con la misma mano.

   Funciones y no cadenas: anime v4 sacó del core el parseo de "cubicBezier(...)"
   y avisa por consola en cada tween si se le pasa el string. */
export const EASE: EasingFunction = cubicBezier(0.22, 1, 0.36, 1);
export const EASE_SNAP: EasingFunction = eases.outBack(1.7);

/** Un `Scope` de anime por componente: registra cada animación creada dentro y
    las revierte todas al desmontar, incluidos los observadores de scroll. */
export function useAnimeScope(
  root: RefObject<HTMLElement | null>,
  setup: (scope?: Scope) => void,
  deps: DependencyList = [],
) {
  useIsomorphicLayoutEffect(() => {
    if (!root.current) return;
    const scope = createScope({ root: root as RefObject<HTMLElement> }).add(setup);
    return () => {
      scope.revert();
    };
  }, deps);
}
