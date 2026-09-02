import "server-only";
import { and, asc, desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { vacancy } from "@/db/schema/careers";
import { department } from "@/db/schema/department";

/* Lectura pública, aparte de la del panel (src/server/vacancies.ts): esta no
   exige sesión de admin y solo ve lo que ya está en vivo. Mismo patrón que
   src/lib/blog.ts para artículos. */

export type PublicVacancy = {
  id: string;
  slug: string;
  title: string;
  departmentSlug: string | null;
  departmentLabel: string | null;
  departmentShortLabel: string | null;
  departmentIcon: string | null;
  track: "entry" | "professional" | null;
  workMode: "onsite" | "hybrid" | "remote" | null;
  employmentType: "full-time" | "part-time" | null;
  location: string | null;
  schedule: string | null;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  publishedAt: string;
};

// Publicada con fecha futura es "agendada": no debe verse todavía. Misma
// condición que sostiene el estado derivado que muestra el panel.
function visible() {
  return and(eq(vacancy.status, "published"), lte(vacancy.publishedAt, sql`now()`));
}

const selection = {
  id: vacancy.id,
  slug: vacancy.slug,
  title: vacancy.title,
  departmentSlug: department.slug,
  departmentLabel: department.label,
  departmentShortLabel: department.shortLabel,
  departmentIcon: department.icon,
  track: vacancy.track,
  workMode: vacancy.workMode,
  employmentType: vacancy.employmentType,
  location: vacancy.location,
  schedule: vacancy.schedule,
  summary: vacancy.summary,
  responsibilities: vacancy.responsibilities,
  requirements: vacancy.requirements,
  niceToHave: vacancy.niceToHave,
  publishedAt: vacancy.publishedAt,
};

function normalize<
  T extends {
    track: string | null;
    workMode: string | null;
    employmentType: string | null;
    responsibilities: unknown;
    requirements: unknown;
    niceToHave: unknown;
    publishedAt: Date | null;
  },
>(row: T) {
  return {
    ...row,
    track: row.track as PublicVacancy["track"],
    workMode: row.workMode as PublicVacancy["workMode"],
    employmentType: row.employmentType as PublicVacancy["employmentType"],
    responsibilities: (row.responsibilities as string[]) ?? [],
    requirements: (row.requirements as string[]) ?? [],
    niceToHave: (row.niceToHave as string[]) ?? [],
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
  };
}

export async function listPublishedVacancies(): Promise<PublicVacancy[]> {
  const rows = await db
    .select(selection)
    .from(vacancy)
    .leftJoin(department, eq(vacancy.departmentId, department.id))
    .where(visible())
    .orderBy(desc(vacancy.publishedAt));

  return rows.map(normalize);
}

export async function getPublishedVacancy(slug: string): Promise<PublicVacancy | null> {
  const rows = await db
    .select(selection)
    .from(vacancy)
    .leftJoin(department, eq(vacancy.departmentId, department.id))
    .where(and(visible(), eq(vacancy.slug, slug)))
    .limit(1);

  return rows[0] ? normalize(rows[0]) : null;
}

// Solo los departamentos con algo abierto de verdad, en el mismo orden del
// organigrama — no alfabético, para que la lista de filtros no salte contra
// el resto del sitio.
export async function listDepartmentsHiring(): Promise<
  { slug: string; label: string; shortLabel: string; icon: string; count: number }[]
> {
  const rows = await db
    .select({
      slug: department.slug,
      label: department.label,
      shortLabel: department.shortLabel,
      icon: department.icon,
      sortOrder: department.sortOrder,
      count: sql<number>`count(${vacancy.id})::int`,
    })
    .from(department)
    .innerJoin(vacancy, and(eq(vacancy.departmentId, department.id), visible()))
    .groupBy(department.id, department.slug, department.label, department.shortLabel, department.icon, department.sortOrder)
    .orderBy(asc(department.sortOrder));

  return rows.map(({ slug, label, shortLabel, icon, count }) => ({ slug, label, shortLabel, icon, count }));
}

export async function listPublishedVacancySlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return db
    .select({ slug: vacancy.slug, updatedAt: vacancy.updatedAt })
    .from(vacancy)
    .where(visible());
}
