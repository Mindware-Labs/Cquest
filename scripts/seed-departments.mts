/* Siembra los seis departamentos reales de Center Quest, con el mismo
   contenido que tenía el array estático DEPARTMENTS (src/app/(site)/team/data.ts,
   retirado al convertir departamentos en una tabla administrable).
   Uso: npm run seed:departments */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { department } from "../src/db/schema/department";

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

const SEEDS = [
  {
    slug: "customer-experience",
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
    slug: "business-operations",
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
    slug: "back-office",
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
    slug: "technology-innovation",
    icon: "code",
    label: "Technology & Innovation Department",
    shortLabel: "Technology & Innovation",
    responsibilities: ["Software Development", "Web & Mobile Applications", "AI & Automation", "Integrations"],
  },
  {
    slug: "quality-assurance",
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
    slug: "human-capital",
    icon: "userplus",
    label: "Human Capital Department",
    shortLabel: "Human Capital",
    responsibilities: ["Recruitment", "Selection", "Training", "Talent Management"],
  },
];

async function main() {
  for (const [index, seed] of SEEDS.entries()) {
    const existing = await db.select({ id: department.id }).from(department).where(eq(department.slug, seed.slug)).limit(1);
    if (existing.length > 0) {
      console.log(`· ${seed.slug} ya existe, lo salto.`);
      continue;
    }

    await db.insert(department).values({ ...seed, sortOrder: index });
    console.log(`✓ ${seed.label}`);
  }

  console.log("\nListo.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Falló el seed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
