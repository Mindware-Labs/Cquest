"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
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

const PREFERRED: Question = {
  id: "preferred",
  kind: "single",
  choices: CONTACT_METHODS,
  copy: {
    en: { label: "Best way to reach you" },
    es: { label: "Mejor forma de contactarte" },
  },
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

      <p className={styles.consent}>
        {dict.wizard.step3.consent}{" "}
        <LocalizedLink href="/legal/privacy" target="_blank" rel="noopener noreferrer">
          {dict.wizard.step3.privacyLinkLabel}
        </LocalizedLink>
        .
      </p>
    </div>
  );
}
