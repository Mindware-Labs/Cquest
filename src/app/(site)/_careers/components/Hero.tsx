"use client";

import { useRef } from "react";
import { createTimeline, splitText, stagger } from "animejs";
import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { EASE, EASE_SNAP, useAnimeScope } from "./anime";
import { TransitionLink } from "@/components/TransitionLink";
import HeroBoard from "./HeroBoard";
import { useScrollParallax } from "./parallax";
import { CTA_HOVER, CTA_TAP, CTA_TRANSITION } from "./motion";
import styles from "./Hero.module.css";

const MotionLink = motion.create(TransitionLink);

/* Sin cifras: ni sedes, ni departamentos, ni conteo de vacantes. Nadie ha
   confirmado esos números y una portada de empleos que los afirma queda
   desmentida por el propio listado en cuanto Recursos Humanos publique el
   contenido real. Lo único que se afirma aquí es lo que sí es cierto: dónde
   se trabaja y que la formación corre por nuestra cuenta. */
const COPY = {
  eyebrow: "Careers at Center Quest",
  title: ["Your first job", "or your next one."] as const,
  lead: "We hire in Santo Domingo — from entry-level agents with no experience to the specialists who run the operation. If you want to grow, this is a place that trains you.",
  openings: "See open positions",
  talent: "Send your CV",
};

export default function Hero({ reduced }: { reduced: boolean }) {
  const t = COPY;
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  /* El titular se parte en palabras y cada una sube desde detrás de su propia
     línea, como un telón por palabra. Es el gesto más fuerte de la página y
     está donde debe estar: la primera frase que se lee.

     `accessible` deja el texto original para lectores de pantalla, así que
     partirlo no cuesta semántica. */
  useAnimeScope(
    root,
    () => {
      if (reduced) return;

      const headline = splitText(`.${styles.headline}`, {
        words: { wrap: "clip" },
        chars: false,
        accessible: true,
      });

      createTimeline({ defaults: { ease: EASE } })
        /* El eyebrow no aparece: se destapa. La regla barre de izquierda a
           derecha por delante del texto y lo deja escrito detrás. */
        .add(`.${styles.eyebrowRule}`, { scaleX: [0, 1], duration: 620 })
        .add(`.${styles.eyebrow}`, { opacity: [0, 1], y: [18, 0], duration: 560 }, "-=380")
        /* 135% y no 112%: con el respiro que `.headline span` añade al área de
           recorte, a 112% asomaba el borde de arriba de la palabra antes de
           empezar a subir. El escalonado abierto es lo que hace que se lea como
           un telón por palabra y no como una línea entera moviéndose. */
        .add(
          headline.words,
          { y: ["135%", "0%"], duration: 1150, delay: stagger(95) },
          "-=420",
        )
        .add(
          `.${styles.lead}`,
          { opacity: [0, 1], y: [30, 0], duration: 820 },
          "-=760",
        )
        /* La fila de CTA rebota al llegar: es el último gesto del hero y el que
           tiene que empujar al clic, así que va con overshoot y no con salida
           suave como el resto.

           Se anima el CONTENEDOR y no los dos botones: el `transform` de cada
           botón es de Motion (hover y tap), y dos librerías escribiendo el
           mismo valor dejan el botón torcido en cuanto el puntero llega antes
           de que termine la entrada. */
        .add(
          `.${styles.actions}`,
          { opacity: [0, 1], y: [34, 0], duration: 820, ease: EASE_SNAP },
          "-=620",
        );
    },
    [reduced],
  );

  /* Las dos columnas del hero se separan al hacer scroll: el panel sube casi el
     triple que el texto y se va encogiendo. Es lo que da profundidad a la
     portada sin una foto de fondo. */
  useScrollParallax(
    root,
    [
      { ref: copy, distance: -60, opacity: 0.35 },
      { ref: stage, distance: -150, scale: 0.94, opacity: 0.5 },
    ],
    !reduced,
  );

  return (
    <header ref={root} data-hero-boundary className={styles.hero}>
      <div className={`${container.container} ${styles.layout}`}>
        <div ref={copy} className={styles.copy}>
          <span className={styles.eyebrowLine}>
            <span aria-hidden className={styles.eyebrowRule} />
            <span className={styles.eyebrow}>{t.eyebrow}</span>
          </span>
          <h1 className={styles.headline}>
            <span>{t.title[0]}</span>
            <strong>{t.title[1]}</strong>
          </h1>
          <p className={styles.lead}>{t.lead}</p>

          <div className={styles.actions}>
            <motion.a
              href="#openings"
              className={styles.primaryCta}
              whileHover={reduced ? undefined : CTA_HOVER}
              whileTap={reduced ? undefined : CTA_TAP}
              transition={CTA_TRANSITION}
            >
              {t.openings} <Arrow direction="down" />
            </motion.a>
            <MotionLink
              href="/careers/apply"
              className={styles.secondaryCta}
              whileHover={reduced ? undefined : CTA_HOVER}
              whileTap={reduced ? undefined : CTA_TAP}
              transition={CTA_TRANSITION}
            >
              {t.talent} <Arrow />
            </MotionLink>
          </div>
        </div>

        <div ref={stage} className={styles.stage}>
          <HeroBoard reduced={reduced} />
        </div>
      </div>
    </header>
  );
}
