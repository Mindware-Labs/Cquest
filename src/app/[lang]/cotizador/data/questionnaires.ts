import { SERVICES, type ServiceId } from "@/components/services/data";
import type { Choice, Question, Questionnaire } from "./types";

// Turn a service's own capability list into single/multi choices, so the
// options a prospect sees match exactly what each service page advertises.
function choicesFromDetails(id: ServiceId): Choice[] {
  const service = SERVICES.find((entry) => entry.id === id)!;
  return service.details.map((detail) => ({
    value: detail.id,
    copy: { es: { label: detail.title.es }, en: { label: detail.title.en } },
    icon: detail.icon,
  }));
}

/* ── Shared answer sets ─────────────────────────────────── */

const VOLUME: readonly Choice[] = [
  { value: "under-500", copy: { en: { label: "Under 500 / month" }, es: { label: "Menos de 500 / mes" } } },
  { value: "500-2k", copy: { en: { label: "500–2,000 / month" }, es: { label: "500–2,000 / mes" } } },
  { value: "2k-10k", copy: { en: { label: "2,000–10,000 / month" }, es: { label: "2,000–10,000 / mes" } } },
  { value: "10k-plus", copy: { en: { label: "10,000+ / month" }, es: { label: "10,000+ / mes" } } },
  { value: "unsure", copy: { en: { label: "Not sure yet" }, es: { label: "Aún no lo sé" } } },
];

const LANGUAGES: readonly Choice[] = [
  { value: "spanish", copy: { en: { label: "Spanish" }, es: { label: "Español" } } },
  { value: "english", copy: { en: { label: "English" }, es: { label: "Inglés" } } },
];

const HOURS: readonly Choice[] = [
  { value: "business", copy: { en: { label: "Business hours" }, es: { label: "Horario comercial" } } },
  { value: "extended", copy: { en: { label: "Extended (12–16h)" }, es: { label: "Extendido (12–16h)" } } },
  { value: "24-7", copy: { en: { label: "24 / 7" }, es: { label: "24/7" } } },
  { value: "unsure", copy: { en: { label: "Not sure yet" }, es: { label: "Aún no lo sé" } } },
];

const CHANNELS: readonly Choice[] = [
  { value: "phone", icon: "phone", copy: { en: { label: "Phone" }, es: { label: "Teléfono" } } },
  { value: "email", icon: "mail", copy: { en: { label: "Email" }, es: { label: "Correo" } } },
  { value: "chat", icon: "messages", copy: { en: { label: "Chat" }, es: { label: "Chat" } } },
  { value: "social", icon: "share", copy: { en: { label: "Social media" }, es: { label: "Redes sociales" } } },
  { value: "whatsapp", icon: "messages", copy: { en: { label: "WhatsApp" }, es: { label: "WhatsApp" } } },
];

// Optional free-text closer, shared by every questionnaire.
const NOTES: Question = {
  id: "notes",
  kind: "textarea",
  copy: {
    en: {
      label: "Anything else we should know?",
      help: "Optional — goals, current tools, deadlines, anything that gives us context.",
      placeholder: "Tell us a little about your operation and what success looks like…",
    },
    es: {
      label: "¿Algo más que debamos saber?",
      help: "Opcional — objetivos, herramientas actuales, plazos, cualquier cosa que nos dé contexto.",
      placeholder: "Cuéntanos un poco sobre tu operación y cómo se ve el éxito…",
    },
  },
};

/* ── Per-service questionnaires (Step 2) ────────────────── */

