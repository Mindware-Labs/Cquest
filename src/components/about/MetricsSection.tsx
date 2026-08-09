"use client";

import { motion } from "motion/react";
import { useCallback, useRef } from "react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, focusRiseVariants, groupVariants, ruleYVariants, statCardVariants, statLineVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { useCountUp } from "@/hooks/useCountUp";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { gsap } from "@/lib/gsap";
import { ABOUT_METRICS, TEAM_HR_NOTE } from "./data";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import styles from "./MetricsSection.module.css";

const COPY = {
  en: {
    eyebrow: "Our team",
    heading: "The team behind the operation.",
    cta: "Meet the team",
    photoLabel: "Team photo — coming soon",
  },
  es: {
    eyebrow: "Nuestro equipo",
    heading: "El equipo detrás de la operación.",
    cta: "Conoce al equipo",
    photoLabel: "Fotografía del equipo — próximamente",
  },
};

function MetricValue({ value, suffix, reduced }: { value: number; suffix: string; reduced: boolean }) {
  const format = useCallback((n: number) => `${n}${suffix}`, [suffix]);
  const { ref, initial } = useCountUp<HTMLElement>(value, { reduced, format });
  return <dd ref={ref}>{initial}</dd>;
}

export default function MetricsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (reduced || !fieldRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fieldRef.current,
        { yPercent: -3.5 },
        {
          yPercent: 3.5,
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
    <section id="metrics" ref={sectionRef} className={styles.metricsSection}>

      <div aria-hidden className={styles.field}>
        <span ref={fieldRef} className={styles.fieldGrid} />
      </div>
      <div aria-hidden className={styles.vignette} />
      <div aria-hidden className={`${styles.grain} cq-noise`} />

      <div className={`${container.container} ${styles.inner}`}>

        <div className={styles.lede}>
          <motion.div
            className={styles.metricsHeading}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <motion.div className={styles.metricsHeadingCopy} variants={stepVariants}>
              <motion.span className={styles.metricsRule} aria-hidden variants={ruleYVariants} />
              <motion.span className={styles.eyebrow} variants={focusRiseVariants}>
                {t.eyebrow}
              </motion.span>
              <motion.h2 variants={focusRiseVariants}>{t.heading}</motion.h2>
              <motion.p className={styles.lead} variants={focusRiseVariants}>
                {TEAM_HR_NOTE[lang]}
              </motion.p>
              <motion.div variants={focusRiseVariants}>
                <LocalizedLink href="/team" className={styles.cta}>
                  {t.cta} <Arrow />
                </LocalizedLink>
              </motion.div>
            </motion.div>
          </motion.div>

          <div className={styles.figure}>
            <motion.div
              className={styles.photoFrame}
              initial={reduced ? false : { opacity: 0, scale: 0.97 }}
              whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              <span aria-hidden className={styles.photoFrameCorner} data-corner="tl" />
              <span aria-hidden className={styles.photoFrameCorner} data-corner="tr" />
              <span aria-hidden className={styles.photoFrameCorner} data-corner="bl" />
              <span aria-hidden className={styles.photoFrameCorner} data-corner="br" />
              <svg
                aria-hidden
                className={styles.photoFrameIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
                <circle cx="8.5" cy="10" r="1.75" />
                <path d="M21 15.5 15.6 10.6a1.6 1.6 0 0 0-2.15.02L6 17" />
              </svg>
              <span className={styles.photoFrameLabel}>{t.photoLabel}</span>
            </motion.div>
          </div>
        </div>
        <motion.dl
          className={styles.metricList}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {ABOUT_METRICS.map((metric) => (
            <motion.div key={metric.id} variants={statCardVariants}>
              <motion.dt variants={statLineVariants}>

                <motion.span aria-hidden className={styles.riser} variants={ruleYVariants} />
                {metric.label[lang]}
              </motion.dt>
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
