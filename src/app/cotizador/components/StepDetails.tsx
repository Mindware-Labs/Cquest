"use client";

import { isAnswered, type Answers, type Questionnaire } from "../data";
import styles from "../wizard.module.css";
import { Field, OptionGroup } from "./fields";

/* Step 2 — the service-specific questions, rendered straight from the
   questionnaire model so this component never needs to know which service it's
   showing. Choice questions become OptionGroups; free-text becomes a Field. */
export default function StepDetails({
  questionnaire,
  answers,
  onChange,
  showErrors,
}: {
  questionnaire: Questionnaire;
  answers: Answers;
  onChange: (id: string, value: string | string[]) => void;
  showErrors: boolean;
}) {
  return (
    <div className={styles.step}>
      <header className={styles.stepHead}>
        <p className={styles.eyebrow}>Step 2 · Details</p>
        <h2 className={styles.stepTitle}>{questionnaire.lead}</h2>
      </header>

      <div className={styles.questions}>
        {questionnaire.questions.map((question) => {
          if (question.kind === "single" || question.kind === "multi") {
            const invalid =
              showErrors &&
              Boolean(question.required) &&
              !isAnswered(answers[question.id]);
            return (
              <OptionGroup
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(value) => onChange(question.id, value)}
                invalid={invalid}
              />
            );
          }

          const invalid =
            showErrors &&
            Boolean(question.required) &&
            !isAnswered(answers[question.id]);
          return (
            <Field
              key={question.id}
              field={question}
              value={(answers[question.id] as string) ?? ""}
              onChange={(value) => onChange(question.id, value)}
              error={invalid ? "Required" : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
