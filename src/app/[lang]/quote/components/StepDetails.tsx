"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { isRevealed, type Answers, type ResolvedQuestionnaire } from "../data";
import shell from "./step.module.css";
import styles from "./StepDetails.module.css";
import { Field, OptionGroup } from "./fields";

/* Step 2 — the service-specific questions, rendered straight from the
   questionnaire model so this component never needs to know which service it's
   showing. Choice questions become OptionGroups; free-text becomes a Field. The
   `errors` map is Zod's verdict (keyed by question id), shown once the prospect
   has tried to advance. */
export default function StepDetails({
  questionnaire,
  answers,
  onChange,
  showErrors,
  errors,
  reduced,
}: {
  questionnaire: ResolvedQuestionnaire;
  answers: Answers;
  onChange: (id: string, value: string | string[]) => void;
  showErrors: boolean;
  errors: Record<string, string>;
  reduced?: boolean;
}) {
  const { dict } = useI18n();
  return (
    <div className={shell.step}>
      <header className={shell.stepHead}>
        <p className={shell.eyebrow}>{dict.wizard.step2.eyebrow}</p>
        <h2 className={shell.stepTitle}>{questionnaire.lead}</h2>
      </header>

      <div className={styles.questions}>
        {questionnaire.questions
          // Follow-ups are not siblings of the questions they hang off — they
          // are rendered INSIDE the block below, so the stack's gap belongs to
          // the pair as a whole. Left in the flow they would sit in the gap
          // themselves, and a wrapper collapsing from `auto` to 0 would drag
          // the rest of the form up by a full gap the instant it opened.
          .filter((question) => !question.revealedBy)
          .map((question) => {
            const message = showErrors ? errors[question.id] : undefined;
            const followUps = questionnaire.questions.filter(
              (candidate) => candidate.revealedBy?.question === question.id,
            );

            return (
              <div key={question.id}>
                {question.kind === "single" || question.kind === "multi" ? (
                  <OptionGroup
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => onChange(question.id, value)}
                    error={message}
                  />
                ) : (
                  <Field
                    field={question}
                    value={(answers[question.id] as string) ?? ""}
                    onChange={(value) => onChange(question.id, value)}
                    error={message}
                  />
                )}

                {followUps.map((followUp) => (
                  <Reveal
                    key={followUp.id}
                    open={isRevealed(followUp, answers)}
                    reduced={reduced}
                  >
                    <Field
                      field={followUp}
                      value={(answers[followUp.id] as string) ?? ""}
                      onChange={(value) => onChange(followUp.id, value)}
                      error={showErrors ? errors[followUp.id] : undefined}
                    />
                  </Reveal>
                ))}
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* The open/close itself. Height to `auto` rather than a fixed value, because
   the panel's height depends on its label, its field and whether an error is
   showing beneath it — all of which can change while it is open.

   The two halves are deliberately asymmetric. Opening is longer and eases out
   long, so the field arrives and settles; closing is brisk and gets out of the
   way, because by then the prospect has already moved on. Matched durations
   would make dismissing it feel reluctant.

   Opacity trails the height on the way in, so the panel reads as making room
   and *then* filling it, rather than as text sliding out of a crack.

   Focus is deliberately NOT moved here. Ticking a checkbox and having the
   caret jump elsewhere is a change of context on input: it would strand a
   keyboard user who ticked "Other" and still meant to tick "English". The
   panel opens directly below, in the service tint, and is the very next stop
   in tab order — the affordance does not need to grab. */
function Reveal({
  open,
  reduced,
  children,
}: {
  open: boolean;
  reduced?: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className={styles.reveal}
          initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={
            reduced
              ? { opacity: 1 }
              : {
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.42, ease: EASE_OUT },
                    opacity: { duration: 0.34, ease: EASE_OUT, delay: 0.08 },
                  },
                }
          }
          exit={
            reduced
              ? { opacity: 0 }
              : {
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.26, ease: EASE_OUT },
                    opacity: { duration: 0.16, ease: EASE_OUT },
                  },
                }
          }
        >
          <div className={styles.revealPanel}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
