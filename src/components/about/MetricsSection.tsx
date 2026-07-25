"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, ruleYVariants, statCardVariants, statLineVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { useCountUp } from "@/hooks/useCountUp";
import { useI18n } from "@/i18n/I18nProvider";
import { gsap } from "@/lib/gsap";
import { ABOUT_METRICS } from "./data";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import styles from "./MetricsSection.module.css";

const COPY = {
  en: { heading: "The team behind the operation." },
  es: { heading: "El equipo detrás de la operación." },
};

function MetricValue({ value, suffix, reduced }: { value: number; suffix: string; reduced: boolean }) {
  const { ref, value: animated } = useCountUp<HTMLDataElement>(value, { reduced });
  return (
    <dd ref={ref}>
      {animated}
      {suffix}
    </dd>
  );
}

export default function MetricsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  /* A single light sweeps left-to-right across the dark band as the section
     scrolls past — scrub-tied so it tracks scroll position, not a timer.

     Two refinements over a bare position sweep: the light now breathes wider
     as it crosses centre and narrows again on exit, and it fades up from and
     back to nothing at the band edges instead of hard-clipping at the
     section boundary — so it reads as a light source moving through the
     space rather than a gradient sliding across a box. The smoothed scrub
     gives it the same weight as Story's parallax; both lag and settle. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !glowRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: SCRUB,
        },
      });

      tl.fromTo(glowRef.current, { xPercent: -25 }, { xPercent: 125, duration: 1 }, 0)
        .fromTo(glowRef.current, { scaleX: 0.85 }, { scaleX: 1.25, duration: 0.5 }, 0)
        .to(glowRef.current, { scaleX: 0.85, duration: 0.5 }, 0.5)
        .fromTo(glowRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22 }, 0)
        .to(glowRef.current, { opacity: 0, duration: 0.22 }, 0.78);
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="metrics" ref={sectionRef} className={styles.metricsSection}>
      {!reduced && <div ref={glowRef} aria-hidden className={styles.metricsGlow} />}
      <div className={container.container}>
        <motion.div
          className={styles.metricsHeading}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div className={styles.metricsHeadingCopy} variants={stepVariants}>
            <motion.span className={styles.metricsRule} aria-hidden variants={ruleYVariants} />
            <motion.h2 variants={focusRiseVariants}>{t.heading}</motion.h2>
          </motion.div>
        </motion.div>
        <motion.dl
          className={styles.metricList}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {ABOUT_METRICS.map((metric) => (
            <motion.div key={metric.id} variants={statCardVariants}>
              <motion.dt variants={statLineVariants}>{metric.label[lang]}</motion.dt>
              <motion.div variants={statLineVariants}>
                <MetricValue value={metric.value} suffix={metric.suffix} reduced={reduced} />
              </motion.div>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
