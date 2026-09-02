"use server";

import { and, asc, desc, eq, gt, gte, ilike, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { category, post } from "@/db/schema/blog";
import { user } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { readingMinutes, sanitizePostHtml } from "@/lib/blocks";
import { missingToPublish, type PublishDraft } from "@/lib/publishRules";
import { slugify } from "@/lib/slugify";

export type PostStatus = "draft" | "published" | "hidden";

export type PostListRow = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  categoryName: string | null;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  authorName: string | null;
};

export type PostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryId: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  coverPathname: string | null;
  content: unknown;
  status: PostStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; message: string; fields?: Record<string, string> };

const draftSchema = z.object({
  title: z.string().trim().min(3, "The title needs at least 3 characters.").max(140),
  excerpt: z.string().trim().max(300).optional(),
  categoryId: z.uuid().nullable().optional(),
  coverUrl: z.url().nullable().optional(),
  coverAlt: z.string().trim().max(180).nullable().optional(),
  coverPathname: z.string().trim().max(300).nullable().optional(),
  content: z.array(z.unknown()).optional(),
  // Lo arma BlockEditor con un DOM real; el servidor solo lo sanea, ver blocks.ts.
  contentHtml: z.string().optional(),
  seoTitle: z.string().trim().max(70).nullable().optional(),
  seoDescription: z.string().trim().max(180).nullable().optional(),
});

export type PostInput = z.input<typeof draftSchema>;

/* Publicar exige lo que la página pública necesita para no salir rota. Las
   reglas viven en lib/publishRules porque el editor las usa para bloquear el
   botón: extenderlas aquí con Zod daba mensajes crudos ("expected string,
   received null") en cuanto un campo llegaba nulo en vez de vacío. */
function publishBlockers(data: PublishDraft) {
  const missing = missingToPublish(data);
  if (missing.length === 0) return null;

  return {
    ok: false as const,
    message: missing.map((rule) => rule.message).join(" "),
    fields: Object.fromEntries(missing.map((rule) => [rule.field, rule.message])),
  };
}

