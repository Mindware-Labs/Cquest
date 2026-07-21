import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { groupVariants, focusRiseVariants, ruleXVariants, ruleYVariants, stepVariants, VIEWPORT } from "./motion";
import styles from "./SectionIntro.module.css";

/**
 * Shared section heading (hairline rule + title + optional description) used
 * across every service page. `accentColor` feeds the rule's color via a CSS
 * custom property instead of a hard-coded token, so each page can pass its
 * own brand accent (e.g. `"var(--cc-sky)"`) without this component coupling
 * to any one page's token names.
 */
export default function SectionIntro({
  title,
  description,
  compact = false,
  reduced,
  accentColor,
}: {
  title: ReactNode;
  description?: string;
  compact?: boolean;
  reduced: boolean;
  accentColor?: string;
}) {
  return (
    <motion.div
      className={styles.sectionIntro}
      data-compact={compact || undefined}
      style={accentColor ? ({ "--section-intro-accent": accentColor } as CSSProperties) : undefined}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      <motion.div className={styles.sectionIntroHeading} variants={stepVariants}>
        <motion.span className={styles.sectionIntroRule} aria-hidden variants={compact ? ruleYVariants : ruleXVariants} />
        <motion.h2 variants={focusRiseVariants}>{title}</motion.h2>
      </motion.div>
      {description && <motion.p variants={focusRiseVariants}>{description}</motion.p>}
    </motion.div>
  );
}
