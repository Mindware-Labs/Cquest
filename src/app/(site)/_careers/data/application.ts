import { z } from "zod";
import { EMAIL_RE, isValidPhone } from "../../quote/data/validation";

/* Reglas del CV. El límite vive aquí porque next.config.ts lo cita: el body de
   un Server Action tiene su propio tope (bodySizeLimit) y tiene que quedar por
   encima de este número más el overhead de multipart. */
export const CV_MAX_BYTES = 5 * 1024 * 1024;

export const CV_ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/* El atributo accept del input y el filtro por extensión del servidor. Un
   navegador puede mandar type vacío para .doc, así que la extensión es el
   segundo criterio, no el primero. */
export const CV_ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

export const CV_ACCEPT_ATTR = [...CV_ACCEPTED_TYPES, ...CV_ACCEPTED_EXTENSIONS].join(",");

export type ChoiceOption = { value: string; label: string };

export const EXPERIENCE_OPTIONS: readonly ChoiceOption[] = [
  { value: "none", label: "No prior experience" },
  { value: "under-1", label: "Less than 1 year" },
  { value: "1-3", label: "1 to 3 years" },
  { value: "3-plus", label: "More than 3 years" },
];

export const ENGLISH_OPTIONS: readonly ChoiceOption[] = [
  { value: "none", label: "None" },
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced / bilingual" },
];

export const AVAILABILITY_OPTIONS: readonly ChoiceOption[] = [
  { value: "immediate", label: "Immediate" },
  { value: "two-weeks", label: "In two weeks" },
  { value: "one-month", label: "In a month" },
];

export function optionLabel(
  options: readonly ChoiceOption[],
  value: string | undefined,
): string {
  if (!value) return "—";
  return options.find((option) => option.value === value)?.label ?? value;
}

export type ApplicationInput = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  english: string;
  availability: string;
  message: string;
  /* Slug de la vacante, o cadena vacía cuando la postulación entra por el banco
     de talento (/careers/apply). */
  positionSlug: string;
};

export const APPLICATION_FIELDS = [
  "fullName",
  "email",
  "phone",
  "city",
  "experience",
  "english",
  "availability",
  "message",
  "positionSlug",
] as const;

export const APPLICATION_MESSAGES = {
  name: "Please enter your full name",
  email: "Please enter your email",
  validEmail: "Enter a valid email address",
  phone: "Please enter your phone",
  validPhone: "Enter a valid phone number",
  city: "Please enter your city",
  choose: "Please choose an option",
  cvRequired: "Attach your CV",
  cvTooLarge: "Your CV must be under 5 MB",
  cvType: "Accepted formats: PDF, DOC or DOCX",
  consent: "You need to accept the handling of your data",
  generic: "We could not submit your application. Please try again.",
} as const;

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const oneOf = (options: readonly ChoiceOption[]) =>
  options.map((option) => option.value);

const t = APPLICATION_MESSAGES;

export const applicationSchema = z.object({
  fullName: z.preprocess(asTrimmed, z.string().min(1, t.name)),
  email: z.preprocess(asTrimmed, z.string().min(1, t.email).regex(EMAIL_RE, t.validEmail)),
  phone: z.preprocess(asTrimmed, z.string().min(1, t.phone).refine(isValidPhone, t.validPhone)),
  city: z.preprocess(asTrimmed, z.string().min(1, t.city)),
  experience: z.preprocess(asTrimmed, z.enum(oneOf(EXPERIENCE_OPTIONS) as [string, ...string[]], t.choose)),
  english: z.preprocess(asTrimmed, z.enum(oneOf(ENGLISH_OPTIONS) as [string, ...string[]], t.choose)),
  availability: z.preprocess(asTrimmed, z.enum(oneOf(AVAILABILITY_OPTIONS) as [string, ...string[]], t.choose)),
  /* Opcional a propósito: es el único campo libre y obligar a escribirlo
     cuesta candidatos sin aportar nada al filtro. */
  message: z.preprocess(asTrimmed, z.string().max(1200).optional()),
  positionSlug: z.preprocess(asTrimmed, z.string().optional()),
});

export type CvCheck = { ok: true } | { ok: false; message: string };

/* Se ejecuta en cliente (feedback inmediato) y otra vez en servidor (la de
   verdad). Mismo texto en los dos lados para que el candidato no vea un
   mensaje distinto según quién rechazó el archivo. */
export function checkCvFile(file: File | null): CvCheck {
  if (!file || file.size === 0) return { ok: false, message: t.cvRequired };
  if (file.size > CV_MAX_BYTES) return { ok: false, message: t.cvTooLarge };

  const type = file.type;
  const name = file.name.toLowerCase();
  const typeOk = (CV_ACCEPTED_TYPES as readonly string[]).includes(type);
  const extensionOk = CV_ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
  if (!typeOk && !extensionOk) return { ok: false, message: t.cvType };

  return { ok: true };
}
