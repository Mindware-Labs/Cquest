"use client";

import { motion } from "motion/react";
import SectionIntro from "@/components/services/SectionIntro";
import {
  focusRiseVariants,
  ruleXVariants,
  stepVariants,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { PROCESS } from "../data";
import styles from "./MethodSection.module.css";

export default function MethodSection({ reduced }: { reduced: boolean }) {
  return (
    <section id="method" className={styles.methodSection}>
      <div className={container.container}>
        <SectionIntro
          title={<>A build method the<br />operation can feel</>}
          description="No black boxes and no big reveals — every engagement moves through the same five steps, with working software visible along the way."
          reduced={reduced}
          accentColor="var(--sy-blue)"
        />
        <ol className={styles.methodList}>
          {PROCESS.map((step, index) => (
            <motion.li
              key={step.title}
              className={styles.methodStep}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={{ once: true, margin: "-60px" }}
              variants={stepVariants}
            >
              <motion.span className={styles.methodRule} aria-hidden variants={ruleXVariants} />
              <motion.span className={styles.methodNumber} aria-hidden variants={focusRiseVariants}>0{index + 1}</motion.span>
              <motion.h3 variants={focusRiseVariants}>{step.title}</motion.h3>
              <motion.p variants={focusRiseVariants}>{step.description}</motion.p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
