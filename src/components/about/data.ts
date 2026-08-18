import type { Locale } from "@/i18n/config";
import type { ServiceIconName } from "@/components/services/data";

export const ABOUT_METRICS: ReadonlyArray<{
  id: string;
  value: number;
  suffix: string;
  label: Record<Locale, string>;
}> = [
  { id: "agents", value: 200, suffix: "+", label: { en: "Call center operators", es: "Operadores de call center" } },
  { id: "developers", value: 10, suffix: "", label: { en: "Specialized developers", es: "Programadores especializados" } },
  { id: "languages", value: 5, suffix: "+", label: { en: "Languages", es: "Idiomas" } },
  { id: "years", value: 8, suffix: "+", label: { en: "Years of experience", es: "Años de experiencia" } },
];

export const TEAM_SPECIALTIES: Record<Locale, readonly string[]> = {
  en: ["Quality", "Sales", "Finance", "Process automation", "SEO", "Marketing"],
  es: ["Calidad", "Ventas", "Finanzas", "Automatización de procesos", "SEO", "Marketing"],
};

export const TEAM_DEVELOPER_FOCUS: Record<Locale, string> = {
  en: "10 specialized developers covering security, systems development, apps and web platforms.",
  es: "10 programadores especializados en seguridad, desarrollo de sistemas, apps y páginas web.",
};

export const TEAM_HR_NOTE: Record<Locale, string> = {
  en: "A dedicated HR department focused on sourcing and recruiting the people behind every operation.",
  es: "Un departamento especial de RRHH dedicado a la búsqueda y reclutamiento del personal detrás de cada operación.",
};

export const ABOUT_SECTORS: ReadonlyArray<{
  id: string;
  icon: ServiceIconName;
  label: Record<Locale, string>;
  focus: Record<Locale, string>;
  services: Record<Locale, readonly string[]>;
}> = [
  {
    id: "health",
    icon: "clipboard-check",
    label: { en: "Health", es: "Salud" },
    focus: {
      en: "Appointments, patient records and enquiries, where a mistyped detail is not an administrative slip.",
      es: "Turnos, historias clínicas y consultas, donde un dato mal tomado no es un descuido administrativo.",
    },
    services: {
      en: ["Customer service", "Onboarding", "Back office"],
      es: ["Atención al cliente", "Onboarding", "Back office"],
    },
  },
  {
    id: "banking",
    icon: "banknote",
    label: { en: "Banking & Finance", es: "Banca y Finanzas" },
    focus: {
      en: "Recovery, verification and support run under compliance protocols that leave no room for improvisation.",
      es: "Cobranza, verificación y soporte bajo protocolos de cumplimiento que no dejan lugar a la improvisación.",
    },
    services: {
      en: ["Collections", "Customer service", "Surveys"],
      es: ["Cobranzas", "Atención al cliente", "Encuestas"],
    },
  },
  {
    id: "retail",
    icon: "layout",
    label: { en: "Retail & E-Commerce", es: "Retail y E-Commerce" },
    focus: {
      en: "Seasonal peaks, after-sales and order tracking across several channels at once.",
      es: "Picos de temporada, postventa y seguimiento de pedidos en varios canales a la vez.",
    },
    services: {
      en: ["Customer service", "Sales", "Data processing"],
      es: ["Atención al cliente", "Ventas", "Procesamiento de datos"],
    },
  },
  {
    id: "telecom",
    icon: "phone",
    label: { en: "Telecommunications", es: "Telecomunicaciones" },
    focus: {
      en: "High volume, first-line technical support and keeping a subscriber base from walking.",
      es: "Alto volumen, soporte técnico de primer nivel y retención de una cartera que se va si la desatienden.",
    },
    services: {
      en: ["Customer service", "Sales", "Collections"],
      es: ["Atención al cliente", "Ventas", "Cobranzas"],
    },
  },
  {
    id: "tourism",
    icon: "userplus",
    label: { en: "Tourism & Hospitality", es: "Turismo y Hospitalidad" },
    focus: {
      en: "Bookings, changes and assistance across time zones, with the sale open the whole time.",
      es: "Reservas, cambios y asistencia en varios husos horarios, con la venta abierta todo el tiempo.",
    },
    services: {
      en: ["Customer service", "Sales", "Onboarding"],
      es: ["Atención al cliente", "Ventas", "Onboarding"],
    },
  },
];
