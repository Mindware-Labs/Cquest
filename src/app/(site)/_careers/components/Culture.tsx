"use client";

import { useRef } from "react";
import { animate, createTimeline, onScroll, stagger } from "animejs";
import container from "@/components/services/Container.module.css";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { EASE, EASE_SNAP, useAnimeScope } from "./anime";
import type { EasingFunction } from "animejs";
import styles from "./sections.module.css";

/* Se retiró el bloque "Lo que ofrecemos": esos beneficios no estaban
   confirmados y en la página se leían como una promesa formal de la empresa.
   Si Recursos Humanos valida una lista real, vuelve aquí. */
const PILLARS: readonly { icon: ServiceIconName; title: string; body: string }[] = [
  {
    icon: "userplus",
    title: "We hire attitude, we train skill",
    body: "Most of our agents start with no call center experience. Training is paid, certified and part of the job from day one.",
  },
  {
    icon: "trend",
    title: "Promotion from the floor",
    body: "Supervisors, quality analysts and trainers came out of the operation. Every opening is posted internally first.",
  },
  {
    icon: "shield",
    title: "A real schedule, a real contract",
    body: "Formal contract, social security and a shift you know in advance. No surprises at the end of the month.",
  },
];

const COPY = {
  eyebrow: "Why Center Quest",
  title: ["A place that", "trains you."] as const,
  lead: "We run operations for banks, health providers, retailers and telecoms. That means structure, standards and a career path that does not depend on who you know.",
};

export default function Culture({ reduced }: { reduced: boolean }) {
  const t = COPY;
  const root = useRef<HTMLElement>(null);

  useAnimeScope(
    root,
    () => {
      if (reduced) return;

      createTimeline({
        defaults: { ease: EASE },
        /* `onScroll` de anime en vez de un IntersectionObserver propio: la
           línea de disparo queda declarada junto a la animación. */
        autoplay: onScroll({ enter: "bottom-=80 top", sync: "play", repeat: false }),
      })
        .add(`.${styles.head} > *`, { opacity: [0, 1], y: [20, 0], duration: 700, delay: stagger(80) })
        .add(
          `.${styles.pillar}`,
          { opacity: [0, 1], y: [30, 0], duration: 760, delay: stagger(110) },
          "-=450",
        )
        /* La regla superior de cada card se dibuja de izquierda a derecha justo
           cuando la card ya está en su sitio: primero llega el bloque, después
           se firma. */
        .add(
          `.${styles.pillarRule}`,
          { scaleX: [0, 1], duration: 620, delay: stagger(110) },
          "-=560",
        );
    },
    [reduced],
  );

  /* El salto en hover. `outBack` sobrepasa y vuelve — eso es lo que se lee como
     salto y no como desplazamiento; la salida usa la curva normal, porque
     rebotar también al soltar convierte la sección en un juguete. */
  const lift = (value: number, ease: EasingFunction) => (event: React.PointerEvent<HTMLLIElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    animate(event.currentTarget, { y: value, duration: value ? 420 : 500, ease });
  };

  return (
    <section id="culture" ref={root} className={styles.section}>
      <div className={container.container}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h2 className={styles.title}>
            {t.title[0]} <strong>{t.title[1]}</strong>
          </h2>
          <p className={styles.lead}>{t.lead}</p>
        </div>

        <ul className={styles.pillars}>
          {PILLARS.map((pillar) => (
            <li
              key={pillar.title}
              className={styles.pillar}
              onPointerEnter={lift(-10, EASE_SNAP)}
              onPointerLeave={lift(0, EASE)}
            >
              <span aria-hidden className={styles.pillarRule} />
              <span className={styles.pillarIcon}>
                <ServiceIcon name={pillar.icon} />
              </span>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarBody}>{pillar.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
