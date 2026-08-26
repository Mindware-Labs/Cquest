import type { Choice, Question } from "./types";

export const CONTACT_FIELDS: readonly Question[] = [
  {
    id: "name",
    kind: "text",
    required: true,
    label: "Full name",
    placeholder: "Jane Doe",
  },
  {
    id: "company",
    kind: "text",
    required: true,
    label: "Company",
    placeholder: "Acme Inc.",
  },
  {
    id: "email",
    kind: "email",
    required: true,
    label: "Work email",
    placeholder: "jane@company.com",
  },
  {
    id: "phone",
    kind: "tel",
    required: true,
    label: "Phone / WhatsApp",
    placeholder: "809-000-0000",
  },
];

export const CONTACT_METHODS: readonly Choice[] = [
  { value: "email", icon: "mail", label: "Email" },
  { value: "phone", icon: "phone", label: "Phone" },
  { value: "whatsapp", icon: "messages", label: "WhatsApp" },
];

export const STEPS = [
  { id: "service", label: "Service" },
  { id: "details", label: "Details" },
  { id: "contact", label: "Contact" },
] as const;

export type StepIndex = 0 | 1 | 2;
