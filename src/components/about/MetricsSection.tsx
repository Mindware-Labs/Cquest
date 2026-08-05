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

/* The lead is TEAM_HR_NOTE verbatim — already-approved client copy about the
   people behind the operation, which is exactly what this band is now for.
   Nothing here describes the department STRUCTURE: that does not exist yet
   (see MEMORY: seccion-equipo), and the /team page it links to is explicit
   about its own placeholder status. */
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

/* The suffix is folded into the hook's formatter rather than sitting beside
   the number as its own node: the count-up writes the element's text
   directly now, so number and suffix have to be produced together. Same
   rendered string either way. */
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

  /* The hairline field drifts a few percent against the page as the band
     scrolls past. This replaces a light that swept the full width of the
     section on the same scrub — the sweep had to travel 150% of the band to
     read at all, which is what made it a moving object rather than lighting.
     A field that shifts slightly behind stationary type gives the same depth
     cue with nothing crossing the frame.

     `ease: "none"` because it is scrubbed: any easing here fights the finger.
     Bounded to ±3.5% — inside the 12% of bleed the grid carries, so the
     drift can never expose an edge inside the mask. */
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
      {/* Backdrop, bottom to top: the framed hairline field, the corner
          falloff that turns the band into a lit stage, and the grain tile the
          hero and the carousel already share. All static paints — the only
          thing that moves is the grid inside the field's mask. */}
      <div aria-hidden className={styles.field}>
        <span ref={fieldRef} className={styles.fieldGrid} />
      </div>
      <div aria-hidden className={styles.vignette} />
      <div aria-hidden className={`${styles.grain} cq-noise`} />

      <div className={`${container.container} ${styles.inner}`}>
        {/* Copy on the left, an empty photo frame on the right — honest
            placeholder for the team photograph that has not been shot yet,
            rather than an invented diagram standing in for it. */}
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
                {/* ── The riser ────────────────────────────────────────
                    A hairline dropping onto a junction dot, the same mark
                    the metric list's top rule carries elsewhere in this
                    band — what turns the empty middle from padding into a
                    distance the layout is deliberately crossing.

                    It lives inside the <dt> because a <div> grouping inside
                    a <dl> may contain nothing but dt/dd; absolute
                    positioning resolves it against the cell regardless, so
                    the nesting costs the layout nothing. */}
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
