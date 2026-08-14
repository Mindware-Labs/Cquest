"use client";

import { useRef } from "react";
import { createTimeline, onScroll, stagger } from "animejs";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { EASE, EASE_SNAP, useAnimeScope } from "./anime";
import styles from "./sections.module.css";

const COPY = {
  en: {
    title: ["No opening fits you today?", "Send your CV anyway."],
    lead: "We open positions across the operation all year. Your CV goes into our talent pool and Human Resources looks at it first when a role that fits you opens.",
    cta: "Join the talent pool",
  },
  es: {
    title: ["¿Ninguna vacante te calza hoy?", "Envíanos tu CV igual."],
    lead: "Abrimos posiciones en toda la operación durante el año. Tu CV entra a nuestro banco de talento y Recursos Humanos lo revisa primero cuando sale un rol que te calce.",
    cta: "Entrar al banco de talento",
  },
};

export default function TalentPool({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
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
        <LocalizedLink href="/careers/apply" className={styles.bandCta}>
          {t.cta} <Arrow />
        </LocalizedLink>
      </div>
    </section>
  );
}
