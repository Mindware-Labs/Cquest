"use client";

import ServiceIcon from "@/components/services/ServiceIcon";
import { formatPhone } from "@/lib/formatPhone";
import type { Choice, Question } from "../data";
import styles from "./fields.module.css";
import { Alert } from "./icons";

export function OptionGroup({
  question,
  value,
  onChange,
  error,
}: {
  question: Question;
  value: string | string[] | undefined;
  onChange: (next: string | string[]) => void;
  error?: string;
}) {
  const invalid = Boolean(error);
  const multi = question.kind === "multi";
  const selected = new Set(
    Array.isArray(value) ? value : value ? [value] : [],
  );

  function toggle(choice: string, checked: boolean) {
    if (!multi) {
      onChange(choice);
      return;
    }
    const next = new Set(selected);
    if (checked) next.add(choice);
    else next.delete(choice);
    onChange([...next]);
  }

  return (
    <fieldset
      className={styles.group}
      aria-invalid={invalid || undefined}
      data-invalid={invalid || undefined}
    >
      <legend className={styles.legend}>
        {question.label}
        {question.required && (
          <span className={styles.req} aria-hidden>
            *
          </span>
        )}
      </legend>
      {question.help && <p className={styles.groupHelp}>{question.help}</p>}
      <div className={styles.optionGrid}>
        {question.choices?.map((choice: Choice) => (
          <label key={choice.value} className={styles.option}>
            <input
              className={styles.srInput}
              type={multi ? "checkbox" : "radio"}
              name={question.id}
              value={choice.value}
              checked={selected.has(choice.value)}
              onChange={(event) => toggle(choice.value, event.target.checked)}
            />
            {choice.icon && (
              <span className={styles.optionIcon} aria-hidden>
                <ServiceIcon name={choice.icon} />
              </span>
            )}
            <span className={styles.optionLabel}>{choice.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className={styles.fieldError} role="alert">
          <Alert className={styles.fieldErrorIcon} />
          {error}
        </p>
      )}
    </fieldset>
  );
}

const AUTOCOMPLETE: Record<string, string> = {
  name: "name",
  company: "organization",
  email: "email",
  phone: "tel",
};

export function Field({
  field,
  value,
  onChange,
  onBlur,
  error,
}: {
  field: Question;
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
}) {
  const id = `q-${field.id}`;
  const errorId = `${id}-error`;
  const shared = {
    id,
    name: field.id,
    value,
    placeholder: field.placeholder,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    spellCheck: field.kind === "email" ? false : undefined,
    onBlur,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) =>
      onChange(
        field.kind === "tel"
          ? formatPhone(event.target.value)
          : event.target.value,
      ),
    className: `${styles.input} ${error ? styles.inputError : ""}`,
  };

  return (
    <div className={styles.field} data-kind={field.kind}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {field.label}
        {field.required && (
          <span className={styles.req} aria-hidden>
            *
          </span>
        )}
      </label>
      {field.kind === "textarea" ? (
        <textarea {...shared} rows={3} />
      ) : (
        <input
          {...shared}
          type={
            field.kind === "email"
              ? "email"
              : field.kind === "tel"
                ? "tel"
                : "text"
          }
          inputMode={
            field.kind === "tel"
              ? "tel"
              : field.kind === "email"
                ? "email"
                : undefined
          }
          autoComplete={AUTOCOMPLETE[field.id]}
        />
      )}
      {error && (
        <span id={errorId} className={styles.fieldError} role="alert">
          <Alert className={styles.fieldErrorIcon} />
          {error}
        </span>
      )}
    </div>
  );
}
