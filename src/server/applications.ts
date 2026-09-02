"use server";

import { del } from "@vercel/blob";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { application, applicationStatusHistory, vacancy } from "@/db/schema/careers";
import { user } from "@/db/schema/auth";
import { department } from "@/db/schema/department";
import { requireAdmin } from "@/lib/auth-guard";
import { APPLICATION_STATUSES, isApplicationStatus, type ApplicationStatus } from "@/lib/applicationStatus";
import { requireEnv } from "@/lib/env";
import { dateRangeWhere, listSelection, scopeWhere, searchWhere, toRow, type ApplicationListRow } from "./applicationQuery";

export type { ApplicationListRow } from "./applicationQuery";

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
  dateFrom?: string | null;
  dateTo?: string | null;
};

export type ApplicationListPage = {
  rows: ApplicationListRow[];
  total: number;
  page: number;
  perPage: number;
  counts: Record<ApplicationStatus | "all", number>;
};

export type ApplicationStatusHistoryRow = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedByName: string | null;
  changedAt: string;
};

export type ActionResult = { ok: true } | { ok: false; message: string };

const PER_PAGE_ALLOWED = [10, 25, 50];

export async function listApplications(query: ApplicationListQuery = {}): Promise<ApplicationListPage> {
  await requireAdmin();

  const perPage = PER_PAGE_ALLOWED.includes(query.perPage ?? 0) ? query.perPage! : 10;
  const column = query.sortKey === "fullName" ? application.fullName : application.createdAt;
  const direction = query.sortDir === "asc" ? asc : desc;

  const scope = scopeWhere(query.scope);
  const search = searchWhere(query.query);
  const dateRange = dateRangeWhere(query.dateFrom, query.dateTo);
  const status = query.status && isApplicationStatus(query.status) ? eq(application.status, query.status) : undefined;
  const where = and(scope, search, dateRange, status);

  // Los conteos por estado ignoran el filtro de estado: son las pestañas.
  const countRows = await db
    .select({ status: application.status, total: count() })
    .from(application)
    .leftJoin(vacancy, eq(application.vacancyId, vacancy.id))
    .where(and(scope, search, dateRange))
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
  const session = await requireAdmin();
  if (!isApplicationStatus(status)) return { ok: false, message: "Invalid status." };

  const valid = ids.filter((id) => z.uuid().safeParse(id).success);
  if (valid.length === 0) return { ok: false, message: "No valid applications selected." };

  await db.transaction(async (tx) => {
    // Antes del estado actual, no después: una vez actualizado ya no hay
    // forma de saber de dónde venía cada fila para la fila de auditoría.
    const current = await tx
      .select({ id: application.id, status: application.status })
      .from(application)
      .where(inArray(application.id, valid));

    await tx.update(application).set({ status }).where(inArray(application.id, valid));

    const changed = current.filter((row) => row.status !== status);
    if (changed.length > 0) {
      await tx.insert(applicationStatusHistory).values(
        changed.map((row) => ({
          applicationId: row.id,
          fromStatus: row.status,
          toStatus: status,
          changedBy: session.user.id,
        })),
      );
    }
  });

  return { ok: true };
}

export async function getApplicationStatusHistory(applicationId: string): Promise<ApplicationStatusHistoryRow[]> {
  await requireAdmin();
  if (!z.uuid().safeParse(applicationId).success) return [];

  const rows = await db
    .select({
      id: applicationStatusHistory.id,
      fromStatus: applicationStatusHistory.fromStatus,
      toStatus: applicationStatusHistory.toStatus,
      changedByName: user.name,
      changedAt: applicationStatusHistory.changedAt,
    })
    .from(applicationStatusHistory)
    .leftJoin(user, eq(applicationStatusHistory.changedBy, user.id))
    .where(eq(applicationStatusHistory.applicationId, applicationId))
    .orderBy(asc(applicationStatusHistory.changedAt));

  return rows.map((row) => ({ ...row, changedAt: row.changedAt.toISOString() }));
}

// Cada línea es una viñeta (ver ListField): se guardan como texto plano
// unido por saltos de línea en vez de sumar una columna jsonb para esto.
const notesLinesSchema = z
  .array(z.string().max(500, "Keep each note under 500 characters."))
  .max(50, "That's too many notes — trim the list.")
  .transform((lines) => lines.map((line) => line.trim()).filter(Boolean));

export async function saveApplicationNotes(id: string, notes: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid application." };

  const parsed = notesLinesSchema.safeParse(notes);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid notes." };

  const done = await db
    .update(application)
    .set({ notes: parsed.data.join("\n") })
    .where(eq(application.id, id))
    .returning({ id: application.id });
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
