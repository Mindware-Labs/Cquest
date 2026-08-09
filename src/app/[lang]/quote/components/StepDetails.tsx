"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { isRevealed, type Answers, type ResolvedQuestionnaire } from "../data";
import shell from "./step.module.css";
import styles from "./StepDetails.module.css";
import { Field, OptionGroup } from "./fields";

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
