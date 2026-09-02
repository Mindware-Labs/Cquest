"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useRef } from "react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, groupVariants, ruleYVariants, settleVariants, statCardVariants, statLineVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { useCountUp } from "@/hooks/useCountUp";
import { TransitionLink } from "@/components/TransitionLink";
import { gsap } from "@/lib/gsap";
import { ABOUT_METRICS, TEAM_HR_NOTE } from "./data";
import { SCRUB, useEnteredOnce, useIsomorphicLayoutEffect } from "./motion";
import styles from "./MetricsSection.module.css";

const COPY = {
  eyebrow: "Our team",
  heading: "The team behind the operation.",
  cta: "Meet the team",
  joinUs: "Join us",
  photoAlt: "The Center Quest team outside the company's Santo Domingo offices.",
};

function MetricValue({ value, suffix, reduced }: { value: number; suffix: string; reduced: boolean }) {
  const format = useCallback((n: number) => `${n}${suffix}`, [suffix]);
  const { ref, initial } = useCountUp<HTMLElement>(value, { reduced, format });
  return <dd ref={ref}>{initial}</dd>;
}

export default function MetricsSection({ reduced }: { reduced: boolean }) {
  const t = COPY;
  const sectionRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLSpanElement>(null);
  /* La sala se enciende al entrar en ella en vez de llegar ya iluminada. */
  const lit = useEnteredOnce(sectionRef, { enabled: !reduced });

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
    <section
      id="metrics"
      ref={sectionRef}
      className={styles.metricsSection}
      data-lit={lit ? "true" : "false"}
    >

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
              <motion.span className={styles.eyebrow} variants={settleVariants}>
                {t.eyebrow}
              </motion.span>
              <motion.h2 variants={settleVariants}>{t.heading}</motion.h2>
              <motion.p className={styles.lead} variants={settleVariants}>
                {TEAM_HR_NOTE}
              </motion.p>
              <motion.div className={styles.ctaRow} variants={settleVariants}>
                <TransitionLink href="/team" className={styles.cta}>
                  {t.cta} <Arrow />
                </TransitionLink>
                <TransitionLink href="/join-us" className={styles.ctaSecondary}>
                  {t.joinUs} <Arrow />
                </TransitionLink>
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
              {/* `sizes` pide deliberadamente más de los 40rem que mide el
                  marco: sobremuestrear deja el retrato nítido al hacer zoom o
                  en pantallas de alta densidad, donde el candidato justo se ve
                  blando. El origen tiene 2528px de ancho, así que hay material
                  de sobra para servirlo. */}
              <Image
                src="/Personal/FotoGrupal.jpg"
                alt={t.photoAlt}
                fill
                quality={92}
                className={styles.photo}
                sizes="(max-width: 64rem) 100vw, 60rem"
              />
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
                {metric.label}
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
