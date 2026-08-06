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
      { en: "Customer Support", es: "Soporte al Cliente" },
      { en: "Contact Center", es: "Centro de Contacto" },
      { en: "Help Desk", es: "Mesa de Ayuda" },
      { en: "Complaint Management", es: "Gestión de Reclamos" },
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
      { en: "Operations Management", es: "Gestión Operativa" },
      { en: "Process Optimization", es: "Optimización de Procesos" },
      { en: "Workforce Management", es: "Gestión de la Fuerza Laboral" },
      { en: "KPIs & Reporting", es: "KPIs e Informes" },
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
      en: "Back Office Services",
      es: "Servicios de Back Office",
    },
    responsibilities: [
      { en: "Administrative Processing", es: "Procesamiento Administrativo" },
      { en: "Data Entry", es: "Entrada de Datos" },
      { en: "Billing Support", es: "Soporte de Facturación" },
      { en: "Document Management", es: "Gestión Documental" },
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
      { en: "QA", es: "QA" },
      { en: "Audits", es: "Auditorías" },
      { en: "Monitoring", es: "Monitoreo" },
      { en: "Continuous Improvement", es: "Mejora Continua" },
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
