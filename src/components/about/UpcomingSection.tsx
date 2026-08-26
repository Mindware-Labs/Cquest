"use client";

import { motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, focusRiseVariants, groupVariants, ruleXVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import styles from "./UpcomingSection.module.css";

const TAG = "In development";

export default function UpcomingSection({
  id,
  title,
  note,
  reduced,
}: {
  id: string;
  title: string;
  note: string;
  reduced: boolean;
}) {
  return (
    <section id={id} className={styles.upcomingSection}>
      <div className={container.container}>
        <motion.div
          className={styles.heading}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div className={styles.headingCopy} variants={stepVariants}>
            <motion.span className={styles.rule} aria-hidden variants={ruleXVariants} />
            <motion.h2 variants={focusRiseVariants}>{title}</motion.h2>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.placeholder}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <span className={styles.tag}>{TAG}</span>
          <p>{note}</p>
        </motion.div>
      </div>
    </section>
  );
}
