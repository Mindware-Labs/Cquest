import { z } from "zod";
import { isRevealed, type Answers, type Questionnaire } from "./types";

export function isAnswered(value: string | string[] | undefined): boolean {
  return Array.isArray(value) ? value.length > 0 : Boolean(value && value.trim());
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES = {
  selectAtLeastOne: "Select at least one option",
  chooseOption: "Please choose an option",
  required: "Required",
  enterName: "Please enter your name",
  enterCompany: "Please enter your company",
  enterEmail: "Please enter your email",
  validEmail: "Enter a valid email address",
  enterPhone: "Please enter your phone",
  validPhone: "Enter a valid phone number",
};

export function detailsSchema(questionnaire: Questionnaire) {
  const t = MESSAGES;
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const question of questionnaire.questions) {
    if (question.revealedBy) {
      shape[question.id] =
        question.kind === "multi" ? z.array(z.string()).optional() : z.string().optional();
      continue;
    }

    if (question.kind === "multi") {
      shape[question.id] = question.required
        ? z.preprocess((value) => value ?? [], z.array(z.string()).min(1, t.selectAtLeastOne))
        : z.array(z.string()).optional();
    } else if (question.kind === "single") {
      shape[question.id] = question.required
        ? z.preprocess((value) => value ?? "", z.string().min(1, t.chooseOption))
        : z.string().optional();
    } else {
      shape[question.id] = question.required
        ? z.preprocess((value) => (typeof value === "string" ? value.trim() : ""), z.string().min(1, t.required))
        : z.string().optional();
    }
  }

  return z.object(shape).superRefine((answers, ctx) => {
    for (const question of questionnaire.questions) {
      if (!question.revealedBy || !question.required) continue;
      if (!isRevealed(question, answers as Answers)) continue;
      if (isAnswered((answers as Answers)[question.id])) continue;
      ctx.addIssue({ code: "custom", message: t.required, path: [question.id] });
    }
  });
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in map)) map[key] = issue.message;
  }
  return map;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function contactSchema() {
  const t = MESSAGES;
  return z.object({
    name: z.preprocess(asTrimmed, z.string().min(1, t.enterName)),
    company: z.preprocess(asTrimmed, z.string().min(1, t.enterCompany)),
    email: z.preprocess(asTrimmed, z.string().min(1, t.enterEmail).regex(EMAIL_RE, t.validEmail)),
    phone: z.preprocess(asTrimmed, z.string().min(1, t.enterPhone).refine(isValidPhone, t.validPhone)),
    preferred: z.string().optional(),
  });
}
