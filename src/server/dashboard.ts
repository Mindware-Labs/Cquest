"use server";

import { and, asc, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { application, applicationStatusHistory, vacancy } from "@/db/schema/careers";
import { department } from "@/db/schema/department";
import { requireAdmin } from "@/lib/auth-guard";

const NEEDS_ATTENTION_DAYS = 5;
const WEEKS = 8;

export type DashboardData = {
  stats: {
    openVacancies: number;
    totalApplications: number;
    applicationsThisWeek: number;
    applicationsLastWeek: number;
    hiresThisMonth: number;
    avgDaysToHire: number | null;
  };
  weeklyApplications: { label: string; count: number }[];
  byDepartment: { label: string; count: number }[];
  topVacancies: { id: string; title: string; departmentLabel: string | null; applications: number; hired: number }[];
  needsAttention: { id: string; fullName: string; email: string; createdAt: string; daysOld: number }[];
  duplicates: { email: string; fullName: string; count: number }[];
};

const weekLabel = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });

export async function getDashboard(): Promise<DashboardData> {
  await requireAdmin();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const attentionThreshold = new Date(now.getTime() - NEEDS_ATTENTION_DAYS * 86_400_000);
  const eightWeeksAgo = new Date(now.getTime() - WEEKS * 7 * 86_400_000);

  const [
    [{ n: openVacancies }],
    [{ n: totalApplications }],
    [{ n: applicationsThisWeek }],
    [{ n: applicationsLastWeek }],
    [{ n: hiresThisMonth }],
    hiredHistory,
    recentApplications,
    departmentRows,
    topVacancyRows,
    attentionRows,
    duplicateRows,
  ] = await Promise.all([
    db.select({ n: count() }).from(vacancy).where(eq(vacancy.status, "published")),
    db.select({ n: count() }).from(application),
    db.select({ n: count() }).from(application).where(gte(application.createdAt, weekAgo)),
    db
      .select({ n: count() })
      .from(application)
      .where(and(gte(application.createdAt, twoWeeksAgo), lte(application.createdAt, weekAgo))),
    db
      .select({ n: sql<number>`count(distinct ${applicationStatusHistory.applicationId})` })
      .from(applicationStatusHistory)
      .where(and(eq(applicationStatusHistory.toStatus, "hired"), gte(applicationStatusHistory.changedAt, startOfMonth))),
    db
      .select({
        applicationId: applicationStatusHistory.applicationId,
        createdAt: application.createdAt,
        changedAt: sql<Date>`max(${applicationStatusHistory.changedAt})`,
      })
      .from(applicationStatusHistory)
      .innerJoin(application, eq(application.id, applicationStatusHistory.applicationId))
      .where(eq(applicationStatusHistory.toStatus, "hired"))
      .groupBy(applicationStatusHistory.applicationId, application.createdAt),
    db.select({ createdAt: application.createdAt }).from(application).where(gte(application.createdAt, eightWeeksAgo)),
    db
      .select({ label: department.shortLabel, count: count() })
      .from(application)
      .leftJoin(department, eq(application.departmentId, department.id))
      .groupBy(department.shortLabel)
      .orderBy(desc(count()))
      .limit(6),
    db
      .select({
        id: vacancy.id,
        title: vacancy.title,
        departmentLabel: department.shortLabel,
        applications: count(application.id),
        hired: sql<number>`count(*) filter (where ${application.status} = 'hired')`,
      })
      .from(vacancy)
      .innerJoin(application, eq(application.vacancyId, vacancy.id))
      .leftJoin(department, eq(vacancy.departmentId, department.id))
      .groupBy(vacancy.id, vacancy.title, department.shortLabel)
      .orderBy(desc(count(application.id)))
      .limit(8),
    db
      .select({ id: application.id, fullName: application.fullName, email: application.email, createdAt: application.createdAt })
      .from(application)
      .where(and(eq(application.status, "new"), lte(application.createdAt, attentionThreshold)))
      .orderBy(asc(application.createdAt))
      .limit(10),
    db
      .select({ email: application.email, fullName: sql<string>`max(${application.fullName})`, count: count() })
      .from(application)
      .groupBy(application.email)
      .having(sql`count(*) > 1`)
      .orderBy(desc(count()))
      .limit(8),
  ]);

  // Promedio de días para contratar: la fecha de alta viene en la misma consulta.
  let avgDaysToHire: number | null = null;
  if (hiredHistory.length > 0) {
    const diffs = hiredHistory.map((row) => (new Date(row.changedAt).getTime() - row.createdAt.getTime()) / 86_400_000);
    avgDaysToHire = diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
  }

  // 8 semanas corridas terminando hoy, no semanas calendario: así siempre
  // hay 8 barras completas sin importar qué día se mire el dashboard.
  const weeklyApplications = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(now.getTime() - (WEEKS - i) * 7 * 86_400_000);
    const end = new Date(start.getTime() + 7 * 86_400_000);
    return { start, end, count: 0 };
  });
  for (const row of recentApplications) {
    const t = row.createdAt.getTime();
    const bucket = weeklyApplications.find((w) => t >= w.start.getTime() && t < w.end.getTime());
    if (bucket) bucket.count += 1;
  }

  return {
    stats: {
      openVacancies,
      totalApplications,
      applicationsThisWeek,
      applicationsLastWeek,
      hiresThisMonth,
      avgDaysToHire,
    },
    weeklyApplications: weeklyApplications.map((bucket) => ({ label: weekLabel.format(bucket.start), count: bucket.count })),
    byDepartment: departmentRows.map((row) => ({ label: row.label ?? "No department", count: row.count })),
    topVacancies: topVacancyRows,
    needsAttention: attentionRows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      daysOld: Math.floor((now.getTime() - row.createdAt.getTime()) / 86_400_000),
    })),
    duplicates: duplicateRows,
  };
}
