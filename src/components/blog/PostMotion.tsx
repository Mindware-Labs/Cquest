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

// Coreografía del artículo: cabecera en orden de lectura, portada con el mismo gesto de descubrimiento que el índice, y barra de progreso como información (no adorno).
export default function PostMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      // Fuera de la condición de movimiento reducido: es un indicador de posición, no una animación; la mueve el scroll de la persona.
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

        // Los bloques del cuerpo entran sin escalonado: son párrafos sueltos, escalonarlos haría esperar al que ya lee el primero.
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
      {/* aria-hidden: duplica la barra de scroll del navegador, anunciarla en cada scroll sería ruido. */}
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
