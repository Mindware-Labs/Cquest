import type { Choice, Question } from "./types";

/* ── Step 3 — contact ───────────────────────────────────── */

export const CONTACT_FIELDS: readonly Question[] = [
  { id: "name", kind: "text", label: "Full name", required: true, placeholder: "Jane Doe" },
  { id: "company", kind: "text", label: "Company", required: true, placeholder: "Acme Inc." },
  { id: "email", kind: "email", label: "Work email", required: true, placeholder: "jane@company.com" },
  { id: "phone", kind: "tel", label: "Phone / WhatsApp", required: true, placeholder: "809-000-0000" },
];

export const CONTACT_METHODS: readonly Choice[] = [
  { value: "email", label: "Email", icon: "mail" },
  { value: "phone", label: "Phone", icon: "phone" },
  { value: "whatsapp", label: "WhatsApp", icon: "messages" },
];

/* ── Step metadata ──────────────────────────────────────── */

export const STEPS = [
  { id: "service", label: "Service" },
  { id: "details", label: "Details" },
  { id: "contact", label: "Contact" },
] as const;

export type StepIndex = 0 | 1 | 2;
