"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import {
  CONTACT_FIELDS,
  CONTACT_METHODS,
  resolveQuestion,
  type Answers,
  type Question,
} from "../data";
import shell from "./step.module.css";
import styles from "./StepContact.module.css";
import { Field, OptionGroup } from "./fields";

// "Best way to reach you" — modelled as a normal single-choice question so it
// renders through the same OptionGroup as everything else. Its own label
// isn't in CONTACT_FIELDS (it's synthesized here, not a real contact field),
// so it carries its own copy block rather than reusing the dictionary.
const PREFERRED: Question = {
  id: "preferred",
  kind: "single",
  choices: CONTACT_METHODS,
  copy: {
    en: { label: "Best way to reach you" },
    es: { label: "Mejor forma de contactarte" },
  },
};

/* Step 3 — contact details. Requirements §3.2 asks for name, company, email and
   phone; we add an optional preferred-channel so the follow-up (email or
   WhatsApp) matches how the prospect wants to be reached.

   Errors come pre-computed from the Zod contact schema. A field reveals its
   error once it's been visited (blurred) or once the prospect tries to advance,
   so validation feels responsive without scolding half-typed fields. */
export default function StepContact({
  answers,
  onChange,
  showErrors,
  errors,
}: {
  answers: Answers;
  onChange: (id: string, value: string | string[]) => void;
  showErrors: boolean;
  errors: Record<string, string>;
}) {
  const { dict, lang } = useI18n();
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());

  const markTouched = (id: string) =>
    setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const errorFor = (id: string) =>
    showErrors || touched.has(id) ? errors[id] : undefined;

  return (
    <div className={shell.step}>
      <header className={shell.stepHead}>
        <p className={shell.eyebrow}>{dict.wizard.step3.eyebrow}</p>
        <h2 className={shell.stepTitle}>{dict.wizard.step3.title}</h2>
        <p className={shell.stepLead}>{dict.wizard.step3.lead}</p>
      </header>

      <div className={styles.contactGrid}>
        {CONTACT_FIELDS.map((field) => (
          <Field
            key={field.id}
            field={resolveQuestion(field, lang)}
            value={(answers[field.id] as string) ?? ""}
            onChange={(value) => onChange(field.id, value)}
            onBlur={() => markTouched(field.id)}
            error={errorFor(field.id)}
          />
        ))}
      </div>

      <OptionGroup
        question={resolveQuestion(PREFERRED, lang)}
        value={answers.preferred}
        onChange={(value) => onChange("preferred", value)}
      />

      <p className={styles.consent}>{dict.wizard.step3.consent}</p>
    </div>
  );
}
