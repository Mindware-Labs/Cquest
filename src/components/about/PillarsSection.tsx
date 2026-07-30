"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { Particles } from "@/components/ui/particles";
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
    description: "",
    cards: [
      {
        id: "mission",
        icon: "flag-mountain" as ServiceIconName,
        title: "Mission",
        body: "Help businesses grow by running the operations behind them, with trained people, real technology and support that doesn't disappear after the sale.",
      },
      {
        id: "vision",
        icon: "eye" as ServiceIconName,
        title: "Vision",
        body: "To be the operations partner companies default to, turning every client's vision into results they can measure, not just promises.",
      },
      {
        id: "values",
        icon: "diamond" as ServiceIconName,
        title: "Values",
        body: "The principles that shape how our teams are trained, how performance is tracked, and how we communicate, detailed above.",
      },
    ],
  },
  es: {
    heading: "En qué creemos",
    description: "",
    cards: [
      {
        id: "mission",
        icon: "flag-mountain" as ServiceIconName,
        title: "Misión",
        body: "Ayudar a que las empresas crezcan gestionando la operación detrás de ellas, con gente capacitada, tecnología real y soporte que no desaparece después de la venta.",
      },
      {
        id: "vision",
        icon: "eye" as ServiceIconName,
        title: "Visión",
        body: "Ser el aliado operativo al que recurren por defecto las empresas, convirtiendo la visión de cada cliente en resultados medibles, no solo promesas.",
      },
      {
        id: "values",
        icon: "diamond" as ServiceIconName,
        title: "Valores",
        body: "Los principios que definen cómo formamos a nuestros equipos, cómo medimos el desempeño y cómo nos comunicamos, detallados arriba.",
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
          <Particles className={styles.pillarsParticles} quantity={150} staticity={30} ease={50} size={1.3} color="#74c3d5" />
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
