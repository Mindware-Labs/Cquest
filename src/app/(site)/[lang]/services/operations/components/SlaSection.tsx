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
import { useI18n } from "@/i18n/I18nProvider";
import { SLAS } from "../data";
import styles from "./SlaSection.module.css";

const COPY = {
  en: {
    heading: "Accuracy is the product.",
    lead: "Operations is judged on what it delivers, day after day. These are the commitments every engagement is measured against.",
    meta: "Measured daily, and always visible to you.",
  },
  es: {
    heading: "La precisión es el producto.",
    lead: "Las operaciones se juzgan por lo que entregan, día tras día. Estos son los compromisos contra los que se mide cada proyecto.",
    meta: "Medido a diario, y siempre visible para ti.",
  },
};

export default function SlaSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
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
            <motion.div key={sla.label[lang]} variants={statCardVariants}>
              <motion.span className={styles.slaIndex} aria-hidden variants={statLineVariants}>
                0{index + 1}
              </motion.span>
              <motion.dt variants={statLineVariants}>{sla.label[lang]}</motion.dt>
              <motion.dd variants={statLineVariants}>{sla.value[lang]}</motion.dd>
              <motion.span className={styles.slaStatus} variants={statLineVariants}>
                <span className={styles.slaTick} aria-hidden />
                {sla.status[lang]}
              </motion.span>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
