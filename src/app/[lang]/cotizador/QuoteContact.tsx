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
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { STEPS } from "./data";
import { Arrow } from "./components/icons";
import styles from "./QuoteContact.module.css";

/* The closing #contact band on each service page: a balanced two-column block in
   the same editorial language as the Metrics section it sits near. A big-statement
   heading (with a celeste tick, like Metrics) on the left; an action card built
   from the site's own card idiom — hairline border, celeste top-accent, numbered
   rows echoing the capability index — on the right. Its button opens the dedicated
   /cotizador form with this service pre-selected (Step 2); the full step-by-step
   wizard lives there, not inline. currentColor carries the neutrals so the block
   reads on each service's dark ink; --brand-celeste carries the accent. */

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
  const { dict, lang } = useI18n();
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
              <span className={styles.stepLabel}>{step.copy[lang].label}</span>
            </motion.li>
          ))}
        </motion.ol>

        <LocalizedLink href={`/cotizador?servicio=${service}`} className={styles.cta}>
          {dict.quoteContact.cta}
          <Arrow className={styles.ctaArrow} />
        </LocalizedLink>
        <span className={styles.reassure}>{dict.quoteContact.reassure}</span>
      </motion.div>
    </motion.div>
  );
}
