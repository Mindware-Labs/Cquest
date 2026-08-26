"use client";

import { motion, useReducedMotion } from "motion/react";
import BrandLockup from "./BrandLockup";
import ShiftClock from "./ShiftClock";
import styles from "./AuthShell.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  thesis: string;
  lead: string;
  children: React.ReactNode;
};

/* Shell compartido por login, recuperación y reset: una sola composición. */
export default function AuthShell({ thesis, lead, children }: Props) {
  const reduced = useReducedMotion() ?? false;
  const rise = (delay: number) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <div className={styles.shell}>
      <aside className={styles.inkPanel}>
        <BrandLockup />

        <motion.div className={styles.thesis} {...rise(0.14)}>
          <p className={styles.thesisLine}>{thesis}</p>
          <p className={styles.thesisLead}>{lead}</p>
        </motion.div>

        <motion.div className={styles.instrument} {...rise(0.24)}>
          <ShiftClock />
        </motion.div>
      </aside>

      <main className={styles.pane}>
        <div className={styles.paneInner}>{children}</div>
      </main>
    </div>
  );
}
