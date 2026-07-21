import {
  SERVICES,
  type Service,
  type ServiceId,
  type ServiceIconName,
} from "@/components/services/data";

/* ── The smart quote form model ───────────────────────────
   Requirements §3.2 asks for a step-by-step assistant: Step 1 picks a
   business line, Step 2 asks questions SPECIFIC to that line, Step 3 takes
   contact details. Step 2 is therefore data-driven — one questionnaire per
   service — so the form's shape is content, not code, and the marketing team
   (or a later admin panel) can reshape it without touching the wizard.

   English first; a bilingual (ES/EN) pass comes later, so every user-facing
   string lives here in one place rather than scattered through JSX. */

export type FieldKind = "single" | "multi" | "text" | "email" | "tel" | "textarea";

export type Choice = {
  value: string;
  label: string;
  hint?: string;
  icon?: ServiceIconName;
};

export type Question = {
  id: string;
  kind: FieldKind;
  label: string;
  help?: string;
  required?: boolean;
  choices?: readonly Choice[];
  placeholder?: string;
};

export type Questionnaire = {
  serviceId: ServiceId;
  /** One line of framing shown atop step 2, in the service's own voice. */
  lead: string;
  questions: readonly Question[];
};

// The three business-line cards shown in Step 1. Derived from the shared
// SERVICES source of truth so labels, colours and straplines never drift from
// the rest of the site; only the lead icon is chosen here.
const SERVICE_LEAD_ICON: Record<ServiceId, ServiceIconName> = {
  "call-center": "headset",
  bpo: "layers",
  systems: "layout",
};

export type ServiceCard = Service & { leadIcon: ServiceIconName };

export const SERVICE_CARDS: readonly ServiceCard[] = SERVICES.map((service) => ({
  ...service,
  leadIcon: SERVICE_LEAD_ICON[service.id],
}));

export function getService(id: ServiceId | null): ServiceCard | null {
  return SERVICE_CARDS.find((service) => service.id === id) ?? null;
}

// Turn a service's own capability list into single/multi choices, so the
// options a prospect sees match exactly what each service page advertises.
function choicesFromDetails(id: ServiceId): Choice[] {
  const service = SERVICES.find((entry) => entry.id === id)!;
  return service.details.map((detail) => ({
    value: detail.title,
    label: detail.title,
    icon: detail.icon,
  }));
}

/* ── Shared answer sets ─────────────────────────────────── */

const VOLUME: readonly Choice[] = [
  { value: "under-500", label: "Under 500 / month" },
  { value: "500-2k", label: "500–2,000 / month" },
  { value: "2k-10k", label: "2,000–10,000 / month" },
  { value: "10k-plus", label: "10,000+ / month" },
  { value: "unsure", label: "Not sure yet" },
];

const LANGUAGES: readonly Choice[] = [
  { value: "spanish", label: "Spanish" },
  { value: "english", label: "English" },
];

const HOURS: readonly Choice[] = [
  { value: "business", label: "Business hours" },
  { value: "extended", label: "Extended (12–16h)" },
  { value: "24-7", label: "24 / 7" },
  { value: "unsure", label: "Not sure yet" },
];

const CHANNELS: readonly Choice[] = [
  { value: "phone", label: "Phone", icon: "phone" },
  { value: "email", label: "Email", icon: "mail" },
  { value: "chat", label: "Chat", icon: "messages" },
  { value: "social", label: "Social media", icon: "share" },
  { value: "whatsapp", label: "WhatsApp", icon: "messages" },
];

// Optional free-text closer, shared by every questionnaire.
const NOTES: Question = {
  id: "notes",
  kind: "textarea",
  label: "Anything else we should know?",
  help: "Optional — goals, current tools, deadlines, anything that gives us context.",
  placeholder: "Tell us a little about your operation and what success looks like…",
};

/* ── Per-service questionnaires (Step 2) ────────────────── */

