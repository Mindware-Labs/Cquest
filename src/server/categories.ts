"use server";

import { asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { category } from "@/db/schema/blog";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/slugify";

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fields?: Record<string, string> };

/* El sitio público es solo en inglés, así que la categoría tiene un nombre.
   El slug no está aquí: lo deriva el servidor y el cliente no lo manda. */
const schema = z.object({
  name: z.string().trim().min(2, "El nombre necesita al menos 2 caracteres.").max(60),
  description: z.string().trim().max(240).optional(),
});

export type CategoryInput = z.input<typeof schema>;

function fieldErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

// El backslash es el escape por defecto de LIKE en Postgres.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function fields(input: z.output<typeof schema>) {
  return { name: input.name, description: input.description || null };
}

// Drizzle envuelve el error de Postgres: el código vive en `cause`, no arriba.
function isUniqueViolation(error: unknown): boolean {
  const cause = (error as { cause?: { code?: string } })?.cause;
  return cause?.code === "23505";
}

export type CategoryListQuery = {
  page?: number;
  perPage?: number;
  sortKey?: "name" | "createdAt";
  sortDir?: "asc" | "desc";
  query?: string;
};

export type CategoryListPage = {
  rows: CategoryRow[];
  total: number;
  page: number;
  perPage: number;
};

const PER_PAGE_ALLOWED = [10, 25, 50];

/* Filtro, orden y página los resuelve Postgres. El buscador mira nombre y slug
   porque son los dos que se ven en la tabla. */
export async function listCategories(query: CategoryListQuery = {}): Promise<CategoryListPage> {
  await requireAdmin();

  const perPage = PER_PAGE_ALLOWED.includes(query.perPage ?? 0) ? query.perPage! : 10;
  const needle = query.query?.trim();
  // % y _ son comodines de LIKE: sin escapar, buscar "100%" traería todo.
  const where = needle
    ? or(
        ilike(category.name, `%${escapeLike(needle)}%`),
        ilike(category.slug, `%${escapeLike(needle)}%`),
      )
    : undefined;

  const column = query.sortKey === "createdAt" ? category.createdAt : category.name;
  const direction = query.sortDir === "desc" ? desc : asc;

  const [{ total }] = await db.select({ total: count() }).from(category).where(where);

  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(query.page ?? 1, 1), pages);

  const rows = await db
    .select()
    .from(category)
    .where(where)
    // Desempate estable: sin él, dos nombres iguales pueden saltar de página.
    .orderBy(direction(column), asc(category.id))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    perPage,
  };
}

/* El desplegable del editor necesita todas, no una página: son pocas y una
   categoría que no aparezca en la lista no se puede elegir. */
export async function listAllCategories(): Promise<CategoryRow[]> {
  await requireAdmin();
  const rows = await db.select().from(category).orderBy(asc(category.name));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revisa los campos marcados.", fields: fieldErrors(parsed.error) };
  }
  const slug = slugify(parsed.data.name);
  if (!slug) {
    return { ok: false, message: "Ese nombre no produce una URL válida.", fields: { name: "Usa al menos dos letras o números." } };
  }

  try {
    await db.insert(category).values({ slug, ...fields(parsed.data) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, message: "Ya existe una categoría con esa URL.", fields: { name: "Ya hay una categoría que produce esa misma URL." } };
    }
    return { ok: false, message: "No se pudo guardar la categoría." };
  }

  revalidateTag("categories", "max");
  return { ok: true };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();

  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Categoría inválida." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revisa los campos marcados.", fields: fieldErrors(parsed.error) };
  }
  /* El slug queda fuera del update a propósito: cambiarlo rompería cualquier
     URL ya publicada que apunte a esta categoría. */
  try {
    const done = await db
      .update(category)
      .set(fields(parsed.data))
      .where(eq(category.id, id))
      .returning({ id: category.id });
    if (done.length === 0) return { ok: false, message: "Esa categoría ya no existe." };
  } catch {
    return { ok: false, message: "No se pudo guardar la categoría." };
  }

  revalidateTag("categories", "max");
  return { ok: true };
}

export async function deleteCategories(ids: string[]): Promise<ActionResult> {
  await requireAdmin();

  const valid = ids.filter((id) => z.uuid().safeParse(id).success);
  if (valid.length === 0) return { ok: false, message: "No hay categorías válidas que eliminar." };

  try {
    await db.delete(category).where(inArray(category.id, valid));
  } catch {
    // Cuando `post` exista con clave foránea, borrar una categoría en uso fallará aquí.
    return { ok: false, message: "No se pudo eliminar. Puede que tenga artículos asociados." };
  }

  revalidateTag("categories", "max");
  return { ok: true };
}
