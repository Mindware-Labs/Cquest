import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { application, vacancy } from "@/db/schema/careers";
import { department } from "@/db/schema/department";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/applicationStatus";
import type { VacancyStatus } from "./vacancies";

export type VacancyReportCandidate = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  english: string;
  availability: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type VacancyReport = {
  vacancy: {
    id: string;
    title: string;
    departmentLabel: string | null;
    status: VacancyStatus;
    publishedAt: string | null;
    createdAt: string;
  };
  total: number;
  statusCounts: Record<ApplicationStatus, number>;
  experienceCounts: Record<string, number>;
  englishCounts: Record<string, number>;
  availabilityCounts: Record<string, number>;
  candidates: VacancyReportCandidate[];
};

/* Sin "use server": esto lo llaman dos guardias de auth distintos (la página,
   vía requireAdmin en vacancies.ts; el export CSV, vía adminSessionOrNull en
   su route handler, donde requireAdmin no sirve porque usa redirect()). La
   consulta vive una sola vez acá y cada caller decide cómo autenticar. */
export async function getVacancyReportData(vacancyId: string): Promise<VacancyReport | null> {
  const vacancyRows = await db
    .select({
      id: vacancy.id,
      title: vacancy.title,
      departmentLabel: department.shortLabel,
      status: vacancy.status,
      publishedAt: vacancy.publishedAt,
      createdAt: vacancy.createdAt,
    })
    .from(vacancy)
    .leftJoin(department, eq(vacancy.departmentId, department.id))
    .where(eq(vacancy.id, vacancyId))
    .limit(1);
  const vacancyRow = vacancyRows[0];
  if (!vacancyRow) return null;

  const rows = await db
    .select({
      id: application.id,
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      city: application.city,
      experience: application.experience,
      english: application.english,
      availability: application.availability,
      status: application.status,
      createdAt: application.createdAt,
    })
    .from(application)
    .where(eq(application.vacancyId, vacancyId))
    .orderBy(desc(application.createdAt));

  const statusCounts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
  const experienceCounts: Record<string, number> = {};
  const englishCounts: Record<string, number> = {};
  const availabilityCounts: Record<string, number> = {};
  for (const row of rows) {
    statusCounts[row.status] += 1;
    experienceCounts[row.experience] = (experienceCounts[row.experience] ?? 0) + 1;
    englishCounts[row.english] = (englishCounts[row.english] ?? 0) + 1;
    availabilityCounts[row.availability] = (availabilityCounts[row.availability] ?? 0) + 1;
  }

  return {
    vacancy: {
      id: vacancyRow.id,
      title: vacancyRow.title,
      departmentLabel: vacancyRow.departmentLabel,
      status: vacancyRow.status,
      publishedAt: vacancyRow.publishedAt?.toISOString() ?? null,
      createdAt: vacancyRow.createdAt.toISOString(),
    },
    total: rows.length,
    statusCounts,
    experienceCounts,
    englishCounts,
    availabilityCounts,
    candidates: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
  };
}
