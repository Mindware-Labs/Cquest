"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import SpotlightCard from "@/components/ui/SpotlightCard";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, VIEWPORT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { CQ_EASE_SNAP, gsap } from "@/lib/gsap";
import { ABOUT_SECTORS } from "./data";
import { useIsomorphicLayoutEffect } from "./motion";
import styles from "./SectorsSection.module.css";

const COPY = {
  en: {
    heading: "Sectors we specialize in",
    description: "The industries whose volume, compliance and customer-experience needs shape how we design an operation.",
  },
  es: {
    heading: "Sectores en los que nos especializamos",
    description: "Las industrias cuyas necesidades de volumen, cumplimiento y experiencia de cliente definen cómo diseñamos una operación.",
  },
};

export default function SectorsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const gridRef = useRef<HTMLUListElement>(null);

  /* Icons rotate in from a partial turn with a snap — the grid's one
     "showpiece" flourish; the card and label still land on the shared
     focusRiseVariants blur/rise a beat earlier.

     Previously on `elastic.out`, whose multi-bounce wobble belonged to no
     other motion on the page. Now on the same overshoot ease as the Team
     chips (CQ_EASE_SNAP) with a shorter arc, so both small-element
     flourishes read as the same gesture applied twice — punctuation in one
     motion language, not two competing personalities. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !gridRef.current) return;
    const ctx = gsap.context(() => {
      // Scoped explicitly — gsap.context() scopes selector text handed to a
      // tween, but gsap.utils.toArray() queries the document on its own.
      const icons = gsap.utils.toArray<HTMLElement>(`.${styles.sectorIcon}`, gridRef.current);
      gsap.fromTo(
        icons,
        { rotate: -70, scale: 0.45, autoAlpha: 0 },
        {
          rotate: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.62,
          ease: CQ_EASE_SNAP,
          stagger: { each: 0.075, from: "start" },
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", once: true },
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="sectors" className={styles.sectorsSection}>
      <div className={container.container}>
        {/* No accent rule, matching Story. `accentColor` goes with it — the
            grid's own petroleo (icons, spotlight glow) carries the accent. */}
        <SectionIntro title={t.heading} description={t.description} reduced={reduced} rule={false} />
        <motion.ul
          ref={gridRef}
          className={styles.sectorGrid}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {ABOUT_SECTORS.map((sector) => (
            <motion.li key={sector.id} variants={focusRiseVariants}>
              <SpotlightCard className={styles.sectorCard} reduced={reduced} glowColor="var(--ab-petroleo)">
                <span className={styles.sectorIcon}><ServiceIcon name={sector.icon} /></span>
                <span className={styles.sectorLabel}>{sector.label[lang]}</span>
              </SpotlightCard>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
