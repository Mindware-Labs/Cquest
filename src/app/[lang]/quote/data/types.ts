import type { ServiceId, ServiceIconName } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

/* ── The smart quote form model ───────────────────────────
   Requirements §3.2 asks for a step-by-step assistant: Step 1 picks a
   business line, Step 2 asks questions SPECIFIC to that line, Step 3 takes
   contact details. Step 2 is therefore data-driven — one questionnaire per
   service — so the form's shape is content, not code, and the marketing team
   (or a later admin panel) can reshape it without touching the wizard.

   Every user-facing string lives behind a `copy: Record<Locale, ...>` block
   instead of a bare field, resolved via `resolveQuestion`/`resolveChoice`/
   `resolveQuestionnaire` below at the point a component renders it — so a
   missing translation is a TypeScript error, not a silent runtime gap. */

export type FieldKind = "single" | "multi" | "text" | "email" | "tel" | "textarea";

export type Choice = {
  value: string;
  copy: Record<Locale, { label: string; hint?: string }>;
  icon?: ServiceIconName;
};

/* A follow-up question's condition. Kept in the questionnaire rather than in
   the wizard so a conditional field stays content, like everything else here:
   the marketing team can hang a "which one?" off any choice without a code
   change. `value` matches a single-select answer outright, or membership for
   a multi-select — which is what makes it work for "Other" in either. */
export type RevealCondition = { question: string; value: string };

export type Question = {
  id: string;
  kind: FieldKind;
  copy: Record<Locale, { label: string; help?: string; placeholder?: string }>;
  required?: boolean;
  choices?: readonly Choice[];
  /** Rendered, validated and reported only while this condition holds. */
  revealedBy?: RevealCondition;
};

export type Questionnaire = {
  serviceId: ServiceId;
  /** One line of framing shown atop step 2, in the service's own voice. */
  copy: Record<Locale, { lead: string }>;
  questions: readonly Question[];
};

/* ── Resolved (flat) shapes — what components actually render ── */

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

/* The single place that decides whether a conditional question is in play.
   Shared by the renderer, the validator, the wizard's answer housekeeping and
   the sales email — four things that must never disagree about whether a
   field exists, or the prospect gets blocked by a question they cannot see. */
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
  /** The prospect's site language when they submitted — not necessarily the
   *  language the internal sales notification is sent in (see emails/sales.ts). */
  locale: Locale;
  /** Anti-spam layers, all optional: only the real wizard submission
   *  populates them — a test/embed `onSubmit` override may skip some or all
   *  of them, which just means that call path gets less checking, not a
   *  crash. `honeypot` is a field real prospects never see or fill; a
   *  non-empty value means a bot filled the whole form. `startedAt` is
   *  `Date.now()` at wizard mount — anything faster than a human could
   *  plausibly complete all 3 steps is rejected. `recaptchaToken` is a
   *  reCAPTCHA v3 token from `grecaptcha.execute()`, verified server-side
   *  against Google's siteverify endpoint (score + action check). */
  honeypot?: string;
  startedAt?: number;
  recaptchaToken?: string;
};
