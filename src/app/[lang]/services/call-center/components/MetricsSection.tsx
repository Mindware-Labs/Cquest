"use client";

import { motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, ruleYVariants, statCardVariants, statLineVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { METRICS } from "../data";
import styles from "./MetricsSection.module.css";

const COPY = {
  en: {
    heading: "Performance that can be demonstrated.",
    lede: "These are the operating standards an account is designed around — the service levels, response times and quality thresholds every engagement is measured against.",
  },
  es: {
    heading: "Desempeño que se puede demostrar.",
    lede: "Estos son los estándares operativos alrededor de los cuales se diseña una cuenta — los niveles de servicio, tiempos de respuesta y umbrales de calidad contra los que se mide cada proyecto.",
  },
};

export default function MetricsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  return (
    <section id="metrics" className={styles.metricsSection}>
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
          {/* The second column the CSS was always written for — it sat empty,
              leaving a 20rem hole beside the heading on every desktop view. */}
          <motion.p variants={focusRiseVariants}>{t.lede}</motion.p>
        </motion.div>
        <motion.dl
          className={styles.metricList}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {METRICS.map((metric) => (
            <motion.div key={metric.label[lang]} variants={statCardVariants}>
              <motion.dt variants={statLineVariants}>{metric.label[lang]}</motion.dt>
              <motion.dd variants={statLineVariants}>{metric.value[lang]}</motion.dd>
              <motion.span className={styles.metricStatus} variants={statLineVariants}><span className={styles.metricDot} aria-hidden />{metric.status[lang]}</motion.span>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
