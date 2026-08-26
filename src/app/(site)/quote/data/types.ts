import type { ServiceId, ServiceIconName } from "@/components/services/data";

export type FieldKind = "single" | "multi" | "text" | "email" | "tel" | "textarea";

export type Choice = {
  value: string;
  label: string;
  hint?: string;
  icon?: ServiceIconName;
};

export type RevealCondition = { question: string; value: string };

export type Question = {
  id: string;
  kind: FieldKind;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  choices?: readonly Choice[];

  revealedBy?: RevealCondition;
};

export type Questionnaire = {
  serviceId: ServiceId;
  lead: string;
  questions: readonly Question[];
};

export type Answers = Record<string, string | string[]>;

/* Una pregunta condicional solo cuenta si su puerta está contestada. Lo usan
   el gate del wizard y el email: un solo veredicto para los dos. */
export function isRevealed(
  question: { revealedBy?: RevealCondition },
  answers: Answers,
): boolean {
  if (!question.revealedBy) return true;
  const gate = answers[question.revealedBy.question];
  return Array.isArray(gate)
    ? gate.includes(question.revealedBy.value)
    : gate === question.revealedBy.value;
}

export type QuoteSubmission = {
  service: ServiceId;
  details: Answers;
  contact: Answers;

  honeypot?: string;
  startedAt?: number;
  recaptchaToken?: string;
};
