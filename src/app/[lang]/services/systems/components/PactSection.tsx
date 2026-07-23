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
import { COMMITMENTS } from "../data";
import styles from "./PactSection.module.css";

const COPY = {
  en: { heading: "Built like a product. Delivered like a partner." },
  es: { heading: "Construido como un producto. Entregado como un aliado." },
};

export default function PactSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  return (
    <section id="commitments" className={styles.pactSection}>
      <div className={container.container}>
        <motion.div
          className={styles.pactHeading}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div variants={stepVariants} style={{ display: "flex", flexDirection: "column" }}>
            <motion.span className={styles.pactRule} aria-hidden variants={ruleYVariants} />
            <motion.h2 variants={focusRiseVariants}>{t.heading}</motion.h2>
          </motion.div>
        </motion.div>
        <motion.div
          className={styles.pactGrid}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {COMMITMENTS.map((item) => (
            <motion.div key={item.title[lang]} variants={statCardVariants}>
              <motion.h3 variants={statLineVariants}>{item.title[lang]}</motion.h3>
              <motion.p variants={statLineVariants}>{item.description[lang]}</motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
