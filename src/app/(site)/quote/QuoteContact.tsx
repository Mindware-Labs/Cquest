"use client";

import { motion, type Variants } from "motion/react";
import {
  EASE_OUT,
  focusRiseVariants,
  groupVariants,
  ruleYVariants,
  stepVariants,
  VIEWPORT,
} from "@/components/services/motion";
import type { ServiceId } from "@/components/services/data";
import { dict } from "@/lib/dictionary";
import { TransitionLink } from "@/components/TransitionLink";
import { STEPS } from "./data";
import { Arrow } from "./components/icons";
import styles from "./QuoteContact.module.css";

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export default function QuoteContact({
  service,
  heading,
  lede,
  reduced,
}: {
  service: ServiceId;
  heading: string;
  lede?: string;
  reduced: boolean;
}) {
  return (
    <motion.div
      className={styles.inner}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      <motion.div className={styles.lead} variants={stepVariants}>
        <motion.span className={styles.rule} aria-hidden variants={ruleYVariants} />
        <motion.h2 className={styles.heading} variants={focusRiseVariants}>
          {heading}
        </motion.h2>
        {lede && (
          <motion.p className={styles.lede} variants={focusRiseVariants}>
            {lede}
          </motion.p>
        )}
      </motion.div>

      <motion.div className={styles.card} variants={focusRiseVariants}>
        <span className={styles.cardMeta}>{dict.quoteContact.meta}</span>

        <motion.ol className={styles.stepList} variants={stepVariants}>
          {STEPS.map((step, index) => (
            <motion.li key={step.id} className={styles.stepRow} variants={rowVariants}>
              <span className={styles.stepNum}>0{index + 1}</span>
              <span className={styles.stepLabel}>{step.label}</span>
            </motion.li>
          ))}
        </motion.ol>

        <TransitionLink href={`/quote?servicio=${service}`} className={styles.cta}>
          {dict.quoteContact.cta}
          <Arrow className={styles.ctaArrow} />
        </TransitionLink>
        <span className={styles.reassure}>{dict.quoteContact.reassure}</span>
      </motion.div>
    </motion.div>
  );
}
