"use client";

import { motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, focusRiseVariants, groupVariants, ruleXVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import styles from "./UpcomingSection.module.css";

const TAG = {
  en: "In development",
  es: "En desarrollo",
};

/* A section that exists as a PLACE, not yet as content — the same philosophy
   as the team page's placeholder chart: visibly unfinished on purpose, so it
   reserves its seat in the page and nobody mistakes it for a shipped design.
   When the real section is built, this component simply gets swapped out. */
export default function UpcomingSection({
  id,
  title,
  note,
  reduced,
}: {
  id: string;
  title: Record<Locale, string>;
  note: Record<Locale, string>;
  reduced: boolean;
}) {
  const { lang } = useI18n();

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
            <motion.h2 variants={focusRiseVariants}>{title[lang]}</motion.h2>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.placeholder}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <span className={styles.tag}>{TAG[lang]}</span>
          <p>{note[lang]}</p>
        </motion.div>
      </div>
    </section>
  );
}
