"use client";

import { motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, ruleYVariants, statCardVariants, statLineVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { METRICS } from "../data";
import styles from "./MetricsSection.module.css";

const COPY = {
  heading: "Performance that can be demonstrated.",
  lede: "These are the operating standards an account is designed around — the service levels, response times and quality thresholds every engagement is measured against.",
};

export default function MetricsSection({ reduced }: { reduced: boolean }) {
  const t = COPY;
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
            <motion.div key={metric.label} variants={statCardVariants}>
              <motion.dt variants={statLineVariants}>{metric.label}</motion.dt>
              <motion.dd variants={statLineVariants}>{metric.value}</motion.dd>
              <motion.span className={styles.metricStatus} variants={statLineVariants}><span className={styles.metricDot} aria-hidden />{metric.status}</motion.span>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
