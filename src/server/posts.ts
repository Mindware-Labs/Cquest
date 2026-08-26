"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { category, post } from "@/db/schema/blog";
import { user } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { readingMinutes, renderBlocks } from "@/lib/blocks";
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

/* Publicar exige lo que la página pública necesita para no salir rota: portada
   con texto alternativo, extracto y categoría. Un borrador no exige nada. */
const publishSchema = draftSchema.extend({
  excerpt: z.string().trim().min(20, "El extracto necesita al menos 20 caracteres."),
  categoryId: z.uuid("Elige una categoría antes de publicar."),
  coverUrl: z.url("Hace falta una imagen de portada."),
  coverAlt: z.string().trim().min(3, "La portada necesita texto alternativo."),
});

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

export async function listPosts(): Promise<PostListRow[]> {
  await requireAdmin();

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
    .orderBy(desc(post.updatedAt));

  return rows.map((row) => ({
    ...row,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  }));
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
  } catch {
    return { ok: false, message: "No se pudo guardar el artículo." };
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

  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Falta algo para poder publicarlo.",
      fields: fieldErrors(parsed.error),
    };
  }
  const data = parsed.data;

  // El slug se fija al publicar: hasta entonces sigue al título.
  const current = await db.select({ slug: post.slug, status: post.status }).from(post).where(eq(post.id, id)).limit(1);
  if (current.length === 0) return { ok: false, message: "Ese artículo ya no existe." };
  const slug = current[0].status === "published" ? current[0].slug : await freeSlug(data.title, id);

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
        coverUrl: data.coverUrl,
        coverAlt: data.coverAlt,
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

  const done = await db.update(post).set({ status }).where(eq(post.id, id)).returning({ id: post.id });
  if (done.length === 0) return { ok: false, message: "Ese artículo ya no existe." };

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
