import type { ServiceIconName } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

type LocalizedText = Record<Locale, string>;

export type Department = {
  id: string;
  icon: ServiceIconName;
  label: LocalizedText;
  shortLabel: LocalizedText;
  responsibilities: readonly LocalizedText[];
};

/* Los SEIS departamentos reales de Center Quest. Esta es la fuente única:
   la alimentan el organigrama de /team y el filtro por área de /careers, así
   que una vacante no puede pertenecer a un área que la empresa no tiene. */
export const DEPARTMENTS: readonly Department[] = [
  {
    id: "customer-experience",
    icon: "headset",
    label: {
      en: "Customer Experience Department",
      es: "Departamento de Experiencia del Cliente",
    },
    shortLabel: {
      en: "Customer Experience",
      es: "Experiencia del Cliente",
    },
    responsibilities: [
      { en: "Inbound Customer Support", es: "Soporte Inbound al Cliente" },
      { en: "Sales & Outbound Campaigns", es: "Ventas y Campañas Outbound" },
      { en: "Collections & Recovery", es: "Cobros y Recuperación de Cartera" },
      { en: "Onboarding & Retention", es: "Onboarding y Retención" },
    ],
  },
  {
    id: "business-operations",
    icon: "workflow",
    label: {
      en: "Business Operations Department",
      es: "Departamento de Operaciones de Negocio",
    },
    shortLabel: {
      en: "Business Operations",
      es: "Operaciones de Negocio",
    },
    responsibilities: [
      { en: "Workforce Management", es: "Gestión de la Fuerza Laboral" },
      { en: "SLA & Capacity Planning", es: "Planificación de SLAs y Capacidad" },
      { en: "Operational Reporting", es: "Reportes Operativos" },
      { en: "Continuous Improvement", es: "Mejora Continua" },
    ],
  },
  {
    id: "back-office",
    icon: "database",
    label: {
      en: "Back Office Services Department",
      es: "Departamento de Servicios de Back Office",
    },
    shortLabel: {
      en: "Back Office",
      es: "Back Office",
    },
    responsibilities: [
      { en: "Data Processing & Entry", es: "Procesamiento y Captura de Datos" },
      { en: "Document Management", es: "Gestión Documental" },
      { en: "Billing & Accounts Receivable", es: "Facturación y Cuentas por Cobrar" },
      { en: "Administrative Support", es: "Soporte Administrativo" },
    ],
  },
  {
    id: "technology-innovation",
    icon: "code",
    label: {
      en: "Technology & Innovation Department",
      es: "Departamento de Tecnología e Innovación",
    },
    shortLabel: {
      en: "Technology & Innovation",
      es: "Tecnología e Innovación",
    },
    responsibilities: [
      { en: "Software Development", es: "Desarrollo de Software" },
      { en: "Web & Mobile Applications", es: "Aplicaciones Web y Móviles" },
      { en: "AI & Automation", es: "IA y Automatización" },
      { en: "Integrations", es: "Integraciones" },
    ],
  },
  {
    id: "quality-assurance",
    icon: "shield",
    label: {
      en: "Quality Assurance Department",
      es: "Departamento de Aseguramiento de Calidad",
    },
    shortLabel: {
      en: "Quality Assurance",
      es: "Aseguramiento de Calidad",
    },
    responsibilities: [
      { en: "Call & Interaction Monitoring", es: "Monitoreo de Llamadas e Interacciones" },
      { en: "Quality Scoring & Calibration", es: "Evaluación y Calibración de Calidad" },
      { en: "Compliance & Protocols", es: "Cumplimiento y Protocolos" },
      { en: "Coaching & Feedback", es: "Coaching y Retroalimentación" },
    ],
  },
  {
    id: "human-capital",
    icon: "userplus",
    label: {
      en: "Human Capital Department",
      es: "Departamento de Capital Humano",
    },
    shortLabel: {
      en: "Human Capital",
      es: "Capital Humano",
    },
    responsibilities: [
      { en: "Recruitment", es: "Reclutamiento" },
      { en: "Selection", es: "Selección" },
      { en: "Training", es: "Capacitación" },
      { en: "Talent Management", es: "Gestión del Talento" },
    ],
  },
];
