"use client";

import { motion, useReducedMotion } from "motion/react";
import styles from "./BrandLockup.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function BrandLockup() {
  const reduced = useReducedMotion() ?? false;
  const rise = (delay: number) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay, ease: EASE },
        };

  return (
    <div className={styles.lockup}>
      <motion.span className={styles.mark} aria-hidden="true" {...rise(0)} />
      <motion.span
        className={styles.divider}
        aria-hidden="true"
        initial={reduced ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: reduced ? 0 : 0.7, delay: 0.12, ease: EASE }}
      />
      <motion.span className={styles.name} {...rise(0.18)}>
        <span>Center</span>
        <span>Quest</span>
      </motion.span>
    </div>
  );
}
