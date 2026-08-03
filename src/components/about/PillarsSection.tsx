"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import type { ServiceIconName } from "@/components/services/data";
import { Particles } from "@/components/ui/particles";
import SpotlightCard from "@/components/ui/SpotlightCard";
import container from "@/components/services/Container.module.css";
import { VIEWPORT } from "@/components/services/motion";
import type { Variants } from "motion/react";
import { useI18n } from "@/i18n/I18nProvider";
import { gsap } from "@/lib/gsap";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import styles from "./PillarsSection.module.css";

const ACCENTS = ["var(--ab-petroleo)", "var(--ab-celeste)", "var(--ab-verde)"] as const;

// A lighter entrance than the shared `dropCardVariants`: no rotation, no
// spring overshoot — the card rises gently from below and settles, then
// the next one starts a beat later. Reads as the section "building itself"
// rather than cards being dropped onto the page.
const liftGroupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const liftCardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

// The stroke-draw itself needs `motion.path`/`motion.circle` — the shared
// `ServiceIcon` renders plain static SVG elements, reused across every
// service page, so redrawing it there would ripple into sections that never
// asked for this. These three pillars get their own draw-capable copy
// instead, geometry lifted straight from `ServiceIcon`'s "flag-mountain",
// "eye" and "diamond" entries so they stay pixel-identical to the rest of
// the site's icon set.
const DRAW_ICONS: Record<string, { paths?: string[]; circle?: { cx: number; cy: number; r: number } }> = {
  mission: { paths: ["M3 20 9.5 8l3.2 5.5L15.5 9 21 20Z", "M9.5 8 12 4l1.3 2.3"] },
  vision: { paths: ["M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"], circle: { cx: 12, cy: 12, r: 3 } },
  values: { paths: ["M4.5 9 8 4h8l3.5 5-7.5 11Z", "M4.5 9h15M8 4l1.5 5L12 20l2.5-11L16 4M8 4l-3.5 5M16 4l3.5 5"] },
};

// Each stroke draws in (pathLength 0 → 1) once the card has landed — delay
// clears the 0.8s lift — with the second stroke of a two-part icon following
// a beat behind the first, so it reads as one continuous pen stroke rather
// than the whole icon fading in at once. Inherits "visible" from the parent
// stagger automatically — no separate viewport trigger needed.
const drawVariants = (order: number): Variants => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.6, delay: 0.45 + order * 0.25, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.15, delay: 0.45 + order * 0.25 } },
  },
});

function DrawIcon({ id }: { id: string }) {
  const icon = DRAW_ICONS[id];
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {icon.paths?.map((d, i) => <motion.path key={d} d={d} variants={drawVariants(i)} />)}
      {icon.circle && <motion.circle cx={icon.circle.cx} cy={icon.circle.cy} r={icon.circle.r} variants={drawVariants(icon.paths?.length ?? 0)} />}
    </svg>
  );
}

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
        <SectionIntro title={t.heading} description={t.description} reduced={reduced} rule accentColor="var(--ab-verde)" />
        {/* The drop lives on this wrapper, not on `.pillarCard`: the card owns a
            CSS hover lift (`translate: 0 -4px`), and an inline transform left
            behind by the reveal would outrank it. Same anchor/card split the
            quote card and the diagram nodes use. */}
        <motion.div
          className={styles.pillarGrid}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={liftGroupVariants}
        >
          {t.cards.map((card, index) => (
            <motion.div key={card.id} className={styles.pillarDrop} variants={liftCardVariants}>
              <SpotlightCard className={styles.pillarCard} reduced={reduced} glowColor={ACCENTS[index]}>
                <span className={styles.pillarIcon}>
                  <DrawIcon id={card.id} />
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
