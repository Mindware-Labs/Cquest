"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { useEffect, useRef } from "react";
import Arrow from "@/components/services/Arrow";
import { EASE_OUT, focusRiseVariants, passThroughVariants, stepVariants } from "@/components/services/motion";
import type { ClientLogo } from "../data";
import styles from "./ClientDialog.module.css";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Client dialog: one orchestrated beat, not a flat pop. Both badges settle in,
// the line draws toward Center Quest, a signal travels it and lands on the CQ
// mark, the mark visibly "receives" it with a ripple, then a permanent
// connection node blooms — before the copy sharpens in from blur beneath it.
// Tuned tight (whole beat lands in ~0.9s) so it reads as one quick pulse of
// energy, not a slow ceremony.
const dialogGroupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const badgeRiseVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.86, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE_OUT } },
};
const connectorLineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.08 } },
};
// The pulse box spans the full line (inset: 0) with its dot centered inside —
// so "travel" is a transform-only x translate (in % of the pulse's own width,
// i.e. the line's width) rather than animating the layout property `left`.
const connectorTravelVariants: Variants = {
  hidden: { x: "-46%", opacity: 0 },
  visible: {
    x: ["-46%", "0%", "46%", "46%"],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.48, ease: EASE_OUT, delay: 0.28, times: [0, 0.45, 0.85, 1] },
  },
};
// Fires the instant the pulse lands (delay lines up with connectorTravelVariants: 0.28 + 0.48).
const connectorPingVariants: Variants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: { scale: 1.45, opacity: [0, 0.65, 0], transition: { duration: 0.5, ease: EASE_OUT, delay: 0.76 } },
};
const connectorNodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: EASE_OUT, delay: 0.78 } },
};

export default function ClientDialog({ client, onClose, reduced }: { client: ClientLogo; onClose: () => void; reduced: boolean }) {
  const titleId = `client-dialog-title-${client.name}`;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the dialog itself on open (its aria-labelledby announces the title),
  // and trap Tab/Shift+Tab within it so keyboard users can't tab past the
  // overlay into content behind it. Escape-close and body-scroll-lock live in
  // the parent's effect; this one only owns the dialog's own focus while mounted.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.div
      className={styles.clientOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.25, ease: EASE_OUT }}
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.clientDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        layoutId={reduced ? undefined : `client-badge-${client.name}`}
        initial={reduced ? { opacity: 0, scale: 0.98 } : undefined}
        animate={reduced ? { opacity: 1, scale: 1 } : undefined}
        exit={reduced ? { opacity: 0, scale: 0.98 } : undefined}
        transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE_OUT }}
        onClick={(event) => event.stopPropagation()}
      >
        <motion.button
          type="button"
          className={styles.dialogClose}
          onClick={onClose}
          aria-label="Close"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: EASE_OUT, delay: reduced ? 0 : 0.15 }}
        >
          <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M5 5l10 10M15 5 5 15" />
          </svg>
        </motion.button>

        <motion.div initial={reduced ? false : "hidden"} animate="visible" variants={dialogGroupVariants}>
          <motion.div className={styles.connectionRow} variants={stepVariants}>
            <motion.span className={styles.connectionBadge} variants={badgeRiseVariants}>
              <span className={styles.connectionLogoFrame}>
                <Image src={client.src} alt={`${client.name} logo`} fill sizes="3rem" className={styles.connectionLogo} />
              </span>
            </motion.span>
            <motion.span className={styles.connectionLine} aria-hidden variants={passThroughVariants}>
              <motion.span className={styles.connectionLineFill} variants={connectorLineVariants} />
              <motion.span className={styles.connectionPulse} variants={connectorTravelVariants} />
              <motion.span className={styles.connectionNode} variants={connectorNodeVariants} />
            </motion.span>
            <motion.span className={styles.connectionBadge} data-brand="true" variants={badgeRiseVariants}>
              <span className={styles.connectionLogoFrame}>
                <Image src="/logo.png" alt="Center Quest" fill sizes="3rem" className={styles.connectionLogo} />
              </span>
              <motion.span className={styles.connectionPing} aria-hidden variants={connectorPingVariants} />
            </motion.span>
          </motion.div>

          <motion.h3 id={titleId} className={styles.dialogTitle} variants={focusRiseVariants}>{client.name}</motion.h3>

          <motion.div className={styles.dialogSection} variants={focusRiseVariants}>
            <h4>About {client.name}</h4>
            <p>{client.about}</p>
          </motion.div>
          <motion.div className={styles.dialogSection} variants={focusRiseVariants}>
            <h4>What Center Quest provides</h4>
            <p>{client.provides}</p>
          </motion.div>

          <motion.a href="#contact" className={styles.dialogFooterLink} onClick={onClose} variants={focusRiseVariants}>
            Discuss a similar engagement <Arrow />
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
