import type { Locale } from "@/i18n/config";
import type { ServiceIconName } from "@/components/services/data";

// Real headcount figures provided by the client; kept as a structured table
// (not hard-coded inline in JSX) so an admin/config layer can later swap
// them without touching component code, per the "animated metrics...
// editable without touching code" requirement. Years/clients/systems/
// interactions remain placeholder scale until the client supplies exact
// figures for those.
export const ABOUT_METRICS: ReadonlyArray<{
  id: string;
  value: number;
  suffix: string;
  label: Record<Locale, string>;
}> = [
  { id: "agents", value: 200, suffix: "+", label: { en: "Call center operators", es: "Operadores de call center" } },
  { id: "developers", value: 10, suffix: "", label: { en: "Specialized developers", es: "Programadores especializados" } },
  { id: "clients", value: 10, suffix: "+", label: { en: "Active clients", es: "Clientes activos" } },
  { id: "years", value: 8, suffix: "+", label: { en: "Years of experience", es: "Años de experiencia" } },
];

// Real team composition beyond the two headline counts above — used by
// TeamSection, not the count-up metrics grid (these are categories, not a
// single number to animate).
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

/* `focus` describes what the SECTOR demands of an operation, and `services`
   names which of Center Quest's own declared service lines answer it. Both
   are deliberately claim-free: no volumes, no results, no client names. The
   requirements doc is explicit that metrics, case studies and testimonials
   arrive from the client, so nothing here invents them — when those numbers
   exist they belong in this table, next to the copy they qualify. */
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

export const ABOUT_VALUES: ReadonlyArray<{
  id: string;
  icon: ServiceIconName;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
}> = [
  {
    id: "people",
    icon: "userplus",
    title: { en: "People first", es: "Las personas primero" },
    description: {
      en: "Every account is run by trained, supervised people — not a script read at volume.",
      es: "Cada cuenta la maneja gente capacitada y supervisada, no un guion leído en volumen.",
    },
  },
  {
    id: "rigor",
    icon: "gauge",
    title: { en: "Measurable rigor", es: "Rigor medible" },
    description: {
      en: "SLAs, QA scorecards and reporting are built into the operation from day one, not added after something breaks.",
      es: "Los SLAs, scorecards de calidad y reportes se construyen en la operación desde el primer día, no se agregan cuando algo falla.",
    },
  },
  {
    id: "transparency",
    icon: "shield",
    title: { en: "Straight answers", es: "Respuestas directas" },
    description: {
      en: "Clients see the real numbers behind their operation — good weeks and hard ones — with no spin in between.",
      es: "Los clientes ven los números reales detrás de su operación, semanas buenas y difíciles, sin adornos de por medio.",
    },
  },
  {
    id: "improvement",
    icon: "trend",
    title: { en: "Always improving", es: "Mejora constante" },
    description: {
      en: "Coaching and process reviews don't stop at launch — every operation is expected to get better every quarter.",
      es: "El coaching y las revisiones de proceso no terminan en el lanzamiento, cada operación debe mejorar cada trimestre.",
    },
  },
];
