"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";
import {
  QUESTIONNAIRES,
  getService,
  isAnswered,
  type Question,
  type QuoteSubmission,
} from "../data";
import styles from "../wizard.module.css";

// Map a stored answer back to its human label(s) for the recap.
function toLabels(question: Question, answer: string | string[]): string {
  const values = Array.isArray(answer) ? answer : [answer];
  return values
    .map(
      (value) =>
        question.choices?.find((choice) => choice.value === value)?.label ??
        value,
    )
    .join(", ");
}

// The recap shown on success: service first, then every choice answered
// (free-text notes are left out — too long for a chip row).
function summarize(submission: QuoteSubmission) {
  const rows: { label: string; value: string }[] = [];
  for (const question of QUESTIONNAIRES[submission.service].questions) {
    if (question.kind === "textarea") continue;
    const answer = submission.details[question.id];
    if (!isAnswered(answer)) continue;
    rows.push({ label: question.label, value: toLabels(question, answer) });
  }
  return rows;
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export default function Confirmation({
  submission,
  onReset,
  reduced,
}: {
  submission: QuoteSubmission;
  onReset: () => void;
  reduced: boolean;
}) {
  const service = getService(submission.service);
  const rows = summarize(submission);
  const name = ((submission.contact.name as string) ?? "").split(" ")[0];

  return (
    <motion.div
      className={styles.confirm}
      style={
        {
          "--svc": service?.color ?? "var(--brand-petroleo)",
          "--svc-glow": service?.glow ?? "var(--brand-celeste)",
        } as CSSProperties
      }
      variants={reduced ? undefined : container}
      initial={reduced ? false : "hidden"}
      animate={reduced ? undefined : "visible"}
    >
      <motion.div className={styles.confirmGlyph} variants={reduced ? undefined : item}>
        <svg viewBox="0 0 52 52" aria-hidden>
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            className={styles.confirmRing}
            initial={reduced ? false : { pathLength: 0 }}
            animate={reduced ? undefined : { pathLength: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
          <motion.path
            d="M16 26.5 l6.5 6.5 L37 18.5"
            className={styles.confirmTick}
            initial={reduced ? false : { pathLength: 0 }}
            animate={reduced ? undefined : { pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: EASE_OUT }}
          />
        </svg>
      </motion.div>

      <motion.h2 className={styles.confirmTitle} variants={reduced ? undefined : item}>
        {name ? `Thanks, ${name} — ` : "Thanks — "}your request is in.
      </motion.h2>
      <motion.p className={styles.confirmLead} variants={reduced ? undefined : item}>
        Our team will review your {service?.label ?? "quote"} request and get
        back to you within one business day.
      </motion.p>

      {rows.length > 0 && (
        <motion.dl className={styles.summary} variants={reduced ? undefined : item}>
          <div className={styles.summaryRow}>
            <dt>Service</dt>
            <dd>{service?.label}</dd>
          </div>
          {rows.map((row) => (
            <div key={row.label} className={styles.summaryRow}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </motion.dl>
      )}

      <motion.div className={styles.confirmActions} variants={reduced ? undefined : item}>
        <Link href="/" className={styles.ghostBtn}>
          Back to home
        </Link>
        <button type="button" onClick={onReset} className={styles.primaryBtn}>
          Start another request
        </button>
      </motion.div>
    </motion.div>
  );
}
