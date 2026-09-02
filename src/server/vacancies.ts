"use server";

import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { application, vacancy } from "@/db/schema/careers";
import { user } from "@/db/schema/auth";
import { department } from "@/db/schema/department";
import { requireAdmin } from "@/lib/auth-guard";
import { missingToPublishVacancy, type VacancyPublishDraft } from "@/lib/vacancyPublishRules";
import { slugify } from "@/lib/slugify";
import { getVacancyReportData, type VacancyReport } from "./vacancyReport";

export type { VacancyReport, VacancyReportCandidate } from "./vacancyReport";

export type VacancyStatus = "draft" | "published" | "hidden";

export type VacancyListRow = {
  id: string;
  slug: string;
  title: string;
  departmentId: string | null;
  departmentLabel: string | null;
  status: VacancyStatus;
  publishedAt: string | null;
  updatedAt: string;
  authorName: string | null;
  applications: number;
};

export type VacancyDetail = {
  id: string;
  slug: string;
  title: string;
  departmentId: string | null;
  track: string | null;
  workMode: string | null;
  employmentType: string | null;
  location: string;
  schedule: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  status: VacancyStatus;
  publishedAt: string | null;
  applications: number;
  talentPoolMatches: number;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; fields?: Record<string, string> };

const stringList = z.array(z.string()).transform((lines) => lines.map((l) => l.trim()).filter(Boolean));

const draftSchema = z.object({
  title: z.string().trim().min(3, "The title needs at least 3 characters.").max(140),
  departmentId: z.uuid().nullable().optional(),
  track: z.enum(["entry", "professional"]).nullable().optional(),
  workMode: z.enum(["onsite", "hybrid", "remote"]).nullable().optional(),
  employmentType: z.enum(["full-time", "part-time"]).nullable().optional(),
  location: z.string().trim().max(140).optional(),
  schedule: z.string().trim().max(140).optional(),
  summary: z.string().trim().max(600).optional(),
  responsibilities: stringList.optional(),
  requirements: stringList.optional(),
  niceToHave: stringList.optional(),
});

export type VacancyInput = z.input<typeof draftSchema>;

function publishBlockers(data: VacancyPublishDraft) {
  const missing = missingToPublishVacancy(data);
  if (missing.length === 0) return null;

  return {
    ok: false as const,
    message: missing.map((rule) => rule.message).join(" "),
    fields: Object.fromEntries(missing.map((rule) => [rule.field, rule.message])),
  };
}

function asDraft(data: {
  title: string;
  summary?: string | null;
  departmentId?: string | null;
  workMode?: string | null;
  employmentType?: string | null;
  location?: string | null;
  responsibilities?: string[];
  requirements?: string[];
}): VacancyPublishDraft {
  return {
    title: data.title,
    summary: data.summary ?? "",
    departmentId: data.departmentId ?? null,
    workMode: data.workMode ?? null,
    employmentType: data.employmentType ?? null,
    location: data.location ?? "",
    responsibilities: data.responsibilities ?? [],
    requirements: data.requirements ?? [],
  };
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

function isUniqueViolation(error: unknown): boolean {
  return (error as { cause?: { code?: string } })?.cause?.code === "23505";
}

// El backslash es el escape por defecto de LIKE en Postgres.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

async function freeSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "vacante";
  for (let i = 0; i < 40; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const found = await db.select({ id: vacancy.id }).from(vacancy).where(eq(vacancy.slug, candidate)).limit(1);
    if (found.length === 0 || found[0].id === ignoreId) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export type VacancyListQuery = {
  page?: number;
  perPage?: number;
  sortKey?: "title" | "updatedAt";
  sortDir?: "asc" | "desc";
  query?: string;
};

export type VacancyListPage = {
  rows: VacancyListRow[];
  total: number;
  page: number;
  perPage: number;
};

const PER_PAGE_ALLOWED = [10, 25, 50];

export async function listVacancies(query: VacancyListQuery = {}): Promise<VacancyListPage> {
  await requireAdmin();

  const perPage = PER_PAGE_ALLOWED.includes(query.perPage ?? 0) ? query.perPage! : 10;
  const column = query.sortKey === "title" ? vacancy.title : vacancy.updatedAt;
  const direction = query.sortDir === "asc" ? asc : desc;

  const needle = query.query?.trim();
  // Busca por título o departamento: son las dos columnas de texto que se ven
  // en la tabla, igual que en /admin/categories (nombre + slug).
  const where = needle
    ? or(
        ilike(vacancy.title, `%${escapeLike(needle)}%`),
        ilike(department.shortLabel, `%${escapeLike(needle)}%`),
      )
    : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(vacancy)
    .leftJoin(department, eq(vacancy.departmentId, department.id))
    .where(where);

  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(query.page ?? 1, 1), pages);

  const rows = await db
    .select({
      id: vacancy.id,
      slug: vacancy.slug,
      title: vacancy.title,
      departmentId: vacancy.departmentId,
      departmentLabel: department.shortLabel,
      status: vacancy.status,
      publishedAt: vacancy.publishedAt,
      updatedAt: vacancy.updatedAt,
      authorName: user.name,
      applications: sql<number>`(select count(*) from ${application} a where a.vacancy_id = ${vacancy.id})::int`,
    })
    .from(vacancy)
    .leftJoin(user, eq(vacancy.authorId, user.id))
    .leftJoin(department, eq(vacancy.departmentId, department.id))
    .where(where)
    .orderBy(direction(column), desc(vacancy.id))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return {
    rows: rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    })),
    total,
    page,
    perPage,
  };
}

