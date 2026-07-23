"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { STEPS } from "../data";
import styles from "./ProgressRail.module.css";
import { Check } from "./icons";

/* The step indicator: three numbered nodes joined by a track that fills as the
   prospect advances. Completed steps stay reachable (jump back to edit an
   answer); upcoming steps are locked until their gate is passed. */
export default function ProgressRail({
  current,
  furthest,
  onJump,
}: {
  current: number;
  furthest: number;
  onJump: (index: number) => void;
}) {
  const { dict, lang } = useI18n();
  return (
    <ol className={styles.rail} aria-label={dict.wizard.progressRailAriaLabel}>
      {STEPS.map((step, index) => {
        const state =
          index < current ? "done" : index === current ? "current" : "upcoming";
        const reachable = index <= furthest && index !== current;
        return (
          <li key={step.id} className={styles.railItem} data-state={state}>
            <button
              type="button"
              className={styles.railNode}
              onClick={() => reachable && onJump(index)}
              aria-disabled={!reachable || undefined}
              tabIndex={reachable ? undefined : -1}
              aria-current={index === current ? "step" : undefined}
            >
              <span className={styles.railDot}>
                {index < current ? (
                  <Check className={styles.railCheck} />
                ) : (
                  index + 1
                )}
              </span>
              <span className={styles.railLabel}>{step.copy[lang].label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <span className={styles.railTrack} aria-hidden>
                <span
                  className={styles.railFill}
                  data-filled={index < current || undefined}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
