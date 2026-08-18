"use client";

import type { RefObject } from "react";
import { useIsomorphicLayoutEffect } from "./anime";

/* GSAP entra al módulo de empleos por UNA razón concreta: el parallax del hero
   va atado a la posición del scroll, y eso es ScrollTrigger. anime.js sigue
   siendo el dueño de las entradas y de los hovers — aquí solo se mueven capas
   que anime NO anima (los contenedores), nunca los mismos nodos, para no tener
   dos librerías escribiendo el mismo `transform`.

   No se monta nada de Lenis: `SmoothScroll` ya tiene la instancia global metida
   en `gsap.ticker` y llamando a `ScrollTrigger.update` en cada scroll. Un
   segundo Lenis aquí sería el scroll duplicado. */

type Layer = {
  ref: RefObject<HTMLElement | null>;
  /** Desplazamiento vertical en px al recorrer el hero. Negativo = sube. */
  distance: number;
  /** Escala final. 1 deja el tamaño quieto. */
  scale?: number;
  /** Opacidad final. 1 deja la capa opaca. */
  opacity?: number;
};

/** Parallax de scroll sobre capas del hero. Desktop y puntero fino solamente:
    en móvil el trabajo por frame no compensa y el hero ya cabe en pantalla. */
export function useScrollParallax(
  trigger: RefObject<HTMLElement | null>,
  layers: Layer[],
  enabled: boolean,
) {
  useIsomorphicLayoutEffect(() => {
    if (!enabled || !trigger.current) return;

    const node = trigger.current;
    const targets = layers
      .map((layer) => ({ ...layer, el: layer.ref.current }))
      .filter((layer): layer is Layer & { el: HTMLElement } => Boolean(layer.el));

    if (targets.length === 0) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    /* Import dinámico: GSAP no entra al bundle inicial de la página de empleos,
       solo se descarga cuando el hero existe y la preferencia lo permite. */
    void import("@/lib/gsap").then(({ gsap }) => {
      if (cancelled) return;

      /* `matchMedia` revierte solo al cambiar de breakpoint y al hacer revert():
         mata sus tweens y sus ScrollTriggers sin que haya que listarlos. */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
        for (const target of targets) {
          gsap.to(target.el, {
            y: target.distance,
            scale: target.scale ?? 1,
            opacity: target.opacity ?? 1,
            ease: "none",
            scrollTrigger: {
              trigger: node,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [enabled]);
}
