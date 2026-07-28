"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import SpotlightCard from "@/components/ui/SpotlightCard";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, statCardVariants, statLineVariants, VIEWPORT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { CQ_EASE_SNAP, gsap } from "@/lib/gsap";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import styles from "./PillarsSection.module.css";

const ACCENTS = ["var(--ab-petroleo)", "var(--ab-celeste)", "var(--ab-verde)"] as const;

const COPY = {
  en: {
    heading: "What we stand for",
    description: "Three sentences that decide how every account gets run, before a single agent picks up a call.",
    cards: [
      {
        id: "mission",
        icon: "trend" as ServiceIconName,
        title: "Mission",
        body: "Help Dominican businesses grow by running the operations behind them — with trained people, real technology and support that doesn't disappear after the sale.",
      },
      {
        id: "vision",
        icon: "brain" as ServiceIconName,
        title: "Vision",
        body: "To be the operations partner Dominican and US companies default to — turning every client's vision into results they can measure, not just promises.",
      },
      {
        id: "values",
        icon: "shield" as ServiceIconName,
        title: "Values",
        body: "Four commitments carried into every account, detailed below.",
      },
    ],
  },
  es: {
    heading: "En qué creemos",
    description: "Tres frases que definen cómo se gestiona cada cuenta, antes de que un agente atienda la primera llamada.",
    cards: [
      {
        id: "mission",
        icon: "trend" as ServiceIconName,
        title: "Misión",
        body: "Ayudar a que las empresas dominicanas crezcan gestionando la operación detrás de ellas — con gente capacitada, tecnología real y soporte que no desaparece después de la venta.",
      },
      {
        id: "vision",
        icon: "brain" as ServiceIconName,
        title: "Visión",
        body: "Ser el aliado operativo al que recurren por defecto las empresas dominicanas y estadounidenses — convirtiendo la visión de cada cliente en resultados medibles, no solo promesas.",
      },
      {
        id: "values",
        icon: "shield" as ServiceIconName,
        title: "Valores",
        body: "Cuatro compromisos que llevamos a cada cuenta, detallados más abajo.",
      },
    ],
  },
};

export default function PillarsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (reduced || !gridRef.current) return;
    const ctx = gsap.context(() => {
      const icons = gsap.utils.toArray<HTMLElement>(`.${styles.pillarIcon}`, gridRef.current);
      gsap.fromTo(
        icons,
        { rotate: -60, scale: 0.4, autoAlpha: 0 },
        {
          rotate: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.6,
          ease: CQ_EASE_SNAP,
          stagger: 0.12,
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", once: true },
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (reduced || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        auraRef.current,
        { yPercent: -10, scale: 0.92 },
        {
          yPercent: 10,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: SCRUB,
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="pillars" ref={sectionRef} className={styles.pillarsSection}>
      {!reduced && (
        <span aria-hidden className={styles.pillarsAura}>
          <span ref={auraRef} className={styles.pillarsAuraLight} />
        </span>
      )}
      <div className={container.container}>
        <SectionIntro title={t.heading} description={t.description} reduced={reduced} rule={false} />
        <motion.div
          ref={gridRef}
          className={styles.pillarGrid}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {t.cards.map((card, index) => (
            <motion.div key={card.id} variants={statCardVariants}>
              <SpotlightCard className={styles.pillarCard} reduced={reduced} glowColor={ACCENTS[index]}>
                <span aria-hidden className={styles.pillarIndex}>{String(index + 1).padStart(2, "0")}</span>
                <motion.span className={styles.pillarIcon} variants={focusRiseVariants}>
                  <ServiceIcon name={card.icon} />
                </motion.span>
                <motion.h3 variants={statLineVariants}>{card.title}</motion.h3>
                <motion.p variants={statLineVariants}>{card.body}</motion.p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
