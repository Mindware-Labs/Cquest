import type { ServiceIconName } from "@/components/services/data";

export type Department = {
  id: string;
  icon: ServiceIconName;
  label: string;
  shortLabel: string;
  responsibilities: readonly string[];
};

/* Los SEIS departamentos reales de Center Quest. Esta es la fuente única:
   la alimentan el organigrama de /team y el filtro por área de /careers, así
   que una vacante no puede pertenecer a un área que la empresa no tiene. */
export const DEPARTMENTS: readonly Department[] = [
  {
    id: "customer-experience",
    icon: "headset",
    label: "Customer Experience Department",
    shortLabel: "Customer Experience",
    responsibilities: [
      "Inbound Customer Support",
      "Sales & Outbound Campaigns",
      "Collections & Recovery",
      "Onboarding & Retention",
    ],
  },
  {
    id: "business-operations",
    icon: "workflow",
    label: "Business Operations Department",
    shortLabel: "Business Operations",
    responsibilities: [
      "Workforce Management",
      "SLA & Capacity Planning",
      "Operational Reporting",
      "Continuous Improvement",
    ],
  },
  {
    id: "back-office",
    icon: "database",
    label: "Back Office Services Department",
    shortLabel: "Back Office",
    responsibilities: [
      "Data Processing & Entry",
      "Document Management",
      "Billing & Accounts Receivable",
      "Administrative Support",
    ],
  },
  {
    id: "technology-innovation",
    icon: "code",
    label: "Technology & Innovation Department",
    shortLabel: "Technology & Innovation",
    responsibilities: [
      "Software Development",
      "Web & Mobile Applications",
      "AI & Automation",
      "Integrations",
    ],
  },
  {
    id: "quality-assurance",
    icon: "shield",
    label: "Quality Assurance Department",
    shortLabel: "Quality Assurance",
    responsibilities: [
      "Call & Interaction Monitoring",
      "Quality Scoring & Calibration",
      "Compliance & Protocols",
      "Coaching & Feedback",
    ],
  },
  {
    id: "human-capital",
    icon: "userplus",
    label: "Human Capital Department",
    shortLabel: "Human Capital",
    responsibilities: [
      "Recruitment",
      "Selection",
      "Training",
      "Talent Management",
    ],
  },
];
