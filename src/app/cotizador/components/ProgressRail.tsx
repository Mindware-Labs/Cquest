"use client";

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
  return (
    <ol className={styles.rail} aria-label="Quote steps">
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
              <span className={styles.railLabel}>{step.label}</span>
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
