import { SERVICES, type ServiceId } from "@/components/services/data";
import type { Choice, Question, Questionnaire } from "./types";

function choicesFromDetails(id: ServiceId): Choice[] {
  const service = SERVICES.find((entry) => entry.id === id)!;
  return service.details.map((detail) => ({
    value: detail.id,
    label: detail.title,
    icon: detail.icon,
  }));
}

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
  { value: "other", label: "Other" },
];

const LANGUAGES_OTHER: Question = {
  id: "languagesOther",
  kind: "text",
  required: true,
  revealedBy: { question: "languages", value: "other" },
  label: "Which other language?",
  placeholder: "Portuguese, French, Italian…",
};

const HOURS: readonly Choice[] = [
  { value: "business", label: "Business hours" },
  { value: "extended", label: "Extended (12–16h)" },
  { value: "24-7", label: "24 / 7" },
  { value: "unsure", label: "Not sure yet" },
];

const CHANNELS: readonly Choice[] = [
  { value: "phone", icon: "phone", label: "Phone" },
  { value: "email", icon: "mail", label: "Email" },
  { value: "chat", icon: "messages", label: "Chat" },
  { value: "social", icon: "share", label: "Social media" },
  { value: "whatsapp", icon: "messages", label: "WhatsApp" },
];

const NOTES: Question = {
  id: "notes",
  kind: "textarea",
  label: "Anything else we should know?",
  help: "Optional — goals, current tools, deadlines, anything that gives us context.",
  placeholder: "Tell us a little about your operation and what success looks like…",
};

export const QUESTIONNAIRES: Record<ServiceId, Questionnaire> = {
  "call-center": {
    serviceId: "call-center",
    lead: "A few details about the operation and we'll size it precisely.",
    questions: [
      {
        id: "line",
        kind: "multi",
        required: true,
        choices: choicesFromDetails("call-center"),
        label: "Which services do you need?",
      },
      {
        id: "volume",
        kind: "single",
        required: true,
        choices: VOLUME,
        label: "Expected monthly interaction volume",
      },
      {
        id: "languages",
        kind: "multi",
        required: true,
        choices: LANGUAGES,
        label: "Languages to support",
      },
      LANGUAGES_OTHER,
      {
        id: "hours",
        kind: "single",
        required: true,
        choices: HOURS,
        label: "Coverage you need",
      },
      {
        id: "channels",
        kind: "multi",
        choices: CHANNELS,
        label: "Channels to cover",
        help: "Pick every channel your customers should be able to reach.",
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
        required: true,
        choices: choicesFromDetails("bpo"),
        label: "Which processes should we run?",
      },
      {
        id: "volume",
        kind: "single",
        required: true,
        choices: VOLUME,
        label: "Expected monthly volume",
      },
      {
        id: "languages",
        kind: "multi",
        required: true,
        choices: LANGUAGES,
        label: "Languages to support",
      },
      LANGUAGES_OTHER,
      {
        id: "hours",
        kind: "single",
        required: true,
        choices: HOURS,
        label: "Coverage you need",
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
        required: true,
        choices: [
          ...choicesFromDetails("systems"),
          { value: "Something else", icon: "code", label: "Something else" },
        ],
        label: "What do you need built?",
      },
      {
        id: "situation",
        kind: "single",
        required: true,
        choices: [
          { value: "scratch", label: "Building from scratch" },
          { value: "replace", label: "Replacing an existing system" },
          { value: "integrate", label: "Integrating with current tools" },
          { value: "unsure", label: "Not sure yet" },
        ],
        label: "Where are you starting from?",
      },
      {
        id: "timeline",
        kind: "single",
        required: true,
        choices: [
          { value: "asap", label: "As soon as possible" },
          { value: "1-3", label: "1–3 months" },
          { value: "3-6", label: "3–6 months" },
          { value: "explore", label: "Just exploring" },
        ],
        label: "Ideal timeline",
      },
      NOTES,
    ],
  },
};
