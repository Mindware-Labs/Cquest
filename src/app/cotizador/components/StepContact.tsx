"use client";

import {
  CONTACT_FIELDS,
  CONTACT_METHODS,
  EMAIL_RE,
  type Answers,
  type Question,
} from "../data";
import styles from "../wizard.module.css";
import { Field, OptionGroup } from "./fields";

// "Best way to reach you" — modelled as a normal single-choice question so it
// renders through the same OptionGroup as everything else.
const PREFERRED: Question = {
  id: "preferred",
  kind: "single",
  label: "Best way to reach you",
  choices: CONTACT_METHODS,
};

/* Step 3 — contact details. Requirements §3.2 asks for name, company, email and
   phone; we add an optional preferred-channel so the follow-up (email or
   WhatsApp) matches how the prospect wants to be reached. */
export default function StepContact({
  answers,
  onChange,
  showErrors,
}: {
  answers: Answers;
  onChange: (id: string, value: string | string[]) => void;
  showErrors: boolean;
}) {
  const email = (answers.email as string) ?? "";

  function errorFor(field: Question): string | undefined {
    if (!showErrors) return undefined;
    if (field.id === "email") {
      if (!email) return "Required";
      if (!EMAIL_RE.test(email)) return "Enter a valid email address";
      return undefined;
    }
    if (field.required && !(answers[field.id] as string)?.trim()) {
      return "Required";
    }
    return undefined;
  }

  return (
    <div className={styles.step}>
      <header className={styles.stepHead}>
        <p className={styles.eyebrow}>Step 3 · Contact</p>
        <h2 className={styles.stepTitle}>Where should we send your quote?</h2>
        <p className={styles.stepLead}>
          We&rsquo;ll only use these details to prepare and send your proposal.
        </p>
      </header>

      <div className={styles.contactGrid}>
        {CONTACT_FIELDS.map((field) => (
          <Field
            key={field.id}
            field={field}
            value={(answers[field.id] as string) ?? ""}
            onChange={(value) => onChange(field.id, value)}
            error={errorFor(field)}
          />
        ))}
      </div>

      <OptionGroup
        question={PREFERRED}
        value={answers.preferred}
        onChange={(value) => onChange("preferred", value)}
      />

      <p className={styles.consent}>
        By submitting, you agree to be contacted about your request. We
        don&rsquo;t share your details with anyone.
      </p>
    </div>
  );
}
