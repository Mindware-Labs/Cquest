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

/* Los CUATRO departamentos reales de Center Quest. Esta es la fuente única:
   la alimentan el organigrama de /team y el filtro por área de /careers, así
   que una vacante no puede pertenecer a un área que la empresa no tiene.

   Antes había seis, con Experiencia del Cliente, Back Office y Calidad como
   departamentos propios; hoy ese trabajo vive dentro de Operaciones y aparece
   como responsabilidad, no como casilla del organigrama. */
export const DEPARTMENTS: readonly Department[] = [
  {
    id: "operations",
    icon: "workflow",
    label: {
      en: "Operations Department",
      es: "Departamento de Operaciones",
    },
    shortLabel: {
      en: "Operations",
      es: "Operaciones",
    },
    responsibilities: [
      { en: "Contact Center & Customer Support", es: "Contact Center y Soporte al Cliente" },
      { en: "Back Office & Data Processing", es: "Back Office y Procesamiento de Datos" },
      { en: "Quality Assurance & Monitoring", es: "Aseguramiento de Calidad y Monitoreo" },
      { en: "Workforce Management & SLAs", es: "Gestión de la Fuerza Laboral y SLAs" },
    ],
  },
  {
    id: "technology",
    icon: "code",
    label: {
      en: "Technology Department",
      es: "Departamento de Tecnología",
    },
    shortLabel: {
      en: "Technology",
      es: "Tecnología",
    },
    responsibilities: [
      { en: "Software Development", es: "Desarrollo de Software" },
      { en: "Web & Mobile Applications", es: "Aplicaciones Web y Móviles" },
      { en: "Automation & Integrations", es: "Automatización e Integraciones" },
      { en: "Infrastructure & Support", es: "Infraestructura y Soporte" },
    ],
  },
  {
    id: "human-resources",
    icon: "userplus",
    label: {
      en: "Human Resources Department",
      es: "Departamento de Recursos Humanos",
    },
    shortLabel: {
      en: "Human Resources",
      es: "Recursos Humanos",
    },
    responsibilities: [
      { en: "Recruitment & Selection", es: "Reclutamiento y Selección" },
      { en: "Training & Development", es: "Capacitación y Desarrollo" },
      { en: "Payroll & Labor Compliance", es: "Nómina y Cumplimiento Laboral" },
      { en: "Talent Management", es: "Gestión del Talento" },
    ],
  },
  {
    id: "accounting",
    icon: "banknote",
    label: {
      en: "Accounting Department",
      es: "Departamento de Contabilidad",
    },
    shortLabel: {
      en: "Accounting",
      es: "Contabilidad",
    },
    responsibilities: [
      { en: "Billing & Accounts Receivable", es: "Facturación y Cuentas por Cobrar" },
      { en: "Accounts Payable", es: "Cuentas por Pagar" },
      { en: "Financial Reporting", es: "Reportes Financieros" },
      { en: "Tax & Regulatory Compliance", es: "Cumplimiento Fiscal y Regulatorio" },
    ],
  },
];
