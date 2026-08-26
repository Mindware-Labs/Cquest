import {
  CONTACT_FIELDS,
  CONTACT_METHODS,
  QUESTIONNAIRES,
  isRevealed,
  resolveChoice,
  resolveQuestion,
  type Answers,
  type Question,
  type QuoteSubmission,
} from "../data";
import type { Row } from "@/lib/emails/shell";

export const EMAIL_LANG = "es" as const;

export {
  C,
  FONT,
  escapeHtml,
  sectionLabel,
  rowsTable,
  emailShell,
  type Row,
} from "@/lib/emails/shell";

export function answerText(
  question: Question,
  answer: Answers[string] | undefined,
): string {
  if (answer == null) return "—";
  const resolved = resolveQuestion(question, EMAIL_LANG);
  const values = Array.isArray(answer) ? answer : [answer];
  const labels = values
    .filter((value) => value !== "")
    .map((value) => resolved.choices?.find((choice) => choice.value === value)?.label ?? value);
  return labels.length > 0 ? labels.join(", ") : "—";
}

export function contactRows(submission: QuoteSubmission): Row[] {
  const rows: Row[] = CONTACT_FIELDS.map((field) => ({
    label: resolveQuestion(field, EMAIL_LANG).label,
    value: ((submission.contact[field.id] as string) ?? "").trim() || "—",
  }));
  const preferred = submission.contact.preferred as string | undefined;
  const preferredChoice = CONTACT_METHODS.find((method) => method.value === preferred);
  rows.push({
    label: "Canal preferido",
    value: preferredChoice ? resolveChoice(preferredChoice, EMAIL_LANG).label : "—",
  });
  return rows;
}

export function detailRows(submission: QuoteSubmission): Row[] {
  return QUESTIONNAIRES[submission.service].questions

    .filter((question) => isRevealed(question, submission.details))
    .map((question) => ({
      label: resolveQuestion(question, EMAIL_LANG).label,
      value: answerText(question, submission.details[question.id]),
    }));
}
