"use client";

import { useState } from "react";
import {
  CONTACT_FIELDS,
  CONTACT_METHODS,
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
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());

  const markTouched = (id: string) =>
    setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const errorFor = (id: string) =>
    showErrors || touched.has(id) ? errors[id] : undefined;

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
            onBlur={() => markTouched(field.id)}
            error={errorFor(field.id)}
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
