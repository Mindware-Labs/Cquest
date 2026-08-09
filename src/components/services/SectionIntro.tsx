import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { groupVariants, focusRiseVariants, ruleXVariants, ruleYVariants, stepVariants, VIEWPORT } from "./motion";
import styles from "./SectionIntro.module.css";

export default function SectionIntro({
  title,
  description,
  compact = false,
  reduced,
  accentColor,
  rule = true,
}: {
  title: ReactNode;
  description?: string;
  compact?: boolean;
  reduced: boolean;
  accentColor?: string;
  rule?: boolean;
}) {
  return (
    <motion.div
      className={styles.sectionIntro}
      data-compact={compact || undefined}

      data-solo={!description || undefined}
      style={accentColor ? ({ "--section-intro-accent": accentColor } as CSSProperties) : undefined}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      <motion.div className={styles.sectionIntroHeading} variants={stepVariants}>
        {rule && (
          <motion.span className={styles.sectionIntroRule} aria-hidden variants={compact ? ruleYVariants : ruleXVariants} />
        )}
        <motion.h2 variants={focusRiseVariants}>{title}</motion.h2>
      </motion.div>
      {description && <motion.p variants={focusRiseVariants}>{description}</motion.p>}
    </motion.div>
  );
}