export async function getVacancy(id: string): Promise<VacancyDetail | null> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return null;

  const rows = await db.select().from(vacancy).where(eq(vacancy.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;

  const [{ applications }] = await db
    .select({ applications: count() })
    .from(application)
    .where(eq(application.vacancyId, id));

  const talentPoolMatches = row.departmentId
    ? (
        await db
          .select({ n: count() })
          .from(application)
          .where(and(isNull(application.vacancyId), eq(application.departmentId, row.departmentId)))
      )[0].n
    : 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    departmentId: row.departmentId,
    track: row.track,
    workMode: row.workMode,
    employmentType: row.employmentType,
    location: row.location ?? "",
    schedule: row.schedule ?? "",
    summary: row.summary,
    responsibilities: (row.responsibilities as string[]) ?? [],
    requirements: (row.requirements as string[]) ?? [],
    niceToHave: (row.niceToHave as string[]) ?? [],
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    applications,
    talentPoolMatches,
  };
}

export async function getVacancyReport(id: string): Promise<VacancyReport | null> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return null;
  return getVacancyReportData(id);
}

/* Un solo insert con lo que ya se llenó en el asistente por pasos (ver
   NewVacancyModal.tsx), en vez de crear en blanco y guardar aparte: así una
   vacante nunca queda visible en la lista como "Untitled position" si el
   usuario cierra el asistente a mitad de camino. */
export async function createVacancyDraft(input: VacancyInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const slug = await freeSlug(data.title || "untitled-position");
  const created = await db
    .insert(vacancy)
    .values({
      slug,
      title: data.title || "Untitled position",
      departmentId: data.departmentId ?? null,
      track: data.track ?? null,
      workMode: data.workMode ?? null,
      employmentType: data.employmentType ?? null,
      location: data.location ?? "",
      schedule: data.schedule ?? "",
      summary: data.summary ?? "",
      responsibilities: data.responsibilities ?? [],
      requirements: data.requirements ?? [],
      niceToHave: data.niceToHave ?? [],
      authorId: session.user.id,
    })
    .returning({ id: vacancy.id });

  revalidateTag("vacancies", "max");
  // db.select() no pasa por el fetch cache de Next: revalidatePath es lo que
  // de verdad saca la vacante (o su baja) del listado público, igual que
  // /team con revalidatePath en src/server/departments.ts.
  revalidatePath("/join-us");
  return { ok: true, data: { id: created[0].id } };
}

export async function saveVacancy(id: string, input: VacancyInput): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid vacancy." };

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  try {
    const done = await db
      .update(vacancy)
      .set({
        title: data.title,
        departmentId: data.departmentId ?? null,
        track: data.track ?? null,
        workMode: data.workMode ?? null,
        employmentType: data.employmentType ?? null,
        location: data.location ?? "",
        schedule: data.schedule ?? "",
        summary: data.summary ?? "",
        responsibilities: data.responsibilities ?? [],
        requirements: data.requirements ?? [],
        niceToHave: data.niceToHave ?? [],
      })
      .where(eq(vacancy.id, id))
      .returning({ id: vacancy.id });
    if (done.length === 0) return { ok: false, message: "That vacancy no longer exists." };
  } catch (error) {
    console.error("saveVacancy failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save the vacancy.",
    };
  }

  revalidateTag("vacancies", "max");
  revalidatePath("/join-us");
  return { ok: true };
}