export const QUESTIONNAIRES: Record<ServiceId, Questionnaire> = {
  "call-center": {
    serviceId: "call-center",
    copy: {
      en: { lead: "A few details about the operation and we'll size it precisely." },
      es: { lead: "Unos detalles sobre la operación y la dimensionaremos con precisión." },
    },
    questions: [
      {
        id: "line",
        kind: "multi",
        required: true,
        choices: choicesFromDetails("call-center"),
        copy: {
          en: { label: "Which services do you need?" },
          es: { label: "¿Qué servicios necesitas?" },
        },
      },
      {
        id: "volume",
        kind: "single",
        required: true,
        choices: VOLUME,
        copy: {
          en: { label: "Expected monthly interaction volume" },
          es: { label: "Volumen mensual de interacciones esperado" },
        },
      },
      {
        id: "languages",
        kind: "multi",
        required: true,
        choices: LANGUAGES,
        copy: { en: { label: "Languages to support" }, es: { label: "Idiomas a atender" } },
      },
      {
        id: "hours",
        kind: "single",
        required: true,
        choices: HOURS,
        copy: { en: { label: "Coverage you need" }, es: { label: "Cobertura que necesitas" } },
      },
      {
        id: "channels",
        kind: "multi",
        choices: CHANNELS,
        copy: {
          en: { label: "Channels to cover", help: "Pick every channel your customers should be able to reach." },
          es: { label: "Canales a cubrir", help: "Elige cada canal por el que tus clientes deban poder contactarte." },
        },
      },
      NOTES,
    ],
  },

  bpo: {
    serviceId: "bpo",
    copy: {
      en: { lead: "Tell us which processes to run and at what scale." },
      es: { lead: "Cuéntanos qué procesos gestionar y a qué escala." },
    },
    questions: [
      {
        id: "processes",
        kind: "multi",
        required: true,
        choices: choicesFromDetails("bpo"),
        copy: { en: { label: "Which processes should we run?" }, es: { label: "¿Qué procesos debemos gestionar?" } },
      },
      {
        id: "volume",
        kind: "single",
        required: true,
        choices: VOLUME,
        copy: { en: { label: "Expected monthly volume" }, es: { label: "Volumen mensual esperado" } },
      },
      {
        id: "languages",
        kind: "multi",
        required: true,
        choices: LANGUAGES,
        copy: { en: { label: "Languages to support" }, es: { label: "Idiomas a atender" } },
      },
      {
        id: "hours",
        kind: "single",
        required: true,
        choices: HOURS,
        copy: { en: { label: "Coverage you need" }, es: { label: "Cobertura que necesitas" } },
      },
      NOTES,
    ],
  },

  systems: {
    serviceId: "systems",
    copy: {
      en: { lead: "Sketch the system and where you're starting from." },
      es: { lead: "Descríbenos el sistema y desde dónde partes." },
    },
    questions: [
      {
        id: "system-type",
        kind: "multi",
        required: true,
        choices: [
          ...choicesFromDetails("systems"),
          { value: "Something else", icon: "code", copy: { en: { label: "Something else" }, es: { label: "Algo más" } } },
        ],
        copy: { en: { label: "What do you need built?" }, es: { label: "¿Qué necesitas construir?" } },
      },
      {
        id: "situation",
        kind: "single",
        required: true,
        choices: [
          { value: "scratch", copy: { en: { label: "Building from scratch" }, es: { label: "Construyendo desde cero" } } },
          { value: "replace", copy: { en: { label: "Replacing an existing system" }, es: { label: "Reemplazando un sistema existente" } } },
          { value: "integrate", copy: { en: { label: "Integrating with current tools" }, es: { label: "Integrando con herramientas actuales" } } },
          { value: "unsure", copy: { en: { label: "Not sure yet" }, es: { label: "Aún no lo sé" } } },
        ],
        copy: { en: { label: "Where are you starting from?" }, es: { label: "¿Desde dónde partes?" } },
      },
      {
        id: "timeline",
        kind: "single",
        required: true,
        choices: [
          { value: "asap", copy: { en: { label: "As soon as possible" }, es: { label: "Lo antes posible" } } },
          { value: "1-3", copy: { en: { label: "1–3 months" }, es: { label: "1–3 meses" } } },
          { value: "3-6", copy: { en: { label: "3–6 months" }, es: { label: "3–6 meses" } } },
          { value: "explore", copy: { en: { label: "Just exploring" }, es: { label: "Solo explorando" } } },
        ],
        copy: { en: { label: "Ideal timeline" }, es: { label: "Plazo ideal" } },
      },
      NOTES,
    ],
  },
};
