"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { useEffect, useRef } from "react";
import Arrow from "@/components/services/Arrow";
import { EASE_OUT, focusRiseVariants, ruleXVariants } from "@/components/services/motion";
import type { ClientLogo } from "../data";
import styles from "./ClientDialog.module.css";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// One quiet reveal, staggered — the same primitives every other section on
// this page uses (rule draws, content sharpens out of blur) rather than a
// bespoke effect. Consistency of motion language is what makes this read as
// part of the page instead of a dropped-in widget.
const dialogGroupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const logoRiseVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE_OUT } },
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
          <div className={styles.dialogHeader}>
            <motion.span
              className={styles.dialogLogoFrame}
              data-size={"size" in client ? client.size : undefined}
              variants={logoRiseVariants}
            >
              <Image src={client.src} alt={`${client.name} logo`} fill sizes="9rem" className={styles.dialogLogo} />
            </motion.span>
            <motion.h3 id={titleId} className={styles.dialogTitle} variants={focusRiseVariants}>{client.name}</motion.h3>
          </div>

          <motion.span className={styles.dialogDivider} aria-hidden variants={ruleXVariants} />

          <motion.div className={styles.dialogSection} variants={focusRiseVariants}>
            <h4>About the company</h4>
            {client.about.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {"source" in client && client.source && (
              <div className={styles.dialogCite}>
                <span className={styles.dialogCiteLabel}>Source</span>
                <cite>
                  <a className={styles.dialogCiteLink} href={client.source} target="_blank" rel="noopener noreferrer">
                    {new URL(client.source).hostname.replace(/^www\./, "")}
                    <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 6h6v6M14 6 6 14" />
                    </svg>
                  </a>
                </cite>
              </div>
            )}
          </motion.div>
          <motion.div className={styles.dialogProvides} variants={focusRiseVariants}>
            <h4>What Center Quest provides</h4>
            <p>{client.provides}</p>
          </motion.div>

          <motion.a href="#contact" className={styles.dialogCta} onClick={onClose} variants={focusRiseVariants}>
            Discuss a similar engagement <Arrow />
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
