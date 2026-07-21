"use client";

import { motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, VIEWPORT } from "@/components/services/motion";
import styles from "./TestimonialSection.module.css";

export default function TestimonialSection({ reduced }: { reduced: boolean }) {
  return (
    <section className={styles.testimonialSection}>
      <motion.div
        className={`${container.container} ${styles.testimonialInner}`}
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={VIEWPORT}
        variants={groupVariants}
      >
        <motion.span className={styles.quoteMark} aria-hidden variants={focusRiseVariants}>“</motion.span>
        <motion.blockquote variants={focusRiseVariants}><p>Approved client testimonial will appear in this space.</p><footer><span>Client name</span><small>Role · Company</small></footer></motion.blockquote>
        <motion.div className={styles.portraitPlaceholder} variants={focusRiseVariants}>Portrait<br />1:1</motion.div>
      </motion.div>
    </section>
  );
}
