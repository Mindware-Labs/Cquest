"use client";

import { motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, VIEWPORT } from "@/components/services/motion";
import styles from "./ContactSection.module.css";

export default function ContactSection({ reduced }: { reduced: boolean }) {
  return (
    <section id="contact" className={styles.contactSection}>
      <motion.div
        className={`${container.container} ${styles.contactInner}`}
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={VIEWPORT}
        variants={groupVariants}
      >
        <motion.div variants={focusRiseVariants}><h2>Let’s design the right operation.</h2><p>This section is prepared to connect with the smart quote form and direct contact channels in the next phase.</p></motion.div>
        <motion.div className={styles.contactPlaceholder} variants={focusRiseVariants}><span>Quote form integration</span><strong>Pending connection</strong></motion.div>
      </motion.div>
    </section>
  );
}
