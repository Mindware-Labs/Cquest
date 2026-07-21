"use client";

import { motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, ruleYVariants, softRiseVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { METRICS } from "../data";
import styles from "./MetricsSection.module.css";

export default function MetricsSection({ reduced }: { reduced: boolean }) {
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
            <motion.h2 variants={focusRiseVariants}>Performance that can be demonstrated.</motion.h2>
          </motion.div>
        </motion.div>
        <motion.dl
          className={styles.metricList}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {METRICS.map((metric) => (
            <motion.div key={metric.label} variants={softRiseVariants}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
              <span className={styles.metricStatus}><span className={styles.metricDot} aria-hidden />{metric.status}</span>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
