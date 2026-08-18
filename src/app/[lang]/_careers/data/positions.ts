import { DEPARTMENTS } from "../../team/data";
import type { Locale } from "@/i18n/config";
import type { Position } from "./types";

/* CONTENIDO PLACEHOLDER. Escrito por departamento para que la página se pueda
   ver y aprobar completa; Recursos Humanos reemplaza title/summary/location/
   schedule/postedAt con las requisiciones reales. Retirar una vacante es
   `active: false` — sale del listado, de las rutas estáticas y del sitemap a
   la vez, sin tocar componentes. */
export const POSITIONS: readonly Position[] = [
  {
    slug: "agente-de-servicio-al-cliente",
    department: "customer-experience",
    track: "entry",
    icon: "headset",
    title: { en: "Customer Service Agent", es: "Agente de Servicio al Cliente" },
    summary: {
      en: "Answer calls, chats and emails for the accounts we run, and resolve each case on first contact whenever it can be resolved there.",
      es: "Atiende llamadas, chats y correos de las cuentas que operamos, y resuelve cada caso en el primer contacto siempre que se pueda resolver ahí.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "onsite",
    employmentType: "full-time",
    schedule: { en: "Rotating shifts, 5 days a week", es: "Turnos rotativos, 5 días a la semana" },
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      { en: "Handle inbound calls, chat and email within the account's service levels.", es: "Atender llamadas entrantes, chat y correo dentro de los niveles de servicio de la cuenta." },
      { en: "Log every interaction in the client's CRM with accurate case detail.", es: "Registrar cada interacción en el CRM del cliente con el detalle correcto del caso." },
      { en: "Escalate what you cannot solve, with the context the next person needs.", es: "Escalar lo que no puedas resolver, con el contexto que necesita la siguiente persona." },
    ],
    requirements: [
      { en: "High school diploma completed.", es: "Bachillerato completo." },
      { en: "Clear speech and good written Spanish.", es: "Buena dicción y buen español escrito." },
      { en: "Availability for rotating shifts.", es: "Disponibilidad para turnos rotativos." },
    ],
    niceToHave: [
      { en: "Conversational English.", es: "Inglés conversacional." },
      { en: "Previous experience in customer-facing roles.", es: "Experiencia previa atendiendo público." },
    ],
  },
  {
    slug: "agente-de-ventas",
    department: "customer-experience",
    track: "entry",
    icon: "trend",
    title: { en: "Sales Agent", es: "Agente de Ventas" },
    summary: {
      en: "Run outbound campaigns for our clients: qualify the lead, present the offer and close, following the script and the compliance rules of the account.",
      es: "Ejecuta campañas outbound para nuestros clientes: califica el lead, presenta la oferta y cierra, siguiendo el guion y las reglas de cumplimiento de la cuenta.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "onsite",
    employmentType: "full-time",
    schedule: { en: "Daytime shift + performance bonus", es: "Turno diurno + bono por desempeño" },
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      { en: "Contact assigned leads and qualify them against the campaign criteria.", es: "Contactar los leads asignados y calificarlos contra los criterios de la campaña." },
      { en: "Present the offer and close the sale within the account's compliance rules.", es: "Presentar la oferta y cerrar la venta dentro de las reglas de cumplimiento de la cuenta." },
      { en: "Meet the daily contact and conversion targets of the campaign.", es: "Cumplir las metas diarias de contactos y conversión de la campaña." },
    ],
    requirements: [
      { en: "High school diploma completed.", es: "Bachillerato completo." },
      { en: "Comfort on the phone and resilience with rejection.", es: "Soltura telefónica y tolerancia al rechazo." },
      { en: "Results orientation.", es: "Orientación a resultados." },
    ],
    niceToHave: [
      { en: "Experience in telesales or retail sales.", es: "Experiencia en televentas o ventas de piso." },
    ],
  },
  {
    slug: "agente-de-cobros",
    department: "customer-experience",
    track: "entry",
    icon: "banknote",
    title: { en: "Collections Agent", es: "Agente de Cobros" },
    summary: {
      en: "Recover overdue portfolio by phone, negotiating payment arrangements under a professional, compliant protocol.",
      es: "Recupera cartera vencida por teléfono, negociando acuerdos de pago bajo un protocolo profesional y apegado a la norma.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "onsite",
    employmentType: "full-time",
    schedule: { en: "Daytime shift + recovery bonus", es: "Turno diurno + bono por recuperación" },
    postedAt: "2026-07-01",
    active: false,
    responsibilities: [
      { en: "Manage an assigned portfolio of overdue accounts.", es: "Gestionar una cartera asignada de cuentas vencidas." },
      { en: "Negotiate payment arrangements within the approved policy.", es: "Negociar acuerdos de pago dentro de la política aprobada." },
      { en: "Document every management action and follow up on commitments.", es: "Documentar cada gestión y dar seguimiento a los compromisos." },
    ],
    requirements: [
      { en: "High school diploma completed.", es: "Bachillerato completo." },
      { en: "Negotiation skills and emotional composure.", es: "Capacidad de negociación y manejo emocional." },
    ],
    niceToHave: [
      { en: "Experience in banking or financial collections.", es: "Experiencia en cobros bancarios o financieros." },
    ],
  },
  {
    slug: "agente-bilingue",
    department: "customer-experience",
    track: "entry",
    icon: "messages",
    title: { en: "Bilingual Agent (ES/EN)", es: "Agente Bilingüe (ES/EN)" },
    summary: {
      en: "Serve our US accounts in English and Spanish across phone, chat and email, with the tone the client's brand expects.",
      es: "Atiende nuestras cuentas de Estados Unidos en inglés y español por teléfono, chat y correo, con el tono que espera la marca del cliente.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "onsite",
    employmentType: "full-time",
    schedule: { en: "US hours", es: "Horario de EE. UU." },
    postedAt: "2026-07-01",
    active: false,
    responsibilities: [
      { en: "Handle interactions in English and Spanish across every channel of the account.", es: "Atender interacciones en inglés y español en todos los canales de la cuenta." },
      { en: "Keep the brand's tone and service standards on every contact.", es: "Mantener el tono y los estándares de servicio de la marca en cada contacto." },
    ],
    requirements: [
      { en: "Advanced conversational English (B2+).", es: "Inglés conversacional avanzado (B2+)." },
      { en: "Availability for US time-zone shifts.", es: "Disponibilidad para turnos en horario de EE. UU." },
    ],
    niceToHave: [
      { en: "Previous experience in a bilingual account.", es: "Experiencia previa en cuenta bilingüe." },
    ],
  },
  {
    slug: "supervisor-de-operaciones",
    department: "business-operations",
    track: "professional",
    icon: "workflow",
    title: { en: "Operations Supervisor", es: "Supervisor de Operaciones" },
    summary: {
      en: "Lead a team of agents against the account's service levels: coaching, staffing, escalations and daily results.",
      es: "Lidera un equipo de agentes contra los niveles de servicio de la cuenta: coaching, cobertura, escalamientos y resultados diarios.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "onsite",
    employmentType: "full-time",
    schedule: { en: "Full time, shift coverage", es: "Tiempo completo, cobertura por turnos" },
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      { en: "Lead a team of 12–20 agents and their daily performance.", es: "Liderar un equipo de 12 a 20 agentes y su desempeño diario." },
      { en: "Run coaching sessions from quality monitoring results.", es: "Ejecutar sesiones de coaching a partir de los monitoreos de calidad." },
      { en: "Report SLA, occupancy and quality results to the account lead.", es: "Reportar SLA, ocupación y calidad al responsable de la cuenta." },
    ],
    requirements: [
      { en: "2+ years in contact center operations, at least 1 leading people.", es: "2+ años en operaciones de contact center, al menos 1 liderando personas." },
      { en: "Command of service-level metrics (SLA, AHT, CSAT).", es: "Dominio de métricas de nivel de servicio (SLA, AHT, CSAT)." },
    ],
    niceToHave: [
      { en: "Experience in banking or health accounts.", es: "Experiencia en cuentas de banca o salud." },
    ],
  },
  {
    slug: "analista-de-calidad",
    department: "quality-assurance",
    track: "professional",
    icon: "clipboard-check",
    title: { en: "Quality Analyst", es: "Analista de Calidad" },
    summary: {
      en: "Monitor interactions, calibrate criteria with the client and turn what you find into concrete coaching for the floor.",
      es: "Monitorea interacciones, calibra criterios con el cliente y convierte lo que encuentras en coaching concreto para el piso.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "hybrid",
    employmentType: "full-time",
    schedule: { en: "Full time, daytime", es: "Tiempo completo, diurno" },
    postedAt: "2026-07-01",
    active: false,
    responsibilities: [
      { en: "Monitor calls, chats and emails against the account's rubric.", es: "Monitorear llamadas, chats y correos contra la rúbrica de la cuenta." },
      { en: "Run calibration sessions with the client and with supervision.", es: "Ejecutar sesiones de calibración con el cliente y con supervisión." },
      { en: "Report trends and improvement opportunities per campaign.", es: "Reportar tendencias y oportunidades de mejora por campaña." },
    ],
    requirements: [
      { en: "1+ year in quality assurance or contact center operations.", es: "1+ año en aseguramiento de calidad u operaciones de contact center." },
      { en: "Detail orientation and clear written reporting.", es: "Orientación al detalle y reportes escritos claros." },
    ],
    niceToHave: [
      { en: "Knowledge of speech analytics tools.", es: "Conocimiento de herramientas de speech analytics." },
    ],
  },
  {
    slug: "analista-workforce",
    department: "business-operations",
    track: "professional",
    icon: "chart",
    title: { en: "Workforce Analyst (WFM)", es: "Analista de Workforce (WFM)" },
    summary: {
      en: "Forecast volume, build the schedules that cover it and manage intraday so the service level holds without over-staffing.",
      es: "Pronostica volumen, arma los horarios que lo cubren y gestiona el intradía para que el nivel de servicio se sostenga sin sobredimensionar.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "hybrid",
    employmentType: "full-time",
    schedule: { en: "Full time, daytime", es: "Tiempo completo, diurno" },
    postedAt: "2026-07-01",
    active: false,
    responsibilities: [
      { en: "Build volume forecasts and staffing requirements per campaign.", es: "Construir pronósticos de volumen y requerimientos de personal por campaña." },
      { en: "Publish schedules and manage intraday adherence.", es: "Publicar horarios y gestionar la adherencia intradía." },
    ],
    requirements: [
      { en: "Advanced spreadsheets and comfort with operational data.", es: "Hojas de cálculo avanzadas y soltura con datos operativos." },
      { en: "Experience with WFM or scheduling tools.", es: "Experiencia con herramientas de WFM o programación de horarios." },
    ],
    niceToHave: [
      { en: "SQL or BI dashboards.", es: "SQL o tableros de BI." },
    ],
  },
  {
    slug: "desarrollador-full-stack",
    department: "technology-innovation",
    track: "professional",
    icon: "code",
    title: { en: "Full Stack Developer", es: "Desarrollador Full Stack" },
    summary: {
      en: "Build the internal systems our operation runs on — CRMs, dashboards and automations — and the custom software we deliver to clients.",
      es: "Construye los sistemas internos sobre los que corre nuestra operación — CRMs, dashboards y automatizaciones — y el software a la medida que entregamos a clientes.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "hybrid",
    employmentType: "full-time",
    schedule: { en: "Full time, daytime", es: "Tiempo completo, diurno" },
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      { en: "Develop and maintain web applications used by the operation every day.", es: "Desarrollar y mantener aplicaciones web que la operación usa todos los días." },
      { en: "Integrate telephony, CRM and client systems.", es: "Integrar telefonía, CRM y sistemas de clientes." },
    ],
    requirements: [
      { en: "2+ years with TypeScript and a modern web framework.", es: "2+ años con TypeScript y un framework web moderno." },
      { en: "Relational databases and REST API design.", es: "Bases de datos relacionales y diseño de APIs REST." },
    ],
    niceToHave: [
      { en: "Next.js, React and cloud deployments.", es: "Next.js, React y despliegues en la nube." },
    ],
  },
  {
    slug: "auxiliar-de-contabilidad",
    department: "back-office",
    track: "professional",
    icon: "banknote",
    title: { en: "Accounting Assistant", es: "Auxiliar de Contabilidad" },
    summary: {
      en: "Keep billing, payables and receivables current, and prepare the numbers the operation reports on every month.",
      es: "Mantén al día la facturación, las cuentas por pagar y por cobrar, y prepara los números que la operación reporta cada mes.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "onsite",
    employmentType: "full-time",
    schedule: { en: "Full time, daytime", es: "Tiempo completo, diurno" },
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      { en: "Record and reconcile daily accounting entries.", es: "Registrar y conciliar los asientos contables diarios." },
      { en: "Manage client billing and supplier payments.", es: "Gestionar la facturación a clientes y los pagos a suplidores." },
      { en: "Support the monthly close and tax filings.", es: "Apoyar el cierre mensual y las declaraciones fiscales." },
    ],
    requirements: [
      { en: "Degree or technical studies in accounting.", es: "Grado o estudios técnicos en contabilidad." },
      { en: "1+ year in an accounting role.", es: "1+ año en un puesto contable." },
      { en: "Advanced spreadsheets.", es: "Hojas de cálculo avanzadas." },
    ],
    niceToHave: [
      { en: "Experience with DGII filings.", es: "Experiencia con declaraciones de la DGII." },
    ],
  },
  {
    slug: "especialista-de-reclutamiento",
    department: "human-capital",
    track: "professional",
    icon: "userplus",
    title: { en: "Recruitment Specialist", es: "Especialista de Reclutamiento" },
    summary: {
      en: "Own high-volume hiring for the floor: sourcing, screening, group assessments and the first weeks of every new class.",
      es: "Lleva el reclutamiento de alto volumen para el piso: sourcing, filtros, evaluaciones grupales y las primeras semanas de cada grupo nuevo.",
    },
    location: { en: "Santo Domingo, DR", es: "Santo Domingo, RD" },
    mode: "onsite",
    employmentType: "full-time",
    schedule: { en: "Full time, daytime", es: "Tiempo completo, diurno" },
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      { en: "Source and screen candidates for entry-level openings at volume.", es: "Buscar y filtrar candidatos para vacantes de primer empleo en volumen." },
      { en: "Coordinate group assessments and hiring classes with operations.", es: "Coordinar evaluaciones grupales y grupos de ingreso junto a operaciones." },
    ],
    requirements: [
      { en: "1+ year in recruitment, ideally high volume.", es: "1+ año en reclutamiento, idealmente de alto volumen." },
      { en: "Organization and follow-through with candidates.", es: "Organización y seguimiento con los candidatos." },
    ],
    niceToHave: [
      { en: "Experience hiring for call center operations.", es: "Experiencia reclutando para operaciones de call center." },
    ],
  },
];

export const ACTIVE_POSITIONS: readonly Position[] = POSITIONS.filter(
  (position) => position.active,
);

const DEPARTMENT_LABEL = new Map(
  DEPARTMENTS.map((department) => [department.id, department.shortLabel]),
);

export function departmentLabel(id: string, lang: Locale): string {
  return DEPARTMENT_LABEL.get(id)?.[lang] ?? id;
}
