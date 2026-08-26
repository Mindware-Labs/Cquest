import { DEPARTMENTS } from "../../team/data";
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
    title: "Customer Service Agent",
    summary:
      "Answer calls, chats and emails for the accounts we run, and resolve each case on first contact whenever it can be resolved there.",
    location: "Santo Domingo, DR",
    mode: "onsite",
    employmentType: "full-time",
    schedule: "Rotating shifts, 5 days a week",
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      "Handle inbound calls, chat and email within the account's service levels.",
      "Log every interaction in the client's CRM with accurate case detail.",
      "Escalate what you cannot solve, with the context the next person needs.",
    ],
    requirements: [
      "High school diploma completed.",
      "Clear speech and good written Spanish.",
      "Availability for rotating shifts.",
    ],
    niceToHave: [
      "Conversational English.",
      "Previous experience in customer-facing roles.",
    ],
  },
  {
    slug: "agente-de-ventas",
    department: "customer-experience",
    track: "entry",
    icon: "trend",
    title: "Sales Agent",
    summary:
      "Run outbound campaigns for our clients: qualify the lead, present the offer and close, following the script and the compliance rules of the account.",
    location: "Santo Domingo, DR",
    mode: "onsite",
    employmentType: "full-time",
    schedule: "Daytime shift + performance bonus",
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      "Contact assigned leads and qualify them against the campaign criteria.",
      "Present the offer and close the sale within the account's compliance rules.",
      "Meet the daily contact and conversion targets of the campaign.",
    ],
    requirements: [
      "High school diploma completed.",
      "Comfort on the phone and resilience with rejection.",
      "Results orientation.",
    ],
    niceToHave: [
      "Experience in telesales or retail sales.",
    ],
  },
  {
    slug: "agente-de-cobros",
    department: "customer-experience",
    track: "entry",
    icon: "banknote",
    title: "Collections Agent",
    summary:
      "Recover overdue portfolio by phone, negotiating payment arrangements under a professional, compliant protocol.",
    location: "Santo Domingo, DR",
    mode: "onsite",
    employmentType: "full-time",
    schedule: "Daytime shift + recovery bonus",
    postedAt: "2026-07-01",
    active: false,
    responsibilities: [
      "Manage an assigned portfolio of overdue accounts.",
      "Negotiate payment arrangements within the approved policy.",
      "Document every management action and follow up on commitments.",
    ],
    requirements: [
      "High school diploma completed.",
      "Negotiation skills and emotional composure.",
    ],
    niceToHave: [
      "Experience in banking or financial collections.",
    ],
  },
  {
    slug: "agente-bilingue",
    department: "customer-experience",
    track: "entry",
    icon: "messages",
    title: "Bilingual Agent (ES/EN)",
    summary:
      "Serve our US accounts in English and Spanish across phone, chat and email, with the tone the client's brand expects.",
    location: "Santo Domingo, DR",
    mode: "onsite",
    employmentType: "full-time",
    schedule: "US hours",
    postedAt: "2026-07-01",
    active: false,
    responsibilities: [
      "Handle interactions in English and Spanish across every channel of the account.",
      "Keep the brand's tone and service standards on every contact.",
    ],
    requirements: [
      "Advanced conversational English (B2+).",
      "Availability for US time-zone shifts.",
    ],
    niceToHave: [
      "Previous experience in a bilingual account.",
    ],
  },
  {
    slug: "supervisor-de-operaciones",
    department: "business-operations",
    track: "professional",
    icon: "workflow",
    title: "Operations Supervisor",
    summary:
      "Lead a team of agents against the account's service levels: coaching, staffing, escalations and daily results.",
    location: "Santo Domingo, DR",
    mode: "onsite",
    employmentType: "full-time",
    schedule: "Full time, shift coverage",
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      "Lead a team of 12–20 agents and their daily performance.",
      "Run coaching sessions from quality monitoring results.",
      "Report SLA, occupancy and quality results to the account lead.",
    ],
    requirements: [
      "2+ years in contact center operations, at least 1 leading people.",
      "Command of service-level metrics (SLA, AHT, CSAT).",
    ],
    niceToHave: [
      "Experience in banking or health accounts.",
    ],
  },
  {
    slug: "analista-de-calidad",
    department: "quality-assurance",
    track: "professional",
    icon: "clipboard-check",
    title: "Quality Analyst",
    summary:
      "Monitor interactions, calibrate criteria with the client and turn what you find into concrete coaching for the floor.",
    location: "Santo Domingo, DR",
    mode: "hybrid",
    employmentType: "full-time",
    schedule: "Full time, daytime",
    postedAt: "2026-07-01",
    active: false,
    responsibilities: [
      "Monitor calls, chats and emails against the account's rubric.",
      "Run calibration sessions with the client and with supervision.",
      "Report trends and improvement opportunities per campaign.",
    ],
    requirements: [
      "1+ year in quality assurance or contact center operations.",
      "Detail orientation and clear written reporting.",
    ],
    niceToHave: [
      "Knowledge of speech analytics tools.",
    ],
  },
  {
    slug: "analista-workforce",
    department: "business-operations",
    track: "professional",
    icon: "chart",
    title: "Workforce Analyst (WFM)",
    summary:
      "Forecast volume, build the schedules that cover it and manage intraday so the service level holds without over-staffing.",
    location: "Santo Domingo, DR",
    mode: "hybrid",
    employmentType: "full-time",
    schedule: "Full time, daytime",
    postedAt: "2026-07-01",
    active: false,
    responsibilities: [
      "Build volume forecasts and staffing requirements per campaign.",
      "Publish schedules and manage intraday adherence.",
    ],
    requirements: [
      "Advanced spreadsheets and comfort with operational data.",
      "Experience with WFM or scheduling tools.",
    ],
    niceToHave: [
      "SQL or BI dashboards.",
    ],
  },
  {
    slug: "desarrollador-full-stack",
    department: "technology-innovation",
    track: "professional",
    icon: "code",
    title: "Full Stack Developer",
    summary:
      "Build the internal systems our operation runs on — CRMs, dashboards and automations — and the custom software we deliver to clients.",
    location: "Santo Domingo, DR",
    mode: "hybrid",
    employmentType: "full-time",
    schedule: "Full time, daytime",
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      "Develop and maintain web applications used by the operation every day.",
      "Integrate telephony, CRM and client systems.",
    ],
    requirements: [
      "2+ years with TypeScript and a modern web framework.",
      "Relational databases and REST API design.",
    ],
    niceToHave: [
      "Next.js, React and cloud deployments.",
    ],
  },
  {
    slug: "auxiliar-de-contabilidad",
    department: "back-office",
    track: "professional",
    icon: "banknote",
    title: "Accounting Assistant",
    summary:
      "Keep billing, payables and receivables current, and prepare the numbers the operation reports on every month.",
    location: "Santo Domingo, DR",
    mode: "onsite",
    employmentType: "full-time",
    schedule: "Full time, daytime",
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      "Record and reconcile daily accounting entries.",
      "Manage client billing and supplier payments.",
      "Support the monthly close and tax filings.",
    ],
    requirements: [
      "Degree or technical studies in accounting.",
      "1+ year in an accounting role.",
      "Advanced spreadsheets.",
    ],
    niceToHave: [
      "Experience with DGII filings.",
    ],
  },
  {
    slug: "especialista-de-reclutamiento",
    department: "human-capital",
    track: "professional",
    icon: "userplus",
    title: "Recruitment Specialist",
    summary:
      "Own high-volume hiring for the floor: sourcing, screening, group assessments and the first weeks of every new class.",
    location: "Santo Domingo, DR",
    mode: "onsite",
    employmentType: "full-time",
    schedule: "Full time, daytime",
    postedAt: "2026-07-01",
    active: true,
    responsibilities: [
      "Source and screen candidates for entry-level openings at volume.",
      "Coordinate group assessments and hiring classes with operations.",
    ],
    requirements: [
      "1+ year in recruitment, ideally high volume.",
      "Organization and follow-through with candidates.",
    ],
    niceToHave: [
      "Experience hiring for call center operations.",
    ],
  },
];

export const ACTIVE_POSITIONS: readonly Position[] = POSITIONS.filter(
  (position) => position.active,
);

const DEPARTMENT_LABEL = new Map(
  DEPARTMENTS.map((department) => [department.id, department.shortLabel]),
);

export function departmentLabel(id: string): string {
  return DEPARTMENT_LABEL.get(id) ?? id;
}
