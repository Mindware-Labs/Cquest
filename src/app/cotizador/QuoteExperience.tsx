"use client";

import { motion, useReducedMotion } from "motion/react";
import Navbar from "@/components/Navbar";
import { EASE_OUT } from "@/components/services/motion";
import type { ServiceId } from "@/components/services/data";
import QuoteWizard from "./components/QuoteWizard";
import { getService } from "./data";
import styles from "./cotizador.module.css";

const TRUST = [
  { icon: ClockIcon, text: "Reply within one business day" },
  { icon: FreeIcon, text: "No commitment, no cost" },
  { icon: LockIcon, text: "Your details stay private" },
];

export default function QuoteExperience({
  initialService,
}: {
  initialService: ServiceId | null;
}) {
  const reduced = useReducedMotion() ?? false;
  const preset = getService(initialService);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.field} aria-hidden />
      <div className={`${styles.grain} cq-noise`} aria-hidden />

      <div className={styles.shell}>
        <motion.header
          className={styles.intro}
          initial={reduced ? false : { opacity: 0, y: 22, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <p className={styles.introEyebrow}>Give us a quest</p>
          <h1 className={styles.introTitle}>
            {preset ? (
              <>
                Let&rsquo;s scope your{" "}
                <span className={styles.introAccent}>{preset.label}</span>{" "}
                operation.
              </>
            ) : (
              <>Let&rsquo;s scope your operation.</>
            )}
          </h1>
          <p className={styles.introLead}>
            Answer a few quick questions and we&rsquo;ll come back with a
            tailored proposal — usually within one business day.
          </p>
        </motion.header>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 28, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.12, ease: EASE_OUT }}
        >
          <QuoteWizard initialService={initialService} reduced={reduced} />
        </motion.div>

        <motion.ul
          className={styles.trust}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
        >
          {TRUST.map(({ icon: Icon, text }) => (
            <li key={text} className={styles.trustItem}>
              <Icon />
              <span>{text}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function FreeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 12.5 11 14l3.5-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}
