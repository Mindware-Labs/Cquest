"use client";

import type { Answers, Questionnaire } from "../data";
import styles from "../wizard.module.css";
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
}: {
  questionnaire: Questionnaire;
  answers: Answers;
  onChange: (id: string, value: string | string[]) => void;
  showErrors: boolean;
  errors: Record<string, string>;
}) {
  return (
    <div className={styles.step}>
      <header className={styles.stepHead}>
        <p className={styles.eyebrow}>Step 2 · Details</p>
        <h2 className={styles.stepTitle}>{questionnaire.lead}</h2>
      </header>

      <div className={styles.questions}>
        {questionnaire.questions.map((question) => {
          const message = showErrors ? errors[question.id] : undefined;

          if (question.kind === "single" || question.kind === "multi") {
            return (
              <OptionGroup
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(value) => onChange(question.id, value)}
                error={message}
              />
            );
          }

          return (
            <Field
              key={question.id}
              field={question}
              value={(answers[question.id] as string) ?? ""}
              onChange={(value) => onChange(question.id, value)}
              error={message}
            />
          );
        })}
      </div>
    </div>
  );
}
