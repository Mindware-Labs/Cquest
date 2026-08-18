import { z } from "zod";
import { EMAIL_RE, isValidPhone } from "../../quote/data/validation";
import type { Locale } from "@/i18n/config";
import type { LocalizedText } from "./types";

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

export type ChoiceOption = { value: string; label: LocalizedText };

export const EXPERIENCE_OPTIONS: readonly ChoiceOption[] = [
  { value: "none", label: { en: "No prior experience", es: "Sin experiencia previa" } },
  { value: "under-1", label: { en: "Less than 1 year", es: "Menos de 1 año" } },
  { value: "1-3", label: { en: "1 to 3 years", es: "De 1 a 3 años" } },
  { value: "3-plus", label: { en: "More than 3 years", es: "Más de 3 años" } },
];

export const ENGLISH_OPTIONS: readonly ChoiceOption[] = [
  { value: "none", label: { en: "None", es: "Ninguno" } },
  { value: "basic", label: { en: "Basic", es: "Básico" } },
  { value: "intermediate", label: { en: "Intermediate", es: "Intermedio" } },
  { value: "advanced", label: { en: "Advanced / bilingual", es: "Avanzado / bilingüe" } },
];

export const AVAILABILITY_OPTIONS: readonly ChoiceOption[] = [
  { value: "immediate", label: { en: "Immediate", es: "Inmediata" } },
  { value: "two-weeks", label: { en: "In two weeks", es: "En dos semanas" } },
  { value: "one-month", label: { en: "In a month", es: "En un mes" } },
];

export function optionLabel(
  options: readonly ChoiceOption[],
  value: string | undefined,
  lang: Locale,
): string {
  if (!value) return "—";
  return options.find((option) => option.value === value)?.label[lang] ?? value;
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

const MESSAGES: Record<
  Locale,
  {
    name: string;
    email: string;
    validEmail: string;
    phone: string;
    validPhone: string;
    city: string;
    choose: string;
    cvRequired: string;
    cvTooLarge: string;
    cvType: string;
    consent: string;
    generic: string;
  }
> = {
  en: {
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
  },
  es: {
    name: "Ingresa tu nombre completo",
    email: "Ingresa tu correo",
    validEmail: "Ingresa un correo válido",
    phone: "Ingresa tu teléfono",
    validPhone: "Ingresa un número de teléfono válido",
    city: "Ingresa tu ciudad",
    choose: "Elige una opción",
    cvRequired: "Adjunta tu CV",
    cvTooLarge: "El CV debe pesar menos de 5 MB",
    cvType: "Formatos aceptados: PDF, DOC o DOCX",
    consent: "Necesitas aceptar el tratamiento de tus datos",
    generic: "No pudimos enviar tu postulación. Inténtalo de nuevo.",
  },
};

export function applicationMessages(lang: Locale) {
  return MESSAGES[lang];
}

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const oneOf = (options: readonly ChoiceOption[]) =>
  options.map((option) => option.value);

export function applicationSchema(lang: Locale) {
  const t = MESSAGES[lang];
  return z.object({
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
}

export type CvCheck = { ok: true } | { ok: false; message: string };

/* Se ejecuta en cliente (feedback inmediato) y otra vez en servidor (la de
   verdad). Mismo texto en los dos lados para que el candidato no vea un
   mensaje distinto según quién rechazó el archivo. */
export function checkCvFile(file: File | null, lang: Locale): CvCheck {
  const t = MESSAGES[lang];
  if (!file || file.size === 0) return { ok: false, message: t.cvRequired };
  if (file.size > CV_MAX_BYTES) return { ok: false, message: t.cvTooLarge };

  const type = file.type;
  const name = file.name.toLowerCase();
  const typeOk = (CV_ACCEPTED_TYPES as readonly string[]).includes(type);
  const extensionOk = CV_ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
  if (!typeOk && !extensionOk) return { ok: false, message: t.cvType };

  return { ok: true };
}
