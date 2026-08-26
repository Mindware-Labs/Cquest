"use client";

import { useRef } from "react";
import { createTimeline, onScroll, stagger } from "animejs";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { TransitionLink } from "@/components/TransitionLink";
import { EASE, EASE_SNAP, useAnimeScope } from "./anime";
import styles from "./sections.module.css";

const COPY = {
  title: ["No opening fits you today?", "Send your CV anyway."] as const,
  lead: "We open positions across the operation all year. Your CV goes into our talent pool and Human Resources looks at it first when a role that fits you opens.",
  cta: "Join the talent pool",
};

export default function TalentPool({ reduced }: { reduced: boolean }) {
  const t = COPY;
  const root = useRef<HTMLElement>(null);

  /* La banda oscura es el último empujón antes del FAQ: el texto entra y el
     botón llega después con un pequeño sobrepaso, para que el ojo termine ahí. */
  useAnimeScope(
    root,
    () => {
      if (reduced) return;
      createTimeline({
        defaults: { ease: EASE },
        autoplay: onScroll({ enter: "bottom-=100 top", sync: "play", repeat: false }),
      })
        .add(`.${styles.bandTitle}, .${styles.bandLead}`, {
          opacity: [0, 1],
          y: [22, 0],
          duration: 720,
          delay: stagger(90),
        })
        .add(
          `.${styles.bandCta}`,
          { opacity: [0, 1], scale: [0.92, 1], duration: 560, ease: EASE_SNAP },
          "-=380",
        );
    },
    [reduced],
  );

  return (
    <section ref={root} className={styles.band}>
      <div className={`${container.container} ${styles.bandLayout}`}>
        <div>
          <h2 className={styles.bandTitle}>
            {t.title[0]} <strong>{t.title[1]}</strong>
          </h2>
          <p className={styles.bandLead}>{t.lead}</p>
        </div>
        <TransitionLink href="/careers/apply" className={styles.bandCta}>
          {t.cta} <Arrow />
        </TransitionLink>
      </div>
    </section>
  );
}
