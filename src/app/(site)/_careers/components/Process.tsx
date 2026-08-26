"use client";

import { useRef } from "react";
import { animate, createTimeline, onScroll, stagger } from "animejs";
import container from "@/components/services/Container.module.css";
import { EASE, EASE_SNAP, useAnimeScope } from "./anime";
import type { EasingFunction } from "animejs";
import styles from "./sections.module.css";

/* PENDIENTE de confirmar con Recursos Humanos: los tiempos de cada paso. */
const STEPS = [
  { title: "You apply", body: "One screen, nine fields and your CV. No account to create.", meta: "2 minutes" },
  { title: "We review", body: "Human Resources reads every application and matches it against the openings we have live.", meta: "3–5 business days" },
  { title: "Interview and assessment", body: "A conversation plus a short language and typing assessment for floor roles.", meta: "1 week" },
  { title: "Offer and onboarding", body: "Formal contract, paid training and your first class with the operation.", meta: "2 weeks" },
];

const COPY = {
  eyebrow: "Hiring process",
  title: ["Four steps.", "No black box."] as const,
  lead: "You always know where your application stands and what comes next.",
};

export default function Process({ reduced }: { reduced: boolean }) {
  const t = COPY;
  const root = useRef<HTMLElement>(null);

  /* El riel se dibuja como se lee el proceso: primero la línea avanza de
     principio a fin, y sobre ella cada rama baja hasta su cuadro justo antes de
     que el cuadro aparezca. El movimiento ES el diagrama — por eso la línea,
     los nodos y las ramas se animan por separado y no como un bloque. */
  useAnimeScope(
    root,
    () => {
      if (reduced) return;

      createTimeline({
        defaults: { ease: EASE },
        /* onScroll de anime en vez de un observer propio: la línea de disparo
           queda declarada junto a la animación que dispara. */
        autoplay: onScroll({ enter: "bottom-=80 top", sync: "play", repeat: false }),
      })
        .add(`.${styles.head} > *`, { opacity: [0, 1], y: [20, 0], duration: 700, delay: stagger(80) })
        /* Los DOS ejes: en desktop el riel es horizontal y en móvil vertical.
           Escalar el eje que no dibuja es un no-op sobre una línea de 1px, así
           que la misma animación sirve para las dos orientaciones. */
        .add(`.${styles.railLine}`, { scaleX: [0, 1], scaleY: [0, 1], duration: 1100 }, "-=350")
        .add(
          `.${styles.stepNode}`,
          { scale: [0, 1], duration: 420, ease: EASE_SNAP, delay: stagger(170) },
          "-=900",
        )
        .add(
          `.${styles.stepBranch}`,
          { scaleX: [0, 1], scaleY: [0, 1], duration: 380, delay: stagger(170) },
          "-=1000",
        )
        .add(
          `.${styles.stepBox}`,
          { opacity: [0, 1], y: [16, 0], duration: 620, delay: stagger(170) },
          "-=900",
        );

      /* Después del dibujo, el riel queda vivo: un punto de luz lo recorre de
         principio a fin cada pocos segundos. Un latido, no un parpadeo. */
      animate(`.${styles.railPulse}`, {
        left: ["0%", "100%"],
        opacity: [
          { to: 1, duration: 260 },
          { to: 1, duration: 2600 },
          { to: 0, duration: 340 },
        ],
        duration: 3200,
        delay: 2200,
        loop: true,
        loopDelay: 2400,
        ease: "inOutQuad",
      });
    },
    [reduced],
  );

  const lift = (value: number, ease: EasingFunction) => (event: React.PointerEvent<HTMLLIElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    animate(event.currentTarget, { y: value, duration: value ? 420 : 500, ease });
  };

  return (
    <section id="process" ref={root} className={styles.section}>
      <div className={container.container}>
        <div className={`${styles.head} ${styles.headCentered}`}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h2 className={styles.title}>
            {t.title[0]} <strong>{t.title[1]}</strong>
          </h2>
          <p className={styles.lead}>{t.lead}</p>
        </div>

        {/* La línea, los nodos y las ramas son decoración: el orden real lo
            lleva el <ol>, que es lo que anuncia un lector de pantalla. */}
        <div className={styles.rail}>
          <span aria-hidden className={styles.railLine} />
          <span aria-hidden className={styles.railPulse} />

          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className={styles.step}
                onPointerEnter={lift(-8, EASE_SNAP)}
                onPointerLeave={lift(0, EASE)}
              >
                <span aria-hidden className={styles.stepNode} />
                <span aria-hidden className={styles.stepBranch} />
                <div className={styles.stepBox}>
                  <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                  <p className={styles.stepMeta}>{step.meta}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
