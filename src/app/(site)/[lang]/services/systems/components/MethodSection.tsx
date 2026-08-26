"use client";

import { motion } from "motion/react";
import SectionIntro from "@/components/services/SectionIntro";
import {
  focusRiseVariants,
  ruleXVariants,
  stepVariants,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { PROCESS } from "../data";
import styles from "./MethodSection.module.css";

const COPY = {
  en: {
    title: <>A build method the<br />operation can feel</>,
    description: "No black boxes and no big reveals — every engagement moves through the same five steps, with working software visible along the way.",
  },
  es: {
    title: <>Un método de construcción<br />que la operación puede sentir</>,
    description: "Sin cajas negras y sin grandes revelaciones — cada proyecto avanza por los mismos cinco pasos, con software funcional visible en el camino.",
  },
};

export default function MethodSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  return (
    <section id="method" className={styles.methodSection}>
      <div className={container.container}>
        <SectionIntro
          title={t.title}
          description={t.description}
          reduced={reduced}
          accentColor="var(--sy-blue)"
        />
        <ol className={styles.methodList}>
          {PROCESS.map((step, index) => (
            <motion.li
              key={step.title[lang]}
              className={styles.methodStep}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={{ once: true, margin: "-60px" }}
              variants={stepVariants}
            >
              <motion.span className={styles.methodRule} aria-hidden variants={ruleXVariants} />
              <motion.span className={styles.methodNumber} aria-hidden variants={focusRiseVariants}>0{index + 1}</motion.span>
              <motion.h3 variants={focusRiseVariants}>{step.title[lang]}</motion.h3>
              <motion.p variants={focusRiseVariants}>{step.description[lang]}</motion.p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
