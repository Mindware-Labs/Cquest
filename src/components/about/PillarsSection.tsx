"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { Particles } from "@/components/ui/particles";
import SpotlightCard from "@/components/ui/SpotlightCard";
import container from "@/components/services/Container.module.css";
import { dropCardVariants, dropGroupVariants, VIEWPORT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { gsap } from "@/lib/gsap";
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
        /* This card used to read "…detailed above", which made it a pointer to
           the commitments section rather than a card with content of its own —
           the one piece of copy in About that carried no information. It states
           where the principles are applied instead, which is the thing the
           numbered commitments above do NOT say. */
        body: "The principles we don't negotiate: who we hire, how we train them, and what we accept as done right. They're applied when we recruit, not framed on a wall.",
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
        body: "Los principios que no se negocian: a quién contratamos, cómo lo formamos y qué damos por bien hecho. Se aplican en la selección de personal, no en una pared.",
      },
    ],
  },
};

export default function PillarsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const auraRef = useRef<HTMLSpanElement>(null);

  /* The icons used to arrive on a GSAP timeline of their own — rotate −60°,
     scale 0.4, `back.out(1.7)` — on top of the `focusRiseVariants` that
     motion/react was already running on the same nodes. Two libraries owning
     opacity and transform on one element, which is the exact failure this
     codebase warns about elsewhere, and GSAP's inline transform also outranked
     the `scale: 1.08` the stylesheet applies to the icon on card hover.

     Both are gone. The card is what falls now, and a solid object's contents
     do not animate independently of it while it is in the air — the icon and
     the copy ride the card down, which is what makes it read as one thing
     landing rather than a container arriving with its parts assembling inside. */

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
        {/* The drop lives on this wrapper, not on `.pillarCard`: the card owns a
            CSS hover lift (`translate: 0 -4px`), and an inline transform left
            behind by the reveal would outrank it. Same anchor/card split the
            quote card and the diagram nodes use. */}
        <motion.div
          className={styles.pillarGrid}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={dropGroupVariants}
        >
          {t.cards.map((card, index) => (
            <motion.div key={card.id} className={styles.pillarDrop} variants={dropCardVariants}>
              <SpotlightCard className={styles.pillarCard} reduced={reduced} glowColor={ACCENTS[index]}>
                <span className={styles.pillarIcon}>
                  <ServiceIcon name={card.icon} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
