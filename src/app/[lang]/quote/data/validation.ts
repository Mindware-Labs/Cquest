import { z } from "zod";
import type { Locale } from "@/i18n/config";
import type { Questionnaire } from "./types";

// A single answer counts as "given" if it's a non-empty string or a
// multi-select with at least one choice. Shared by the wizard's step-gating
// and the per-question error hints so both agree on what "answered" means.
export function isAnswered(value: string | string[] | undefined): boolean {
  return Array.isArray(value) ? value.length > 0 : Boolean(value && value.trim());
}

// Deliberately permissive: catches obvious typos (missing @, no domain) without
// rejecting valid-but-unusual addresses. Real deliverability is verified later,
// server-side, when the email integration lands.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATION_MESSAGES: Record<
  Locale,
  {
    selectAtLeastOne: string;
    chooseOption: string;
    required: string;
    enterName: string;
    enterCompany: string;
    enterEmail: string;
    validEmail: string;
    enterPhone: string;
    validPhone: string;
  }
> = {
  en: {
    selectAtLeastOne: "Select at least one option",
    chooseOption: "Please choose an option",
    required: "Required",
    enterName: "Please enter your name",
    enterCompany: "Please enter your company",
    enterEmail: "Please enter your email",
    validEmail: "Enter a valid email address",
    enterPhone: "Please enter your phone",
    validPhone: "Enter a valid phone number",
  },
  es: {
    selectAtLeastOne: "Selecciona al menos una opción",
    chooseOption: "Elige una opción",
    required: "Obligatorio",
    enterName: "Ingresa tu nombre",
    enterCompany: "Ingresa tu empresa",
    enterEmail: "Ingresa tu correo",
    validEmail: "Ingresa un correo válido",
    enterPhone: "Ingresa tu teléfono",
    validPhone: "Ingresa un número de teléfono válido",
  },
};

/* ── Step 2 validation (Zod) ────────────────────────────────
   Step 2 is data-driven, so its validator is too: we build a Zod schema straight
   from the active service's questionnaire. A required single-choice must be a
   non-empty string, a required multi-choice a non-empty array; the shared
   free-text note is always optional. One schema powers both the "Continue" gate
   and the per-question error messages. */
export function detailsSchema(questionnaire: Questionnaire, lang: Locale) {
  const t = VALIDATION_MESSAGES[lang];
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const question of questionnaire.questions) {
    if (question.kind === "multi") {
      shape[question.id] = question.required
        ? z.preprocess((value) => value ?? [], z.array(z.string()).min(1, t.selectAtLeastOne))
        : z.array(z.string()).optional();
    } else if (question.kind === "single") {
      shape[question.id] = question.required
        ? z.preprocess((value) => value ?? "", z.string().min(1, t.chooseOption))
        : z.string().optional();
    } else {
      // text / email / tel / textarea — the optional free-text note.
      shape[question.id] = question.required
        ? z.preprocess((value) => (typeof value === "string" ? value.trim() : ""), z.string().min(1, t.required))
        : z.string().optional();
    }
  }

  return z.object(shape);
}

// Map a Zod failure to a { questionId: message } lookup the wizard can hand to
// each field. Only the first issue per field is surfaced.
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in map)) map[key] = issue.message;
  }
  return map;
}

/* ── Step 3 validation (Zod) ────────────────────────────────
   Contact details are a fixed shape, so the schema is a plain object. Beyond
   "required", email and phone get real format checks — the phone accepts a full
   10-digit local number (with an optional +1 country code), matching what
   `formatPhone` produces as the prospect types. */

// A phone is valid once it carries a complete 10-digit local number (optionally
// prefixed with a 1 country code). Punctuation is ignored — dashes are cosmetic.
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function contactSchema(lang: Locale) {
  const t = VALIDATION_MESSAGES[lang];
  return z.object({
    name: z.preprocess(asTrimmed, z.string().min(1, t.enterName)),
    company: z.preprocess(asTrimmed, z.string().min(1, t.enterCompany)),
    email: z.preprocess(asTrimmed, z.string().min(1, t.enterEmail).regex(EMAIL_RE, t.validEmail)),
    phone: z.preprocess(asTrimmed, z.string().min(1, t.enterPhone).refine(isValidPhone, t.validPhone)),
    preferred: z.string().optional(),
  });
}
