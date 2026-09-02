import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { application, vacancy } from "@/db/schema/careers";
import { department } from "@/db/schema/department";
import { isApplicationStatus } from "@/lib/applicationStatus";
import { dateRangeWhere, listSelection, scopeWhere, searchWhere, toRow, type ApplicationListRow } from "./applicationQuery";

export type ApplicationExportFilters = {
  query?: string | null;
  status?: string | null;
  scope?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
};

/* Sin paginar y sin auth propia: la usan tanto la action de applications.ts
   (con requireAdmin) como el route handler de export (con
   adminSessionOrNull) — ver la nota en vacancyReport.ts sobre por qué esa
   guardia no puede vivir acá. */
export async function getApplicationsForExport(filters: ApplicationExportFilters): Promise<ApplicationListRow[]> {
  const where = and(
    scopeWhere(filters.scope),
    searchWhere(filters.query ?? undefined),
    dateRangeWhere(filters.dateFrom, filters.dateTo),
    filters.status && isApplicationStatus(filters.status) ? eq(application.status, filters.status) : undefined,
  );

  const rows = await db
    .select(listSelection)
    .from(application)
    .leftJoin(vacancy, eq(application.vacancyId, vacancy.id))
    .leftJoin(department, eq(application.departmentId, department.id))
    .where(where)
    .orderBy(desc(application.createdAt));

  return rows.map(toRow);
}
