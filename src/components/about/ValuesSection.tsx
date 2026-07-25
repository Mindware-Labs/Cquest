"use client";

import { motion } from "motion/react";
import { useEffect, useRef, type PointerEvent } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import SpotlightCard from "@/components/ui/SpotlightCard";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, ruleXVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { gsap } from "@/lib/gsap";
import { ABOUT_VALUES } from "./data";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import styles from "./ValuesSection.module.css";

const COPY = {
  en: { heading: "How we operate", description: "The four commitments every account gets, regardless of size — read top to bottom, in the order they get built into an operation." },
  es: { heading: "Cómo operamos", description: "Los cuatro compromisos que recibe cada cuenta, sin importar el tamaño — en el orden en que se construyen dentro de una operación." },
};

// Icon follows the cursor a few pixels inside its circle — a restrained
// magnetic-pull micro-interaction, quickTo'd for a spring feel without
// re-triggering a full tween on every pointermove.
function MagneticIcon({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const moveRef = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  useEffect(() => {
    if (reduced || !ref.current) return;
    moveRef.current = {
      x: gsap.quickTo(ref.current, "x", { duration: 0.4, ease: "power3" }),
      y: gsap.quickTo(ref.current, "y", { duration: 0.4, ease: "power3" }),
    };
  }, [reduced]);

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    if (reduced || !ref.current || !moveRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    moveRef.current.x((event.clientX - rect.left - rect.width / 2) * 0.35);
    moveRef.current.y((event.clientY - rect.top - rect.height / 2) * 0.35);
  }

  function handlePointerLeave() {
    if (reduced || !moveRef.current) return;
    moveRef.current.x(0);
    moveRef.current.y(0);
  }

  return (
    <span ref={ref} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} className={styles.magneticIcon}>
      {children}
    </span>
  );
}

export default function ValuesSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  /* The blobs keep their own slow CSS drift (and its tab-visibility pause);
     this parallaxes the layer they live in, so scrolling adds depth without
     GSAP and the CSS keyframes fighting over the same transform. Result: the
     backdrop moves slower than the manifesto rows in front of it, which is
     what makes the section read as having a back wall at all. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !backdropRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
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
    <section id="values" ref={sectionRef} className={styles.valuesSection}>
      {/* Ambient backdrop only — its drift pauses with the rest of the page's
          always-on motion via #about[data-ambient-active="false"], and never
          renders at all under reduced motion. */}
      {!reduced && (
        <div ref={backdropRef} aria-hidden className={styles.valuesBackdrop}>
          <span className={`${styles.blob} ${styles.blobA}`} />
          <span className={`${styles.blob} ${styles.blobB}`} />
          <span className={styles.grain} />
        </div>
      )}
      <div className={container.container}>
        <motion.div
          className={styles.valuesHeading}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div className={styles.valuesHeadingCopy} variants={stepVariants}>
            <motion.span className={styles.valuesRule} aria-hidden variants={ruleXVariants} />
            <motion.h2 variants={focusRiseVariants}>{t.heading}</motion.h2>
          </motion.div>
          <motion.p variants={focusRiseVariants}>{t.description}</motion.p>
        </motion.div>

        <motion.ol
          className={styles.valueList}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {ABOUT_VALUES.map((value, index) => (
            <motion.li key={value.id} variants={focusRiseVariants}>
              <SpotlightCard className={styles.valueRow} reduced={reduced} glowColor="var(--ab-verde)">
                <span className={styles.valueIndex} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.valueIcon}>
                  <MagneticIcon reduced={reduced}>
                    <ServiceIcon name={value.icon} />
                  </MagneticIcon>
                </span>
                <span className={styles.valueCopy}>
                  <h3>{value.title[lang]}</h3>
                  <p>{value.description[lang]}</p>
                </span>
              </SpotlightCard>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
