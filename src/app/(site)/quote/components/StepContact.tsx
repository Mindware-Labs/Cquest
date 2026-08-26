"use client";

import { useState } from "react";
import { dict } from "@/lib/dictionary";
import { TransitionLink } from "@/components/TransitionLink";
import {
  CONTACT_FIELDS,
  CONTACT_METHODS,
  type Answers,
  type Question,
} from "../data";
import shell from "./step.module.css";
import styles from "./StepContact.module.css";
import { Field, OptionGroup } from "./fields";

const PREFERRED: Question = {
  id: "preferred",
  kind: "single",
  choices: CONTACT_METHODS,
  label: "Best way to reach you",
};

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
        {dict.wizard.step3.consent}{" "}
        <TransitionLink href="/legal/privacy" target="_blank" rel="noopener noreferrer">
          {dict.wizard.step3.privacyLinkLabel}
        </TransitionLink>
        .
      </p>
    </div>
  );
}
