import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { closeVariants, groupVariants, focusRiseVariants, ruleXVariants, ruleYVariants, settleVariants, stepVariants, VIEWPORT } from "./motion";
import styles from "./SectionIntro.module.css";

const ENTRANCES = {
  rise: focusRiseVariants,
  settle: settleVariants,
  close: closeVariants,
} as const;

export default function SectionIntro({
  title,
  description,
  compact = false,
  reduced,
  accentColor,
  rule = true,
  entrance = "rise",
}: {
  title: ReactNode;
  description?: string;
  compact?: boolean;
  reduced: boolean;
  accentColor?: string;
  rule?: boolean;
  /** Cuál de las cuatro entradas del bloque About usa esta sección. Por
   *  defecto la de siempre, así que ninguna otra página cambia. */
  entrance?: keyof typeof ENTRANCES;
}) {
  const copyVariants = ENTRANCES[entrance];

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
        <motion.h2 variants={copyVariants}>{title}</motion.h2>
      </motion.div>
      {description && <motion.p variants={copyVariants}>{description}</motion.p>}
    </motion.div>
  );
}
