"use server";

import { del } from "@vercel/blob";
import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { application, vacancy } from "@/db/schema/careers";
import { department } from "@/db/schema/department";
import { requireAdmin } from "@/lib/auth-guard";
import { APPLICATION_STATUSES, isApplicationStatus, type ApplicationStatus } from "@/lib/applicationStatus";
import { requireEnv } from "@/lib/env";

export type ApplicationListRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  // Null = banco de talento. El título vivo manda; si la vacante ya no
  // existe queda el que se copió al postular.
  vacancyId: string | null;
  vacancyTitle: string | null;
  vacancyLive: boolean;
  departmentLabel: string | null;
  experience: string;
  english: string;
  availability: string;
  status: ApplicationStatus;
  resumeName: string;
  createdAt: string;
};

export type ApplicationDetail = ApplicationListRow & {
  message: string;
  notes: string;
  resumeSize: number;
  resumeType: string;
  updatedAt: string;
};

export type ApplicationScope = { id: string; title: string; count: number };

export type ApplicationListQuery = {
  page?: number;
  perPage?: number;
  sortKey?: "createdAt" | "fullName";
  sortDir?: "asc" | "desc";
  query?: string;
  status?: string | null;
  // "pool" | id de vacante | null (todas).
  scope?: string | null;
};

export type ApplicationListPage = {
  rows: ApplicationListRow[];
  total: number;
  page: number;
  perPage: number;
  counts: Record<ApplicationStatus | "all", number>;
};

export type ActionResult = { ok: true } | { ok: false; message: string };

const PER_PAGE_ALLOWED = [10, 25, 50];

const titleExpr = sql<string | null>`coalesce(${vacancy.title}, ${application.vacancyTitle})`;

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function scopeWhere(scope?: string | null): SQL | undefined {
  if (scope === "pool") return isNull(application.vacancyId);
  if (scope && z.uuid().safeParse(scope).success) return eq(application.vacancyId, scope);
  return undefined;
}

function searchWhere(query?: string): SQL | undefined {
  const needle = query?.trim();
  if (!needle) return undefined;
  const pattern = `%${escapeLike(needle)}%`;
  return or(
    ilike(application.fullName, pattern),
    ilike(application.email, pattern),
    sql`${titleExpr} ilike ${pattern}`,
  );
}

const listSelection = {
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
  resumeName: application.resumeName,
  createdAt: application.createdAt,
};

function toRow(row: {
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
    resumeName: row.resumeName,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listApplications(query: ApplicationListQuery = {}): Promise<ApplicationListPage> {
  await requireAdmin();

  const perPage = PER_PAGE_ALLOWED.includes(query.perPage ?? 0) ? query.perPage! : 10;
  const column = query.sortKey === "fullName" ? application.fullName : application.createdAt;
  const direction = query.sortDir === "asc" ? asc : desc;

  const scope = scopeWhere(query.scope);
  const search = searchWhere(query.query);
  const status = query.status && isApplicationStatus(query.status) ? eq(application.status, query.status) : undefined;
  const where = and(scope, search, status);

  // Los conteos por estado ignoran el filtro de estado: son las pestañas.
  const countRows = await db
    .select({ status: application.status, total: count() })
    .from(application)
    .leftJoin(vacancy, eq(application.vacancyId, vacancy.id))
    .where(and(scope, search))
    .groupBy(application.status);

  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus | "all", number>;
  counts.all = 0;
  for (const row of countRows) {
    counts[row.status] = row.total;
    counts.all += row.total;
  }

  const total = status ? counts[query.status as ApplicationStatus] : counts.all;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(query.page ?? 1, 1), pages);

  const rows = await db
    .select(listSelection)
    .from(application)
    .leftJoin(vacancy, eq(application.vacancyId, vacancy.id))
    .leftJoin(department, eq(application.departmentId, department.id))
    .where(where)
    .orderBy(direction(column), desc(application.id))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows: rows.map(toRow), total, page, perPage, counts };
}

/* Vacantes con al menos una postulación, más el banco de talento: alimenta el
   selector de alcance de la tabla. */
export async function listApplicationScopes(): Promise<ApplicationScope[]> {
  await requireAdmin();

  const rows = await db
    .select({
      id: application.vacancyId,
      title: sql<string | null>`coalesce(${vacancy.title}, max(${application.vacancyTitle}))`,
      total: count(),
    })
    .from(application)
    .leftJoin(vacancy, eq(application.vacancyId, vacancy.id))
    .groupBy(application.vacancyId, vacancy.title)
    .orderBy(desc(count()));

  return rows.map((row) => ({
    id: row.id ?? "pool",
    title: row.id ? (row.title ?? "Untitled position") : "Talent pool",
    count: row.total,
  }));
}

export async function getApplication(id: string): Promise<ApplicationDetail | null> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return null;

  const rows = await db
    .select({
      ...listSelection,
      message: application.message,
      notes: application.notes,
      resumeSize: application.resumeSize,
      resumeType: application.resumeType,
      updatedAt: application.updatedAt,
    })
    .from(application)
    .leftJoin(vacancy, eq(application.vacancyId, vacancy.id))
    .leftJoin(department, eq(application.departmentId, department.id))
    .where(eq(application.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    ...toRow(row),
    message: row.message,
    notes: row.notes,
    resumeSize: row.resumeSize,
    resumeType: row.resumeType,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function setApplicationStatus(ids: string[], status: ApplicationStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!isApplicationStatus(status)) return { ok: false, message: "Invalid status." };

  const valid = ids.filter((id) => z.uuid().safeParse(id).success);
  if (valid.length === 0) return { ok: false, message: "No valid applications selected." };

  await db.update(application).set({ status }).where(inArray(application.id, valid));
  return { ok: true };
}

export async function saveApplicationNotes(id: string, notes: string): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid application." };

  const parsed = z.string().max(4000, "Keep notes under 4,000 characters.").safeParse(notes);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid notes." };

  const done = await db.update(application).set({ notes: parsed.data.trim() }).where(eq(application.id, id)).returning({ id: application.id });
  if (done.length === 0) return { ok: false, message: "That application no longer exists." };
  return { ok: true };
}

export async function deleteApplications(ids: string[]): Promise<ActionResult> {
  await requireAdmin();

  const valid = ids.filter((id) => z.uuid().safeParse(id).success);
  if (valid.length === 0) return { ok: false, message: "No valid applications to delete." };

  const removed = await db
    .delete(application)
    .where(inArray(application.id, valid))
    .returning({ resumeUrl: application.resumeUrl });

  /* El CV se borra después de la fila y sin bloquear: un blob huérfano es un
     archivo de más, una fila sin blob sería una postulación rota. */
  const urls = removed.map((row) => row.resumeUrl).filter(Boolean);
  if (urls.length > 0) {
    try {
      await del(urls, { token: requireEnv("VACANCIES_READ_WRITE_TOKEN") });
    } catch (error) {
      console.error("[applications] could not delete resumes:", error);
    }
  }

  return { ok: true };
}
