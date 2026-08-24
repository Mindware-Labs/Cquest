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

// Envuelve contenido de servidor y lo busca por atributos `data-`: el HTML lo sigue armando el servidor, acá vive sólo el movimiento.
export default function BlogIndexMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      // Todo el movimiento cuelga de esta condición: con "reducir movimiento" activado no se registra ni un tween.
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const title = root.querySelector<HTMLElement>("[data-blog-title]");
        const lead = root.querySelector<HTMLElement>("[data-blog-lead]");
        const rail = root.querySelector<HTMLElement>("[data-blog-rail]");
        const cover = root.querySelector<HTMLElement>("[data-blog-cover]");
        const coverImage = root.querySelector<HTMLElement>("[data-blog-cover-media]");
        const featuredMeta = gsap.utils.toArray<HTMLElement>("[data-blog-featured-line]", root);

        // Estado inicial fijado en JS y no en CSS: si el script falla o no llega, el CSS nunca escondió nada.
        if (lead) gsap.set(lead, { opacity: 0, y: 14 });
        if (rail) gsap.set(rail, { opacity: 0, y: 10 });
        if (cover) gsap.set(cover, { clipPath: CLIP_HIDDEN });
        if (coverImage) gsap.set(coverImage, { scale: 1.12 });
        if (featuredMeta.length) gsap.set(featuredMeta, { opacity: 0, y: 12 });

        let split: SplitText | undefined;
        let timeline: gsap.core.Timeline | undefined;
        let cancelled = false;

        // El titular se parte en líneas: cada una sube desde su propia máscara, dando orden de lectura que un fundido del bloque entero no daría.
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
              stagger: 0.075,
            });
          }

          if (lead) {
            timeline.to(
              lead,
              { opacity: 1, y: 0, duration: BLOG_DURATION.reveal, clearProps: "transform" },
              "-=0.62",
            );
          }

          if (rail) {
            timeline.to(
              rail,
              { opacity: 1, y: 0, duration: BLOG_DURATION.state, clearProps: "transform" },
              "-=0.45",
            );
          }

          // Cover y su imagen se mueven en sentidos opuestos a la misma velocidad: la foto parece quieta detrás de una ventana que se abre, no una caja que crece.
          if (cover) {
            timeline.to(
              cover,
              { clipPath: CLIP_SHOWN, duration: 1.05, clearProps: "clipPath" },
              "-=0.5",
            );
          }

          if (coverImage) {
            timeline.to(
              coverImage,
              { scale: 1, duration: 1.15, clearProps: "transform" },
              "<",
            );
          }

          if (featuredMeta.length) {
            timeline.to(
              featuredMeta,
              {
                opacity: 1,
                y: 0,
                duration: BLOG_DURATION.reveal,
                stagger: 0.07,
                clearProps: "transform",
              },
              "-=0.72",
            );
          }

          // Vuelve a ser un <h1> normal al terminar: dejar la estructura de líneas puesta rompe el corte de palabras al redimensionar y estorba al lector de pantalla.
          timeline.eventCallback("onComplete", () => split?.revert());
        });

        // Las tarjetas entran al entrar en pantalla y no al cargar: si no, todo lo que está debajo del pliegue ya terminó de animarse antes de que alguien lo vea.
        const cards = gsap.utils.toArray<HTMLElement>("[data-blog-card]", root);
        if (cards.length) {
          gsap.set(cards, { opacity: 0, y: 22 });
          ScrollTrigger.batch(cards, {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: BLOG_DURATION.reveal,
                ease: CQ_EASE,
                // Escalonado por tanda visible y no por índice en la grilla: la tercera fila no espera el retraso de las dos anteriores, que ya se vieron.
                stagger: 0.08,
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

  return <div ref={rootRef}>{children}</div>;
}
