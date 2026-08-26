import "server-only";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { category, post } from "@/db/schema/blog";
import { user } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/auth-guard";

/* Lecturas públicas, aparte de las del panel: aquellas exigen sesión de admin y
   estas las hace cualquier visitante. */

export type PublicPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  publishedAt: string;
  readingMinutes: number;
  authorName: string | null;
};

export type PublicArticle = PublicPost & {
  contentHtml: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

/* Publicado con fecha futura es "programado": no debe verse todavía. La misma
   condición sostiene el estado derivado que muestra el panel. */
function visible() {
  return and(eq(post.status, "published"), lte(post.publishedAt, sql`now()`));
}

const listSelection = {
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  coverUrl: post.coverUrl,
  coverAlt: post.coverAlt,
  categoryName: category.name,
  categorySlug: category.slug,
  publishedAt: post.publishedAt,
  readingMinutes: post.readingMinutes,
  authorName: user.name,
};

function normalize<T extends { publishedAt: Date | null }>(row: T) {
  return { ...row, publishedAt: (row.publishedAt ?? new Date()).toISOString() };
}

export async function listPublishedPosts(categorySlug?: string): Promise<PublicPost[]> {
  const where = categorySlug
    ? and(visible(), eq(category.slug, categorySlug))
    : visible();

  const rows = await db
    .select(listSelection)
    .from(post)
    .leftJoin(category, eq(post.categoryId, category.id))
    .leftJoin(user, eq(post.authorId, user.id))
    .where(where)
    .orderBy(desc(post.publishedAt));

  return rows.map(normalize);
}

export async function getPublishedPost(slug: string): Promise<PublicArticle | null> {
  const rows = await db
    .select({
      ...listSelection,
      contentHtml: post.contentHtml,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
    })
    .from(post)
    .leftJoin(category, eq(post.categoryId, category.id))
    .leftJoin(user, eq(post.authorId, user.id))
    .where(and(visible(), eq(post.slug, slug)))
    .limit(1);

  return rows[0] ? normalize(rows[0]) : null;
}

export type PreviewArticle = PublicArticle & {
  status: "draft" | "published" | "hidden";
  scheduled: boolean;
  // Los bloques crudos: el HTML lo arma quien pinta la previa, no este módulo.
  content: unknown;
};

/* La previa ve el artículo en cualquier estado, así que exige sesión de admin:
   sin ese guard sería una puerta abierta a los borradores por URL adivinable.
   Devuelve los bloques sin renderizar: importar BlockNote aquí lo metería en
   el grafo de las páginas públicas, que solo leen el snapshot ya guardado. */
export async function getPostForPreview(slug: string): Promise<PreviewArticle | null> {
  await requireAdmin();

  const rows = await db
    .select({
      ...listSelection,
      content: post.content,
      contentHtml: post.contentHtml,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      status: post.status,
    })
    .from(post)
    .leftJoin(category, eq(post.categoryId, category.id))
    .leftJoin(user, eq(post.authorId, user.id))
    .where(eq(post.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // "Programado" es published con fecha futura, igual que lo deriva el panel.
  const scheduled = row.status === "published" && (row.publishedAt?.getTime() ?? 0) > Date.now();

  return { ...normalize(row), scheduled };
}

// Solo las que tienen algo publicado: un filtro que no devuelve nada es una trampa.
export async function listCategoriesInUse(): Promise<{ name: string; slug: string; count: number }[]> {
  const rows = await db
    .select({
      name: category.name,
      slug: category.slug,
      count: sql<number>`count(${post.id})::int`,
    })
    .from(category)
    .innerJoin(post, and(eq(post.categoryId, category.id), visible()))
    .groupBy(category.id, category.name, category.slug)
    .orderBy(category.name);

  return rows;
}

export async function listPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return db.select({ slug: post.slug, updatedAt: post.updatedAt }).from(post).where(visible());
}
