"use server";

import { asc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { department } from "@/db/schema/department";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/slugify";

export type DepartmentRow = {
  id: string;
  slug: string;
  icon: string;
  label: string;
  shortLabel: string;
  responsibilities: string[];
  sortOrder: number;
  createdAt: string;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fields?: Record<string, string> };

const stringList = z.array(z.string()).transform((lines) => lines.map((l) => l.trim()).filter(Boolean));

const schema = z.object({
  shortLabel: z.string().trim().min(2, "The short name needs at least 2 characters.").max(60),
  label: z.string().trim().min(2, "The full title needs at least 2 characters.").max(100),
  icon: z.string().trim().min(1, "Pick an icon."),
  responsibilities: stringList.optional(),
});

export type DepartmentInput = z.input<typeof schema>;

function fieldErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function isUniqueViolation(error: unknown): boolean {
  return (error as { cause?: { code?: string } })?.cause?.code === "23505";
}

function row(r: typeof department.$inferSelect): DepartmentRow {
  return {
    id: r.id,
    slug: r.slug,
    icon: r.icon,
    label: r.label,
    shortLabel: r.shortLabel,
    responsibilities: (r.responsibilities as string[]) ?? [],
    sortOrder: r.sortOrder,
    createdAt: r.createdAt.toISOString(),
  };
}

/* Sin paginación: son pocos (media docena, tal vez una veintena) y reordenar
   por arriba/abajo no puede cruzar páginas sin volverse confuso. La búsqueda
   filtra sobre la lista completa. */
export async function listDepartments(query?: string): Promise<DepartmentRow[]> {
  await requireAdmin();

  const needle = query?.trim();
  const where = needle
    ? or(ilike(department.label, `%${escapeLike(needle)}%`), ilike(department.shortLabel, `%${escapeLike(needle)}%`))
    : undefined;

  const rows = await db
    .select()
    .from(department)
    .where(where)
    .orderBy(asc(department.sortOrder), asc(department.id));

  return rows.map(row);
}

/* El desplegable del asistente de vacantes necesita todos. */
export async function listAllDepartments(): Promise<DepartmentRow[]> {
  await requireAdmin();
  const rows = await db.select().from(department).orderBy(asc(department.sortOrder), asc(department.id));
  return rows.map(row);
}

async function freeSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "department";
  for (let i = 0; i < 40; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const found = await db.select({ id: department.id }).from(department).where(eq(department.slug, candidate)).limit(1);
    if (found.length === 0 || found[0].id === ignoreId) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function createDepartment(input: DepartmentInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;
  const slug = await freeSlug(data.shortLabel);

  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${department.sortOrder}), -1)::int` }).from(department);

  try {
    await db.insert(department).values({
      slug,
      icon: data.icon,
      label: data.label,
      shortLabel: data.shortLabel,
      responsibilities: data.responsibilities ?? [],
      sortOrder: max + 1,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, message: "A department with that name already exists." };
    }
    return { ok: false, message: "Could not save the department." };
  }

  revalidateTag("departments", "max");
  // db.select() no pasa por el fetch cache de Next: revalidatePath es lo que
  // realmente hace que /team se regenere apenas se guarda un cambio.
  revalidatePath("/team");
  return { ok: true };
}

export async function updateDepartment(id: string, input: DepartmentInput): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid department." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  try {
    const done = await db
      .update(department)
      .set({
        icon: data.icon,
        label: data.label,
        shortLabel: data.shortLabel,
        responsibilities: data.responsibilities ?? [],
      })
      .where(eq(department.id, id))
      .returning({ id: department.id });
    if (done.length === 0) return { ok: false, message: "That department no longer exists." };
  } catch {
    return { ok: false, message: "Could not save the department." };
  }

  revalidateTag("departments", "max");
  revalidatePath("/team");
  return { ok: true };
}

export async function deleteDepartments(ids: string[]): Promise<ActionResult> {
  await requireAdmin();

  const valid = ids.filter((id) => z.uuid().safeParse(id).success);
  if (valid.length === 0) return { ok: false, message: "No valid departments to delete." };

  await db.delete(department).where(inArray(department.id, valid));

  revalidateTag("departments", "max");
  revalidatePath("/team");
  revalidateTag("vacancies", "max");
  return { ok: true };
}

/* Sube o baja una posición intercambiando sortOrder con el vecino: el
   organigrama público y los selects del admin siguen ese mismo orden. */
export async function moveDepartment(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid department." };

  const rows = await db.select().from(department).orderBy(asc(department.sortOrder), asc(department.id));
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return { ok: false, message: "That department no longer exists." };

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= rows.length) return { ok: true };

  const a = rows[index];
  const b = rows[swapWith];

  await db.transaction(async (tx) => {
    await tx.update(department).set({ sortOrder: b.sortOrder }).where(eq(department.id, a.id));
    await tx.update(department).set({ sortOrder: a.sortOrder }).where(eq(department.id, b.id));
  });

  revalidateTag("departments", "max");
  revalidatePath("/team");
  return { ok: true };
}
