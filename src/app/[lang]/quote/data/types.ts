import type { ServiceId, ServiceIconName } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

export type FieldKind = "single" | "multi" | "text" | "email" | "tel" | "textarea";

export type Choice = {
  value: string;
  copy: Record<Locale, { label: string; hint?: string }>;
  icon?: ServiceIconName;
};

export type RevealCondition = { question: string; value: string };

export type Question = {
  id: string;
  kind: FieldKind;
  copy: Record<Locale, { label: string; help?: string; placeholder?: string }>;
  required?: boolean;
  choices?: readonly Choice[];

  revealedBy?: RevealCondition;
};

export type Questionnaire = {
  serviceId: ServiceId;

  copy: Record<Locale, { lead: string }>;
  questions: readonly Question[];
};

export type ResolvedChoice = { value: string; label: string; hint?: string; icon?: ServiceIconName };

export type ResolvedQuestion = {
  id: string;
  kind: FieldKind;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  choices?: readonly ResolvedChoice[];
  revealedBy?: RevealCondition;
};

export type ResolvedQuestionnaire = {
  serviceId: ServiceId;
  lead: string;
  questions: readonly ResolvedQuestion[];
};

export function resolveChoice(choice: Choice, lang: Locale): ResolvedChoice {
  const { label, hint } = choice.copy[lang];
  return { value: choice.value, label, hint, icon: choice.icon };
}

export function resolveQuestion(question: Question, lang: Locale): ResolvedQuestion {
  const { label, help, placeholder } = question.copy[lang];
  return {
    id: question.id,
    kind: question.kind,
    label,
    help,
    placeholder,
    required: question.required,
    choices: question.choices?.map((choice) => resolveChoice(choice, lang)),
    revealedBy: question.revealedBy,
  };
}

export function resolveQuestionnaire(questionnaire: Questionnaire, lang: Locale): ResolvedQuestionnaire {
  return {
    serviceId: questionnaire.serviceId,
    lead: questionnaire.copy[lang].lead,
    questions: questionnaire.questions.map((question) => resolveQuestion(question, lang)),
  };
}

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

  locale: Locale;

  honeypot?: string;
  startedAt?: number;
  recaptchaToken?: string;
};