export async function publishVacancy(
  id: string,
  input: VacancyInput,
  publishedAt?: string | null,
): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid vacancy." };

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const blocked = publishBlockers(asDraft(data));
  if (blocked) return blocked;

  const current = await db
    .select({ slug: vacancy.slug, publishedAt: vacancy.publishedAt })
    .from(vacancy)
    .where(eq(vacancy.id, id))
    .limit(1);
  if (current.length === 0) return { ok: false, message: "That vacancy no longer exists." };
  const slug = current[0].publishedAt ? current[0].slug : await freeSlug(data.title, id);

  try {
    await db
      .update(vacancy)
      .set({
        slug,
        title: data.title,
        departmentId: data.departmentId ?? null,
        track: data.track ?? null,
        workMode: data.workMode ?? null,
        employmentType: data.employmentType ?? null,
        location: data.location ?? "",
        schedule: data.schedule ?? "",
        summary: data.summary ?? "",
        responsibilities: data.responsibilities ?? [],
        requirements: data.requirements ?? [],
        niceToHave: data.niceToHave ?? [],
        status: "published",
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      })
      .where(eq(vacancy.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, message: "There is already a vacancy with that URL." };
    return { ok: false, message: "Could not publish the vacancy." };
  }

  revalidateTag("vacancies", "max");
  revalidatePath("/join-us");
  return { ok: true };
}

export async function setVacancyStatus(id: string, status: VacancyStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid vacancy." };
  if (!["draft", "published", "hidden"].includes(status)) {
    return { ok: false, message: "Invalid status." };
  }

  if (status !== "published") {
    const done = await db.update(vacancy).set({ status }).where(eq(vacancy.id, id)).returning({ id: vacancy.id });
    if (done.length === 0) return { ok: false, message: "That vacancy no longer exists." };

    revalidateTag("vacancies", "max");
    revalidatePath("/join-us");
    return { ok: true };
  }

  const rows = await db
    .select({
      slug: vacancy.slug,
      title: vacancy.title,
      summary: vacancy.summary,
      departmentId: vacancy.departmentId,
      workMode: vacancy.workMode,
      employmentType: vacancy.employmentType,
      location: vacancy.location,
      responsibilities: vacancy.responsibilities,
      requirements: vacancy.requirements,
      publishedAt: vacancy.publishedAt,
    })
    .from(vacancy)
    .where(eq(vacancy.id, id))
    .limit(1);
  if (rows.length === 0) return { ok: false, message: "That vacancy no longer exists." };
  const row = rows[0];

  const blocked = publishBlockers(
    asDraft({
      ...row,
      responsibilities: (row.responsibilities as string[]) ?? [],
      requirements: (row.requirements as string[]) ?? [],
    }),
  );
  if (blocked) return blocked;

  const first = row.publishedAt === null;

  try {
    await db
      .update(vacancy)
      .set({
        status,
        slug: first ? await freeSlug(row.title, id) : row.slug,
        publishedAt: sql`coalesce(${vacancy.publishedAt}, now())`,
      })
      .where(eq(vacancy.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, message: "There is already a vacancy with that URL." };
    return { ok: false, message: "Could not publish the vacancy." };
  }

  revalidateTag("vacancies", "max");
  revalidatePath("/join-us");
  return { ok: true };
}

export async function deleteVacancies(ids: string[]): Promise<ActionResult> {
  await requireAdmin();

  const valid = ids.filter((id) => z.uuid().safeParse(id).success);
  if (valid.length === 0) return { ok: false, message: "No valid vacancies to delete." };

  try {
    await db.delete(vacancy).where(inArray(vacancy.id, valid));
  } catch {
    return { ok: false, message: "Could not delete the selected vacancies." };
  }

  revalidateTag("vacancies", "max");
  revalidatePath("/join-us");
  return { ok: true };
}
