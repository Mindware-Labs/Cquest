import { z } from "zod";

/* Sin "server-only": el formulario valida en el navegador con el MISMO esquema
   que la server action revalida después. El gate del cliente es comodidad. */

export type ChoiceOption = { value: string; label: string };

export const EXPERIENCE_OPTIONS: readonly ChoiceOption[] = [
  { value: "none", label: "No experience yet" },
  { value: "lt1", label: "Under 1 year" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5+", label: "5+ years" },
];

export const ENGLISH_OPTIONS: readonly ChoiceOption[] = [
  { value: "basic", label: "Basic" },
  { value: "conversational", label: "Conversational" },
  { value: "advanced", label: "Advanced" },
  { value: "native", label: "Native / bilingual" },
];

export const AVAILABILITY_OPTIONS: readonly ChoiceOption[] = [
  { value: "immediate", label: "Immediately" },
  { value: "2weeks", label: "In two weeks" },
  { value: "1month", label: "In a month" },
  { value: "later", label: "Later on" },
];

export function optionLabel(options: readonly ChoiceOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export const RECAPTCHA_ACTION = "submit_application";

export const CV_MAX_BYTES = 5 * 1024 * 1024;

const CV_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export const CV_MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(CV_MIME).map(([mime, ext]) => [ext, mime]),
);

export const CV_ACCEPT_ATTR = [".pdf", ".doc", ".docx", ...Object.keys(CV_MIME)].join(",");

export type CvCheck = { ok: true; ext: string } | { ok: false; message: string };

export function checkCvFile(file: File | null): CvCheck {
  if (!file || file.size === 0) return { ok: false, message: "Attach your resume to continue." };
  if (file.size > CV_MAX_BYTES) return { ok: false, message: "That file is over 5 MB. Try a lighter export." };
  const byExt = file.name.toLowerCase().match(/\.(pdf|docx?)$/)?.[1];
  const byType = file.type ? CV_MIME[file.type] : undefined;
  // Windows a veces manda un type vacío para .doc/.docx: la extensión basta.
  if (!byExt && !byType) return { ok: false, message: "Use a PDF, DOC or DOCX file." };
  if (file.type && !byType) return { ok: false, message: "Use a PDF, DOC or DOCX file." };
  return { ok: true, ext: byExt ?? byType! };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function enumOf(options: readonly ChoiceOption[], message: string) {
  return z.enum(options.map((option) => option.value) as [string, ...string[]], { message });
}

export const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your full name.").max(120, "That name is too long."),
  email: z.email("Enter a valid email address.").trim().max(160, "That email is too long."),
  phone: z
    .string()
    .trim()
    .max(40, "That number is too long.")
    .refine((value) => value.replace(/\D/g, "").length >= 7, "Enter a phone we can call or WhatsApp."),
  city: z.string().trim().min(2, "Where are you based?").max(120, "That is too long."),
  experience: enumOf(EXPERIENCE_OPTIONS, "Pick your experience level."),
  english: enumOf(ENGLISH_OPTIONS, "Pick your English level."),
  availability: enumOf(AVAILABILITY_OPTIONS, "Tell us when you could start."),
  message: z.string().trim().max(1200, "Keep it under 1,200 characters.").default(""),
  departmentSlug: z.string().trim().max(80).default(""),
});

export type ApplicationValues = z.input<typeof applicationSchema>;

export const APPLICATION_FIELDS = [
  "fullName",
  "email",
  "phone",
  "city",
  "experience",
  "english",
  "availability",
  "message",
  "departmentSlug",
] as const;

export const EMPTY_VALUES: ApplicationValues = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  experience: "",
  english: "",
  availability: "",
  message: "",
  departmentSlug: "",
};

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}
