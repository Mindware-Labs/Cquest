import "server-only";
import { and, eq, gte, ilike, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { application, vacancy } from "@/db/schema/careers";
import { department } from "@/db/schema/department";
import type { ApplicationStatus } from "@/lib/applicationStatus";

/* Compartido entre la tabla paginada (applications.ts, "use server") y la
   exportación (applicationExport.ts, sin guardia de auth propia): mismo
   WHERE y misma forma de fila en los dos casos, para que "lo que ves" y "lo
   que exportas" sean siempre la misma consulta. */

export type ApplicationListRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  vacancyId: string | null;
  vacancyTitle: string | null;
  vacancyLive: boolean;
  departmentLabel: string | null;
  experience: string;
  english: string;
  availability: string;
  status: ApplicationStatus;
  source: string;
  duplicateCount: number;
  resumeName: string;
  createdAt: string;
};

export const titleExpr = sql<string | null>`coalesce(${vacancy.title}, ${application.vacancyTitle})`;

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export function scopeWhere(scope?: string | null): SQL | undefined {
  if (scope === "pool") return isNull(application.vacancyId);
  if (scope && z.uuid().safeParse(scope).success) return eq(application.vacancyId, scope);
  return undefined;
}

export function searchWhere(query?: string): SQL | undefined {
  const needle = query?.trim();
  if (!needle) return undefined;
  const pattern = `%${escapeLike(needle)}%`;
  return or(ilike(application.fullName, pattern), ilike(application.email, pattern), sql`${titleExpr} ilike ${pattern}`);
}

// dateTo se trata como fin de ese día (inclusive): un admin que filtra "hasta
// el 15" espera ver lo que llegó durante el 15, no solo hasta medianoche.
export function dateRangeWhere(dateFrom?: string | null, dateTo?: string | null): SQL | undefined {
  const clauses: SQL[] = [];
  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!Number.isNaN(from.getTime())) clauses.push(gte(application.createdAt, from));
  }
  if (dateTo) {
    const to = new Date(dateTo);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      clauses.push(lte(application.createdAt, to));
    }
  }
  return clauses.length ? and(...clauses) : undefined;
}

export const listSelection = {
  id: application.id,
  fullName: application.fullName,
  email: application.email,
  phone: application.phone,
  city: application.city,
  vacancyId: application.vacancyId,
  vacancyTitle: titleExpr,
  liveVacancyId: vacancy.id,
  departmentLabel: department.shortLabel,
  experience: application.experience,
  english: application.english,
  availability: application.availability,
  status: application.status,
  source: application.source,
  // Correlacionada por email (sin distinguir mayúsculas): cuenta TODAS las
  // postulaciones de ese correo, incluida esta misma fila.
  duplicateCount: sql<number>`(select count(*) from ${application} dup where lower(dup.email) = lower(${application.email}))::int`,
  resumeName: application.resumeName,
  createdAt: application.createdAt,
};

export function toRow(row: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  vacancyId: string | null;
  vacancyTitle: string | null;
  liveVacancyId: string | null;
  departmentLabel: string | null;
  experience: string;
  english: string;
  availability: string;
  status: ApplicationStatus;
  source: string;
  duplicateCount: number;
  resumeName: string;
  createdAt: Date;
}): ApplicationListRow {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    city: row.city,
    vacancyId: row.vacancyId,
    vacancyTitle: row.vacancyTitle,
    vacancyLive: row.liveVacancyId !== null,
    departmentLabel: row.departmentLabel,
    experience: row.experience,
    english: row.english,
    availability: row.availability,
    status: row.status,
    source: row.source,
    duplicateCount: row.duplicateCount,
    resumeName: row.resumeName,
    createdAt: row.createdAt.toISOString(),
  };
}
