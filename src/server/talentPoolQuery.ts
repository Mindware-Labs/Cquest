import "server-only";
import { and, asc, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { application } from "@/db/schema/careers";
import { department } from "@/db/schema/department";
import { APPLICATION_STATUSES, isApplicationStatus, type ApplicationStatus } from "@/lib/applicationStatus";
import { dateRangeWhere, escapeLike } from "./applicationQuery";

/* Sin "use server": lo llaman dos guardias de auth distintos (la página vía
   requireAdmin en applications.ts; el export vía adminSessionOrNull en su
   route handler, donde requireAdmin no sirve porque usa redirect()). Mismo
   motivo que vacancyReport.ts / applicationExport.ts. */

export type TalentPoolCandidate = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  english: string;
  availability: string;
  status: ApplicationStatus;
  source: string;
  message: string;
  departmentId: string | null;
  departmentLabel: string | null;
  resumeName: string;
  createdAt: string;
};

export type TalentPoolFilters = {
  query?: string | null;
  status?: string | null;
  experience?: string | null;
  english?: string | null;
  availability?: string | null;
  departmentId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
};

export type TalentPoolListQuery = TalentPoolFilters & {
  page?: number;
  perPage?: number;
  sortKey?: "createdAt" | "fullName";
  sortDir?: "asc" | "desc";
};

export type TalentPoolListPage = {
  rows: TalentPoolCandidate[];
  total: number;
  page: number;
  perPage: number;
  counts: Record<ApplicationStatus | "all", number>;
};

const PER_PAGE_ALLOWED = [10, 25, 50];

const talentPoolSelection = {
  id: application.id,
  fullName: application.fullName,
  email: application.email,
  phone: application.phone,
  city: application.city,
  experience: application.experience,
  english: application.english,
  availability: application.availability,
  status: application.status,
  source: application.source,
  message: application.message,
  departmentId: application.departmentId,
  departmentLabel: department.shortLabel,
  resumeName: application.resumeName,
  createdAt: application.createdAt,
};

function toTalentPoolCandidate(row: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  english: string;
  availability: string;
  status: ApplicationStatus;
  source: string;
  message: string;
  departmentId: string | null;
  departmentLabel: string | null;
  resumeName: string;
  createdAt: Date;
}): TalentPoolCandidate {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// Sin vacante nunca hay "aplicado a" que buscar: alcanza con nombre y correo.
function searchWhere(query?: string | null) {
  const needle = query?.trim();
  if (!needle) return undefined;
  const pattern = `%${escapeLike(needle)}%`;
  return or(ilike(application.fullName, pattern), ilike(application.email, pattern));
}

function filtersWhere(filters: TalentPoolFilters) {
  return and(
    isNull(application.vacancyId),
    searchWhere(filters.query),
    dateRangeWhere(filters.dateFrom, filters.dateTo),
    filters.experience ? eq(application.experience, filters.experience) : undefined,
    filters.english ? eq(application.english, filters.english) : undefined,
    filters.availability ? eq(application.availability, filters.availability) : undefined,
    filters.departmentId ? eq(application.departmentId, filters.departmentId) : undefined,
  );
}

export async function getTalentPoolPageData(query: TalentPoolListQuery = {}): Promise<TalentPoolListPage> {
  const perPage = PER_PAGE_ALLOWED.includes(query.perPage ?? 0) ? query.perPage! : 10;
  const column = query.sortKey === "fullName" ? application.fullName : application.createdAt;
  const direction = query.sortDir === "asc" ? asc : desc;

  const filters = filtersWhere(query);
  const status = query.status && isApplicationStatus(query.status) ? eq(application.status, query.status) : undefined;
  const where = and(filters, status);

  // Los conteos por estado ignoran el filtro de estado: son las pestañas.
  const countRows = await db.select({ status: application.status, total: count() }).from(application).where(filters).groupBy(application.status);

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
    .select(talentPoolSelection)
    .from(application)
    .leftJoin(department, eq(application.departmentId, department.id))
    .where(where)
    .orderBy(direction(column), desc(application.id))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows: rows.map(toTalentPoolCandidate), total, page, perPage, counts };
}

export async function getTalentPoolForExport(filters: TalentPoolFilters = {}): Promise<TalentPoolCandidate[]> {
  const rows = await db
    .select(talentPoolSelection)
    .from(application)
    .leftJoin(department, eq(application.departmentId, department.id))
    .where(filtersWhere(filters))
    .orderBy(desc(application.createdAt));

  return rows.map(toTalentPoolCandidate);
}
