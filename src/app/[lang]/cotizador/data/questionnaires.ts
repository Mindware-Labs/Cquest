import { SERVICES, type ServiceId } from "@/components/services/data";
import type { Choice, Question, Questionnaire } from "./types";

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
        kind: "multi",
        label: "Which services do you need?",
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
