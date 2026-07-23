"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { Answers, ResolvedQuestionnaire } from "../data";
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
}: {
  questionnaire: ResolvedQuestionnaire;
  answers: Answers;
  onChange: (id: string, value: string | string[]) => void;
  showErrors: boolean;
  errors: Record<string, string>;
}) {
  const { dict } = useI18n();
  return (
    <div className={shell.step}>
      <header className={shell.stepHead}>
        <p className={shell.eyebrow}>{dict.wizard.step2.eyebrow}</p>
        <h2 className={shell.stepTitle}>{questionnaire.lead}</h2>
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
