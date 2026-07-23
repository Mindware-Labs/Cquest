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
import { COMMITMENTS } from "../data";
import styles from "./PactSection.module.css";

export default function PactSection({ reduced }: { reduced: boolean }) {
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
            <motion.h2 variants={focusRiseVariants}>Built like a product. Delivered like a partner.</motion.h2>
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
            <motion.div key={item.title} variants={statCardVariants}>
              <motion.h3 variants={statLineVariants}>{item.title}</motion.h3>
              <motion.p variants={statLineVariants}>{item.description}</motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
