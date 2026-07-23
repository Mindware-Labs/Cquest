import type { Choice, Question } from "./types";

/* ── Step 3 — contact ───────────────────────────────────── */

export const CONTACT_FIELDS: readonly Question[] = [
  {
    id: "name",
    kind: "text",
    required: true,
    copy: {
      en: { label: "Full name", placeholder: "Jane Doe" },
      es: { label: "Nombre completo", placeholder: "Juan Pérez" },
    },
  },
  {
    id: "company",
    kind: "text",
    required: true,
    copy: {
      en: { label: "Company", placeholder: "Acme Inc." },
      es: { label: "Empresa", placeholder: "Mi Empresa SRL" },
    },
  },
  {
    id: "email",
    kind: "email",
    required: true,
    copy: {
      en: { label: "Work email", placeholder: "jane@company.com" },
      es: { label: "Correo laboral", placeholder: "juan@empresa.com" },
    },
  },
  {
    id: "phone",
    kind: "tel",
    required: true,
    copy: {
      en: { label: "Phone / WhatsApp", placeholder: "809-000-0000" },
      es: { label: "Teléfono / WhatsApp", placeholder: "809-000-0000" },
    },
  },
];

export const CONTACT_METHODS: readonly Choice[] = [
  { value: "email", icon: "mail", copy: { en: { label: "Email" }, es: { label: "Correo" } } },
  { value: "phone", icon: "phone", copy: { en: { label: "Phone" }, es: { label: "Teléfono" } } },
  { value: "whatsapp", icon: "messages", copy: { en: { label: "WhatsApp" }, es: { label: "WhatsApp" } } },
];

/* ── Step metadata ──────────────────────────────────────── */

export const STEPS = [
  { id: "service", copy: { en: { label: "Service" }, es: { label: "Servicio" } } },
  { id: "details", copy: { en: { label: "Details" }, es: { label: "Detalles" } } },
  { id: "contact", copy: { en: { label: "Contact" }, es: { label: "Contacto" } } },
] as const;

export type StepIndex = 0 | 1 | 2;
