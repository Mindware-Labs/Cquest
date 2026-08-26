"use client";

import { motion } from "motion/react";
import {
  focusRiseVariants,
  groupVariants,
  ruleYVariants,
  statCardVariants,
  statLineVariants,
  stepVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { SLAS } from "../data";
import styles from "./SlaSection.module.css";

const COPY = {
  heading: "Accuracy is the product.",
  lead: "Operations is judged on what it delivers, day after day. These are the commitments every engagement is measured against.",
  meta: "Measured daily, and always visible to you.",
};

export default function SlaSection({ reduced }: { reduced: boolean }) {
  const t = COPY;
  return (
    <section id="slas" className={styles.slaSection}>
      <div className={`${container.container} ${styles.slaInner}`}>
        <motion.div
          className={styles.slaHeading}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div
            variants={stepVariants}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <motion.span
              className={styles.slaRule}
              aria-hidden
              variants={ruleYVariants}
            />
            <motion.h2 variants={focusRiseVariants}>
              {t.heading}
            </motion.h2>
          </motion.div>
          <motion.p variants={focusRiseVariants}>
            {t.lead}
          </motion.p>
          <motion.p className={styles.slaMeta} variants={focusRiseVariants}>
            <span className={styles.slaMetaDot} aria-hidden />
            {t.meta}
          </motion.p>
        </motion.div>
        <motion.dl
          className={styles.slaList}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {SLAS.map((sla, index) => (
            <motion.div key={sla.label} variants={statCardVariants}>
              <motion.span className={styles.slaIndex} aria-hidden variants={statLineVariants}>
                0{index + 1}
              </motion.span>
              <motion.dt variants={statLineVariants}>{sla.label}</motion.dt>
              <motion.dd variants={statLineVariants}>{sla.value}</motion.dd>
              <motion.span className={styles.slaStatus} variants={statLineVariants}>
                <span className={styles.slaTick} aria-hidden />
                {sla.status}
              </motion.span>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