function asDraft(data: {
  title: string;
  excerpt?: string | null;
  categoryId?: string | null;
  coverUrl?: string | null;
  coverAlt?: string | null;
}): PublishDraft {
  return {
    title: data.title,
    excerpt: data.excerpt ?? "",
    categoryId: data.categoryId ?? null,
    coverUrl: data.coverUrl ?? null,
    coverAlt: data.coverAlt ?? null,
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

// Un slug repetido no debe frenar al autor: se desambigua solo.
async function freeSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "articulo";
  for (let i = 0; i < 40; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const found = await db
      .select({ id: post.id })
      .from(post)
      .where(eq(post.slug, candidate))
      .limit(1);
    if (found.length === 0 || found[0].id === ignoreId) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export type PostListQuery = {
  page?: number;
  perPage?: number;
  sortKey?: "title" | "updatedAt";
  sortDir?: "asc" | "desc";
  query?: string;
  // "draft" | "published" | "scheduled" | "hidden" | null (todas). "scheduled"
  // no es un valor real de la columna: se deriva de published + fecha futura,
  // igual que badgeOf() en PostsTable.tsx — ver statusWhere más abajo.
  status?: string | null;
  categoryId?: string | null;
  publishedFrom?: string | null;
  publishedTo?: string | null;
};

export type PostListCounts = Record<PostStatus | "scheduled" | "all", number>;

export type PostListPage = {
  rows: PostListRow[];
  total: number;
  page: number;
  perPage: number;
  counts: PostListCounts;
};

const PER_PAGE_ALLOWED = [10, 25, 50];

function publishedRangeWhere(from?: string | null, to?: string | null) {
  const clauses = [];
  if (from) {
    const date = new Date(from);
    if (!Number.isNaN(date.getTime())) clauses.push(gte(post.publishedAt, date));
  }
  if (to) {
    const date = new Date(to);
    if (!Number.isNaN(date.getTime())) {
      date.setHours(23, 59, 59, 999);
      clauses.push(lte(post.publishedAt, date));
    }
  }
  return clauses.length ? and(...clauses) : undefined;
}

// "scheduled" es published + publishedAt en el futuro; "published" de verdad
// es published + publishedAt ya pasado (o sin fecha, caso raro pero posible).
function statusWhere(status: string | null | undefined, now: Date) {
  if (status === "draft" || status === "hidden") return eq(post.status, status);
  if (status === "published") return and(eq(post.status, "published"), or(isNull(post.publishedAt), lte(post.publishedAt, now)));
  if (status === "scheduled") return and(eq(post.status, "published"), gt(post.publishedAt, now));
  return undefined;
}

/* La página se pide a Postgres, no se recorta en el cliente: traer la tabla
   entera para mostrar diez filas escala con el blog y no con la pantalla. */
export async function listPosts(query: PostListQuery = {}): Promise<PostListPage> {
  await requireAdmin();

  const perPage = PER_PAGE_ALLOWED.includes(query.perPage ?? 0) ? query.perPage! : 10;
  const column = query.sortKey === "title" ? post.title : post.updatedAt;
  const direction = query.sortDir === "asc" ? asc : desc;
  const now = new Date();

  const needle = query.query?.trim();
  // Busca por título o categoría: son las dos columnas de texto que se ven
  // en la tabla, igual que en /admin/vacancies (título + departamento).
  const searchClause = needle
    ? or(ilike(post.title, `%${escapeLike(needle)}%`), ilike(category.name, `%${escapeLike(needle)}%`))
    : undefined;
  const categoryClause = query.categoryId ? eq(post.categoryId, query.categoryId) : undefined;
  const baseFilters = and(searchClause, categoryClause, publishedRangeWhere(query.publishedFrom, query.publishedTo));
  const where = and(baseFilters, statusWhere(query.status, now));

  // Las pestañas ignoran el filtro de estado (son ellas): se cuenta sobre
  // baseFilters y se deriva "scheduled" en JS, en vez de armar cuatro
  // consultas agrupadas para un estado que ni siquiera vive en la columna.
  const countQuery = db
    .select({ status: post.status, publishedAt: post.publishedAt })
    .from(post)
    .leftJoin(category, eq(post.categoryId, category.id))
    .where(baseFilters);

  const pageQuery = (page: number) =>
    db
      .select({
        id: post.id,
        slug: post.slug,
        title: post.title,
        coverUrl: post.coverUrl,
        categoryName: category.name,
        status: post.status,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        authorName: user.name,
      })
      .from(post)
      .leftJoin(category, eq(post.categoryId, category.id))
      .leftJoin(user, eq(post.authorId, user.id))
      .where(where)
      /* Desempate por id: sin un orden total, dos filas con el mismo timestamp
         pueden cambiar de sitio entre páginas y una se vería dos veces. */
      .orderBy(direction(column), desc(post.id))
      .limit(perPage)
      .offset((page - 1) * perPage);

  // Conteo y página viajan juntos: la base es remota y cada ida cuesta lo mismo.
  const requested = Math.max(query.page ?? 1, 1);
  const [countRows, requestedRows] = await Promise.all([countQuery, pageQuery(requested)]);

  const counts: PostListCounts = { draft: 0, published: 0, scheduled: 0, hidden: 0, all: countRows.length };
  for (const row of countRows) {
    if (row.status !== "published") {
      counts[row.status] += 1;
      continue;
    }
    const isScheduled = row.publishedAt !== null && row.publishedAt.getTime() > now.getTime();
    counts[isScheduled ? "scheduled" : "published"] += 1;
  }

  const total = query.status ? (counts[query.status as keyof PostListCounts] ?? 0) : counts.all;
  // Una página que ya no existe (tras borrar) se corrige con una segunda consulta.
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requested, pages);
  const rows = page === requested ? requestedRows : await pageQuery(page);

  return {
    rows: rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    })),
    total,
    page,
    perPage,
    counts,
  };
}

export async function getPost(id: string): Promise<PostDetail | null> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return null;

  const rows = await db.select().from(post).where(eq(post.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    categoryId: row.categoryId,
    coverUrl: row.coverUrl,
    coverAlt: row.coverAlt,
    coverPathname: row.coverPathname,
    content: row.content,
    status: row.status,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export async function createPost(): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();

  const slug = await freeSlug("untitled");
  const created = await db
    .insert(post)
    .values({ slug, title: "Untitled", authorId: session.user.id })
    .returning({ id: post.id });

  return { ok: true, data: { id: created[0].id } };
}

export async function savePost(id: string, input: PostInput): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid article." };

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  try {
    const done = await db
      .update(post)
      .set({
        title: data.title,
        excerpt: data.excerpt ?? "",
        categoryId: data.categoryId ?? null,
        coverUrl: data.coverUrl ?? null,
        coverAlt: data.coverAlt ?? null,
        coverPathname: data.coverPathname ?? null,
        content: data.content ?? [],
        // Se guarda en cada borrador, no solo al publicar: así publishPost y
        // setPostStatus nunca necesitan generarlo — solo leerlo.
        contentHtml: data.contentHtml !== undefined ? sanitizePostHtml(data.contentHtml) : null,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        readingMinutes: readingMinutes(data.content ?? []),
      })
      .where(eq(post.id, id))
      .returning({ id: post.id });
    if (done.length === 0) return { ok: false, message: "That article no longer exists." };
  } catch (error) {
    // Sin esto el fallo real se pierde y solo queda un mensaje genérico.
    console.error("savePost failed:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save the article.",
    };
  }

  revalidateTag("posts", "max");
  return { ok: true };
}

