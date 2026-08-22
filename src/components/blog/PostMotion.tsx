"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, SplitText, CQ_EASE } from "@/lib/gsap";
import {
  BLOG_DURATION,
  CLIP_HIDDEN,
  CLIP_SHOWN,
  fontsReady,
  useIsoLayoutEffect,
} from "./motion";

/* Coreografía del artículo.
 *
 * Tres cosas, y ninguna decorativa:
 *   1. La cabecera entra en orden de lectura — categoría, título, extracto,
 *      firma— para que el ojo empiece donde tiene que empezar.
 *   2. La portada se descubre como en el índice: es el mismo gesto, y repetirlo
 *      es lo que hace que la sección se sienta una sola.
 *   3. La barra de progreso dice cuánto falta. En una página de lectura larga
 *      esa es información, no adorno: es lo único que responde "¿me meto ahora
 *      o lo dejo para después?". */
export default function PostMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      /* La barra de progreso vive fuera de la condición de movimiento reducido:
         no es una animación, es un indicador de posición. Alguien que pidió
         menos movimiento sigue queriendo saber cuánto le falta del artículo, y
         la barra no se mueve sola — la mueve el scroll de la persona. */
      const progress = progressRef.current;
      const body = root.querySelector<HTMLElement>("[data-post-body]");

      if (progress && body) {
        gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
        ScrollTrigger.create({
          trigger: body,
          start: "top 80%",
          end: "bottom bottom",
          onUpdate: (self) => gsap.set(progress, { scaleX: self.progress }),
        });
      }

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const title = root.querySelector<HTMLElement>("[data-post-title]");
        const lines = gsap.utils.toArray<HTMLElement>("[data-post-line]", root);
        const cover = root.querySelector<HTMLElement>("[data-post-cover]");
        const coverMedia = root.querySelector<HTMLElement>("[data-post-cover-media]");

        if (lines.length) gsap.set(lines, { opacity: 0, y: 14 });
        if (cover) gsap.set(cover, { clipPath: CLIP_HIDDEN });
        if (coverMedia) gsap.set(coverMedia, { scale: 1.1 });

        let split: SplitText | undefined;
        let timeline: gsap.core.Timeline | undefined;
        let cancelled = false;

        void fontsReady().then(() => {
          if (cancelled) return;

          if (title) {
            split = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "cq-line" });
            gsap.set(split.lines, { yPercent: 110 });
          }

          timeline = gsap.timeline({ defaults: { ease: CQ_EASE } });

          if (split?.lines.length) {
            timeline.to(split.lines, {
              yPercent: 0,
              duration: BLOG_DURATION.focal,
              stagger: 0.07,
            });
          }

          if (lines.length) {
            timeline.to(
              lines,
              {
                opacity: 1,
                y: 0,
                duration: BLOG_DURATION.reveal,
                stagger: 0.06,
                clearProps: "transform",
              },
              "-=0.7",
            );
          }

          if (cover) {
            timeline.to(
              cover,
              { clipPath: CLIP_SHOWN, duration: 1.05, clearProps: "clipPath" },
              "-=0.55",
            );
          }

          if (coverMedia) {
            timeline.to(coverMedia, { scale: 1, duration: 1.15, clearProps: "transform" }, "<");
          }

          timeline.eventCallback("onComplete", () => split?.revert());
        });

        /* Los bloques del cuerpo entran al llegar a pantalla, uno por uno y sin
           escalonado: no son una lista, son párrafos sueltos, y escalonarlos
           haría esperar al que ya está leyendo el primero. */
        const blocks = gsap.utils.toArray<HTMLElement>("[data-post-body] > *", root);
        if (blocks.length) {
          gsap.set(blocks, { opacity: 0, y: 18 });
          ScrollTrigger.batch(blocks, {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: BLOG_DURATION.state,
                ease: CQ_EASE,
                stagger: 0.05,
                clearProps: "transform",
              }),
          });
        }

        return () => {
          cancelled = true;
          timeline?.kill();
          split?.revert();
        };
      });

      return () => media.revert();
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef}>
      {/* Fija arriba de todo, por encima del navbar. 2px: suficiente para
          leerse de reojo, insuficiente para competir con nada.
          aria-hidden porque duplica información que ya da la barra de scroll
          del navegador; anunciarla en cada scroll sería ruido. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent"
      >
        <div ref={progressRef} className="h-full w-full origin-left bg-foreground" />
      </div>
      {children}
    </div>
  );
}