export const QUESTIONNAIRES: Record<ServiceId, Questionnaire> = {
  "call-center": {
    serviceId: "call-center",
    lead: "A few details about the operation and we'll size it precisely.",
    questions: [
      {
        id: "line",
        kind: "single",
        label: "Which service do you need?",
        required: true,
        choices: choicesFromDetails("call-center"),
      },
      {
        id: "volume",
        kind: "single",
        label: "Expected monthly interaction volume",
        required: true,
        choices: VOLUME,
      },
      {
        id: "languages",
        kind: "multi",
        label: "Languages to support",
        required: true,
        choices: LANGUAGES,
      },
      {
        id: "hours",
        kind: "single",
        label: "Coverage you need",
        required: true,
        choices: HOURS,
      },
      {
        id: "channels",
        kind: "multi",
        label: "Channels to cover",
        help: "Pick every channel your customers should be able to reach.",
        choices: CHANNELS,
      },
      NOTES,
    ],
  },

  bpo: {
    serviceId: "bpo",
    lead: "Tell us which processes to run and at what scale.",
    questions: [
      {
        id: "processes",
        kind: "multi",
        label: "Which processes should we run?",
        required: true,
        choices: choicesFromDetails("bpo"),
      },
      {
        id: "volume",
        kind: "single",
        label: "Expected monthly volume",
        required: true,
        choices: VOLUME,
      },
      {
        id: "languages",
        kind: "multi",
        label: "Languages to support",
        required: true,
        choices: LANGUAGES,
      },
      {
        id: "hours",
        kind: "single",
        label: "Coverage you need",
        required: true,
        choices: HOURS,
      },
      NOTES,
    ],
  },

  systems: {
    serviceId: "systems",
    lead: "Sketch the system and where you're starting from.",
    questions: [
      {
        id: "system-type",
        kind: "multi",
        label: "What do you need built?",
        required: true,
        choices: [
          ...choicesFromDetails("systems"),
          { value: "Something else", label: "Something else", icon: "code" },
        ],
      },
      {
        id: "situation",
        kind: "single",
        label: "Where are you starting from?",
        required: true,
        choices: [
          { value: "scratch", label: "Building from scratch" },
          { value: "replace", label: "Replacing an existing system" },
          { value: "integrate", label: "Integrating with current tools" },
          { value: "unsure", label: "Not sure yet" },
        ],
      },
      {
        id: "timeline",
        kind: "single",
        label: "Ideal timeline",
        required: true,
        choices: [
          { value: "asap", label: "As soon as possible" },
          { value: "1-3", label: "1–3 months" },
          { value: "3-6", label: "3–6 months" },
          { value: "explore", label: "Just exploring" },
        ],
      },
      NOTES,
    ],
  },
};

/* ── Step 3 — contact ───────────────────────────────────── */

export const CONTACT_FIELDS: readonly Question[] = [
  { id: "name", kind: "text", label: "Full name", required: true, placeholder: "Jane Doe" },
  { id: "company", kind: "text", label: "Company", required: true, placeholder: "Acme Inc." },
  { id: "email", kind: "email", label: "Work email", required: true, placeholder: "jane@company.com" },
  { id: "phone", kind: "tel", label: "Phone / WhatsApp", required: true, placeholder: "+1 809 000 0000" },
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

/* ── Deep-link resolution ───────────────────────────────────
   Service pages link in with ?servicio=<id> so the prospect lands on Step 2
   already in context. Accept a few spellings/aliases and reject anything
   unknown (falls back to Step 1). */
export function resolveService(param?: string | string[]): ServiceId | null {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  const aliases: Record<string, ServiceId> = {
    "call-center": "call-center",
    callcenter: "call-center",
    call_center: "call-center",
    bpo: "bpo",
    systems: "systems",
    "systems-development": "systems",
    sistemas: "systems",
    desarrollo: "systems",
  };
  return aliases[key] ?? null;
}

/* ── Wizard answer shape ────────────────────────────────── */

export type Answers = Record<string, string | string[]>;

export type QuoteSubmission = {
  service: ServiceId;
  details: Answers;
  contact: Answers;
};

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
