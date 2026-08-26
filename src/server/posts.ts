"use server";

import { asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { category, post } from "@/db/schema/blog";
import { user } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { readingMinutes } from "@/lib/blocks";
import { missingToPublish, type PublishDraft } from "@/lib/publishRules";
import { renderBlocks } from "@/lib/renderBlocks";
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
  title: z.string().trim().min(3, "El título necesita al menos 3 caracteres.").max(140),
  excerpt: z.string().trim().max(300).optional(),
  categoryId: z.uuid().nullable().optional(),
  coverUrl: z.url().nullable().optional(),
  coverAlt: z.string().trim().max(180).nullable().optional(),
  coverPathname: z.string().trim().max(300).nullable().optional(),
  content: z.array(z.unknown()).optional(),
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
};

export type PostListPage = {
  rows: PostListRow[];
  total: number;
  page: number;
  perPage: number;
};

const PER_PAGE_ALLOWED = [10, 25, 50];

/* La página se pide a Postgres, no se recorta en el cliente: traer la tabla
   entera para mostrar diez filas escala con el blog y no con la pantalla. */
export async function listPosts(query: PostListQuery = {}): Promise<PostListPage> {
  await requireAdmin();

  const perPage = PER_PAGE_ALLOWED.includes(query.perPage ?? 0) ? query.perPage! : 10;
  const column = query.sortKey === "title" ? post.title : post.updatedAt;
  const direction = query.sortDir === "asc" ? asc : desc;

  const [{ total }] = await db.select({ total: count() }).from(post);

  // Pedir una página que ya no existe (tras borrar) devolvería una tabla vacía.
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(query.page ?? 1, 1), pages);

  const rows = await db
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
    /* Desempate por id: sin un orden total, dos filas con el mismo timestamp
       pueden cambiar de sitio entre páginas y una se vería dos veces. */
    .orderBy(direction(column), desc(post.id))
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
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Artículo inválido." };

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revisa los campos marcados.", fields: fieldErrors(parsed.error) };
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
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        readingMinutes: readingMinutes(data.content ?? []),
      })
      .where(eq(post.id, id))
      .returning({ id: post.id });
    if (done.length === 0) return { ok: false, message: "Ese artículo ya no existe." };
  } catch (error) {
    // Sin esto el fallo real se pierde y solo queda un mensaje genérico.
    console.error("savePost falló:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo guardar el artículo.",
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
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Artículo inválido." };

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revisa los campos marcados.", fields: fieldErrors(parsed.error) };
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
  if (current.length === 0) return { ok: false, message: "Ese artículo ya no existe." };
  const slug = current[0].publishedAt ? current[0].slug : await freeSlug(data.title, id);

  let html: string;
  try {
    html = await renderBlocks(data.content ?? []);
  } catch {
    return { ok: false, message: "No se pudo generar la versión pública del contenido." };
  }

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
    if (isUniqueViolation(error)) return { ok: false, message: "Ya hay un artículo con esa URL." };
    return { ok: false, message: "No se pudo publicar el artículo." };
  }

  revalidateTag("posts", "max");
  return { ok: true };
}

export async function setPostStatus(id: string, status: PostStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Artículo inválido." };
  if (!["draft", "published", "hidden"].includes(status)) {
    return { ok: false, message: "Estado inválido." };
  }

  if (status !== "published") {
    const done = await db.update(post).set({ status }).where(eq(post.id, id)).returning({ id: post.id });
    if (done.length === 0) return { ok: false, message: "Ese artículo ya no existe." };

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
      content: post.content,
      contentHtml: post.contentHtml,
      publishedAt: post.publishedAt,
    })
    .from(post)
    .where(eq(post.id, id))
    .limit(1);
  if (rows.length === 0) return { ok: false, message: "Ese artículo ya no existe." };
  const row = rows[0];

  // La tabla no pinta errores por campo: el motivo tiene que caber en el aviso.
  const blocked = publishBlockers(asDraft(row));
  if (blocked) return blocked;

  // Estreno: hasta ahora el slug seguía al título y no había versión renderizada.
  const first = row.publishedAt === null;

  let html = row.contentHtml;
  if (html === null) {
    try {
      html = await renderBlocks(row.content ?? []);
    } catch {
      return { ok: false, message: "No se pudo generar la versión pública del contenido." };
    }
  }

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
    if (isUniqueViolation(error)) return { ok: false, message: "Ya hay un artículo con esa URL." };
    return { ok: false, message: "No se pudo publicar el artículo." };
  }

  revalidateTag("posts", "max");
  return { ok: true };
}

export async function deletePosts(ids: string[]): Promise<ActionResult> {
  await requireAdmin();

  const valid = ids.filter((id) => z.uuid().safeParse(id).success);
  if (valid.length === 0) return { ok: false, message: "No hay artículos válidos que eliminar." };

  await db.delete(post).where(inArray(post.id, valid));

  revalidateTag("posts", "max");
  return { ok: true };
}