export async function publishPost(
  id: string,
  input: PostInput,
  publishedAt?: string | null,
): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid article." };

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const blocked = publishBlockers(asDraft(data));
  if (blocked) return blocked;

  // El slug se congela cuando el artículo llegó a ser público de verdad, no
  // cuando alguien dejó el estado en published: hasta entonces sigue al título.
  const current = await db
    .select({ slug: post.slug, publishedAt: post.publishedAt })
    .from(post)
    .where(eq(post.id, id))
    .limit(1);
  if (current.length === 0) return { ok: false, message: "That article no longer exists." };
  const slug = current[0].publishedAt ? current[0].slug : await freeSlug(data.title, id);

  // El HTML lo arma el editor en el navegador (DOM real); el servidor solo lo sanea.
  if (data.contentHtml === undefined) {
    return { ok: false, message: "Could not read the article content. Reload the editor and try again." };
  }
  const html = sanitizePostHtml(data.contentHtml);

  try {
    await db
      .update(post)
      .set({
        slug,
        title: data.title,
        excerpt: data.excerpt,
        categoryId: data.categoryId,
        coverUrl: data.coverUrl ?? null,
        coverAlt: data.coverAlt ?? null,
        coverPathname: data.coverPathname ?? null,
        content: data.content ?? [],
        contentHtml: html,
        readingMinutes: readingMinutes(data.content ?? []),
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        status: "published",
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      })
      .where(eq(post.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, message: "There is already an article with that URL." };
    return { ok: false, message: "Could not publish the article." };
  }

  revalidateTag("posts", "max");
  return { ok: true };
}

export async function setPostStatus(id: string, status: PostStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Invalid article." };
  if (!["draft", "published", "hidden"].includes(status)) {
    return { ok: false, message: "Invalid status." };
  }

  if (status !== "published") {
    const done = await db.update(post).set({ status }).where(eq(post.id, id)).returning({ id: post.id });
    if (done.length === 0) return { ok: false, message: "That article no longer exists." };

    revalidateTag("posts", "max");
    return { ok: true };
  }

  /* Publicar desde la tabla tiene que dejar el artículo igual que el editor: sin
     fecha el filtro público lo descarta y sin HTML la página sale en blanco. */
  const rows = await db
    .select({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      categoryId: post.categoryId,
      coverUrl: post.coverUrl,
      coverAlt: post.coverAlt,
      contentHtml: post.contentHtml,
      publishedAt: post.publishedAt,
    })
    .from(post)
    .where(eq(post.id, id))
    .limit(1);
  if (rows.length === 0) return { ok: false, message: "That article no longer exists." };
  const row = rows[0];

  // La tabla no pinta errores por campo: el motivo tiene que caber en el aviso.
  const blocked = publishBlockers(asDraft(row));
  if (blocked) return blocked;

  // Estreno: hasta ahora el slug seguía al título y no había versión renderizada.
  const first = row.publishedAt === null;

  /* El HTML lo genera el editor en el navegador al guardar (ver savePost); acá
     no hay cliente ni DOM para armarlo, así que si todavía no existe hay que
     mandar a guardar desde el editor en vez de intentar generarlo en el servidor. */
  if (row.contentHtml === null) {
    return {
      ok: false,
      message: "Open the article in the editor and save it once before publishing from this list.",
    };
  }
  const html = row.contentHtml;

  try {
    await db
      .update(post)
      .set({
        status,
        slug: first ? await freeSlug(row.title, id) : row.slug,
        contentHtml: html,
        publishedAt: sql`coalesce(${post.publishedAt}, now())`,
      })
      .where(eq(post.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, message: "There is already an article with that URL." };
    return { ok: false, message: "Could not publish the article." };
  }

  revalidateTag("posts", "max");
  return { ok: true };
}

export async function deletePosts(ids: string[]): Promise<ActionResult> {
  await requireAdmin();

  const valid = ids.filter((id) => z.uuid().safeParse(id).success);
  if (valid.length === 0) return { ok: false, message: "No valid articles to delete." };

  await db.delete(post).where(inArray(post.id, valid));

  revalidateTag("posts", "max");
  return { ok: true };
}
