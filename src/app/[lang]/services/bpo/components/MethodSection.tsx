"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import {
  focusRiseVariants,
  groupVariants,
  nodeVariants,
  ruleYVariants,
  stepVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { PROCESS } from "../data";
import styles from "./MethodSection.module.css";

const COPY = {
  en: {
    heading: "From handover to steady state",
    lead: "Taking over a process is a discipline in itself. The same sequence governs every engagement, so nothing depends on improvisation.",
    meta: "Five steps, one sequence — repeated on every engagement.",
    handover: "Handover",
    steadyState: "Steady state",
  },
  es: {
    heading: "Del traspaso al estado estable",
    lead: "Asumir un proceso es una disciplina en sí misma. La misma secuencia rige cada proyecto, para que nada dependa de la improvisación.",
    meta: "Cinco pasos, una secuencia — repetida en cada proyecto.",
    handover: "Traspaso",
    steadyState: "Estado estable",
  },
};

export default function MethodSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  // The method spine draws itself downward, spring-smoothed so it trails the
  // scroll like a needle, not a scrubber.
  const spineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: spineProgress } = useScroll({
    target: spineRef,
    offset: ["start 78%", "end 55%"],
  });
  const spineScale = useSpring(
    useTransform(spineProgress, [0, 1], reduced ? [1, 1] : [0, 1]),
    { stiffness: 120, damping: 28, restDelta: 0.001 },
  );

  return (
    <section id="method" className={styles.methodSection}>
      <div className={container.container}>
        <div className={styles.methodGrid}>
          <motion.div
            className={styles.railIntro}
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
                className={styles.railRule}
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
            <motion.p className={styles.railMeta} variants={focusRiseVariants}>
              <span aria-hidden />
              {t.meta}
            </motion.p>
          </motion.div>
          <div ref={spineRef} className={styles.spine}>
            <span className={styles.spineTrack} aria-hidden />
            <motion.span
              className={styles.spineLine}
              aria-hidden
              style={{ scaleY: spineScale }}
            />
            <motion.div
              className={styles.spineFlow}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={{ once: true, margin: "-60px" }}
              variants={groupVariants}
            >
              <motion.p
                className={styles.spineEnd}
                data-pos="start"
                variants={focusRiseVariants}
              >
                <span className={styles.spineEndMark} aria-hidden />
                {t.handover}
              </motion.p>
              <motion.ol className={styles.spineList} variants={groupVariants}>
                {PROCESS.map((step, index) => (
                  <motion.li
                    key={step.title[lang]}
                    className={styles.spineStep}
                    variants={stepVariants}
                  >
                    <motion.span
                      className={styles.spineNode}
                      aria-hidden
                      variants={nodeVariants}
                    />
                    <motion.div
                      className={styles.spineStepBody}
                      variants={focusRiseVariants}
                    >
                      <span className={styles.spineNumber}>0{index + 1}</span>
                      <h3>{step.title[lang]}</h3>
                      <p>{step.description[lang]}</p>
                    </motion.div>
                  </motion.li>
                ))}
              </motion.ol>
              <motion.p
                className={styles.spineEnd}
                data-pos="end"
                variants={focusRiseVariants}
              >
                <span className={styles.spineEndMark} aria-hidden />
                {t.steadyState}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
