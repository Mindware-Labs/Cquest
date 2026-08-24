import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma, PostStatus, PostLocale } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { locales, type Locale } from "@/i18n/config";
import { slugify } from "@/lib/slug";
import { getCurrentAdminId } from "@/lib/auth";
import { blockArraySchema, collectImageUrls, type Block } from "@/lib/blocks";
import { deleteUploads, orphanedUrls } from "@/lib/blob";
import { fromEditorDateTime } from "@/lib/postDates";

// Se reexporta para que el admin no tenga que saber que la conversión vive en otro módulo.
export { toEditorDateTime } from "@/lib/postDates";

export type PostActionState = { error: string | null; id?: number };

// Se valida con el mismo schema que el renderer público y el editor, así los tres nunca pueden divergir.
const contentSchema = z.string().transform((value, ctx) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    ctx.addIssue({ code: "custom", message: "El contenido del artículo no es un JSON válido." });
    return z.NEVER;
  }
  const result = blockArraySchema.safeParse(parsed);
  if (!result.success) {
    ctx.addIssue({ code: "custom", message: result.error.issues[0]?.message ?? "Contenido inválido." });
    return z.NEVER;
  }
  return result.data;
});

// datetime-local manda "2026-09-01T08:30" sin zona; vacío significa "ahora" y se resuelve en cada acción, no acá.
const scheduledAtSchema = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined;
    const date = fromEditorDateTime(value);
    if (!date) {
      ctx.addIssue({ code: "custom", message: "La fecha de publicación no es válida." });
      return z.NEVER;
    }
    return date;
  });

const postFieldsSchema = z.object({
  title: z.string().trim().min(4, "El título debe tener al menos 4 caracteres.").max(120, "Máximo 120 caracteres."),
  excerpt: z.string().trim().min(10, "El extracto debe tener al menos 10 caracteres.").max(300, "Máximo 300 caracteres."),
  content: contentSchema,
  // Siempre sale de uploadCoverImage(): ruta relativa a /api/images/..., no URL absoluta, para no atarse a un dominio fijo.
  coverImageUrl: z
    .string()
    .trim()
    .min(1, "Falta la portada.")
    .startsWith("/api/images/", "La portada debe salir de la subida a Vercel Blob."),
  coverImageAlt: z.string().trim().min(1, "Falta el texto alternativo de la portada.").max(200, "Máximo 200 caracteres."),
  categoryId: z.coerce.number().int("Categoría inválida."),
  // Un artículo vive en un idioma, no es traducción de otro; sale del mismo `locales` que el resto del sitio.
  locale: z.enum(locales).default("es"),
  seoTitle: z.string().trim().max(70, "Máximo 70 caracteres.").optional().or(z.literal("")),
  seoDescription: z.string().trim().max(160, "Máximo 160 caracteres.").optional().or(z.literal("")),
  // Publicar es un solo submit desde el editor, sin una segunda llamada a setPostStatus.
  intent: z.enum(["draft", "publish"]),
  // Con fecha futura el artículo queda PROGRAMADO: sigue PUBLISHED, pero publishedAt > ahora lo mantiene invisible.
  publishedAt: scheduledAtSchema,
});

function resolveSlug(formData: FormData, title: string): string | null {
  const rawSlug = formData.get("slug");
  const source = typeof rawSlug === "string" && rawSlug.trim().length > 0 ? rawSlug : title;
  const slug = slugify(source);
  return slug.length > 0 ? slug : null;
}

function emptyToUndefined(value: string): string | undefined {
  return value.length > 0 ? value : undefined;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isForeignKeyConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

// El sitemap no está en la lista a propósito: es force-dynamic con revalidate=3600, no hay entrada cacheada que invalidar.
function revalidatePost(slug?: string): void {
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
  revalidatePath("/[lang]/blog", "page");
  if (slug) revalidatePath(`/[lang]/blog/${slug}`, "page");
  revalidatePath("/[lang]/blog/rss.xml", "page");
}

// Estado visible: se DERIVA en vez de guardarse como cuarto valor del enum, para no depender de un job que corrija el reloj.

export type DisplayStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "HIDDEN";

export function displayStatus(
  post: { status: PostStatus; publishedAt: Date | null },
  now = new Date(),
): DisplayStatus {
  if (post.status !== PostStatus.PUBLISHED) return post.status;
  if (post.publishedAt && post.publishedAt > now) return "SCHEDULED";
  return "PUBLISHED";
}

/** ¿Este artículo se ve hoy en el blog público, en este idioma? */
export function isPubliclyVisible(
  post: { status: PostStatus; publishedAt: Date | null; locale: PostLocale },
  locale: Locale,
  now = new Date(),
): boolean {
  if (post.locale !== locale) return false;
  if (post.status !== PostStatus.PUBLISHED) return false;
  return post.publishedAt !== null && post.publishedAt <= now;
}

/** Listado completo para el panel admin — todos los estados. La TABLA de artículos ya no lo usa, ver getAdminPosts. */
export async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, author: { select: { id: true, name: true } } },
  });
}

// Listado paginado de la tabla admin: el recorte, orden y página los hace Postgres (antes se filtraba en memoria sobre todo el listado).

export const ADMIN_POSTS_PAGE_SIZE = 25;

// Conjunto cerrado de órdenes: dejar que la URL nombre una columna arbitraria es dejar que nombre una columna de la base.
export const ADMIN_POSTS_SORTS = {
  reciente: { label: "Más recientes", orderBy: { createdAt: "desc" } },
  antiguo: { label: "Más antiguos", orderBy: { createdAt: "asc" } },
  editado: { label: "Editados hace poco", orderBy: { updatedAt: "desc" } },
  titulo: { label: "Título A–Z", orderBy: { title: "asc" } },
  "titulo-desc": { label: "Título Z–A", orderBy: { title: "desc" } },
} as const satisfies Record<string, { label: string; orderBy: Prisma.PostOrderByWithRelationInput }>;

export type AdminPostsSort = keyof typeof ADMIN_POSTS_SORTS;

export function isAdminPostsSort(value: string | undefined): value is AdminPostsSort {
  return value !== undefined && value in ADMIN_POSTS_SORTS;
}

// Cuatro pestañas (no tres) porque "Programado" no es un valor del enum, ver displayStatus(). Se define acá para que conteo y recorte compartan fuente.
export const ADMIN_POSTS_FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "borrador", label: "Borradores" },
  { key: "publicado", label: "Publicados" },
  { key: "programado", label: "Programados" },
  { key: "oculto", label: "Ocultos" },
] as const;

export type AdminPostsFilter = (typeof ADMIN_POSTS_FILTERS)[number]["key"];

export function isAdminPostsFilter(value: string | undefined): value is AdminPostsFilter {
  return ADMIN_POSTS_FILTERS.some((filter) => filter.key === value);
}

function filterWhere(filter: AdminPostsFilter, now: Date): Prisma.PostWhereInput {
  switch (filter) {
    case "borrador":
      return { status: PostStatus.DRAFT };
    case "oculto":
      return { status: PostStatus.HIDDEN };
    // "Publicado" significa VISIBLE en el blog, no incluye programados; las cuatro pestañas parten el total sin solaparse.
    case "publicado":
      return { status: PostStatus.PUBLISHED, publishedAt: { lte: now } };
    case "programado":
      return { status: PostStatus.PUBLISHED, publishedAt: { gt: now } };
    default:
      return {};
  }
}

export async function getAdminPosts({
  filter = "todos",
  categorySlug,
  term,
  sort = "reciente",
  page = 1,
}: {
  filter?: AdminPostsFilter;
  categorySlug?: string;
  term?: string;
  sort?: AdminPostsSort;
  page?: number;
}) {
  // Un solo `now` para toda la función: con new Date() por consulta, un artículo programado justo en ese milisegundo divergiría entre recorte y conteos.
  const now = new Date();
  // Recorte que NO depende del estado: los conteos de pestañas deben respetar la búsqueda/categoría actual, pero no el estado que cada pestaña representa.
  const scope: Prisma.PostWhereInput = {
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    // Busca también por slug: es lo que se ve en la URL pública y a veces lo único que se recuerda de un artículo viejo.
    ...(term
      ? {
          OR: [
            { title: { contains: term, mode: "insensitive" as const } },
            { slug: { contains: term, mode: "insensitive" as const } },
            { category: { name: { contains: term, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const where: Prisma.PostWhereInput = { ...scope, ...filterWhere(filter, now) };
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  // Conteo ANTES de traer filas, para acotar una página fuera de rango en vez de servir una lista vacía. Cuatro counts (no groupBy) porque "Programado" parte PUBLISHED según el reloj.
  const [total, draft, published, scheduled, hidden] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.count({ where: { ...scope, ...filterWhere("borrador", now) } }),
    prisma.post.count({ where: { ...scope, ...filterWhere("publicado", now) } }),
    prisma.post.count({ where: { ...scope, ...filterWhere("programado", now) } }),
    prisma.post.count({ where: { ...scope, ...filterWhere("oculto", now) } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / ADMIN_POSTS_PAGE_SIZE));
  const currentPage = Math.min(safePage, pageCount);

  const rows = await prisma.post.findMany({
    where,
    orderBy: ADMIN_POSTS_SORTS[sort].orderBy,
    skip: (currentPage - 1) * ADMIN_POSTS_PAGE_SIZE,
    take: ADMIN_POSTS_PAGE_SIZE,
    // updatedBy viaja con la fila: "editado hace 5 minutos" sin nombre no alcanza para saber a quién preguntarle.
    include: { category: true, updatedBy: { select: { name: true } } },
  });

  return {
    posts: rows,
    total,
    page: currentPage,
    pageCount,
    now,
    counts: {
      todos: draft + published + scheduled + hidden,
      borrador: draft,
      publicado: published,
      programado: scheduled,
      oculto: hidden,
    } satisfies Record<AdminPostsFilter, number>,
  };
}

// El blog público: antes era un take:60 sin paginación real, el artículo 61 desaparecía aunque el sitemap lo siguiera declarando.

export const PUBLIC_POSTS_PAGE_SIZE = 12;

/** El recorte que define "visible en el blog", en un solo lugar. */
function publicWhere(locale: Locale, categorySlug?: string, now = new Date()): Prisma.PostWhereInput {
  return {
    locale: locale as PostLocale,
    status: PostStatus.PUBLISHED,
    publishedAt: { lte: now },
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };
}

export async function getPublishedPosts(
  locale: Locale,
  categorySlug?: string,
  page = 1,
) {
  const now = new Date();
  const where = publicWhere(locale, categorySlug, now);
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  // Mismo orden que en el admin: contar primero para acotar la página pedida a una que existe.
  const total = await prisma.post.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PUBLIC_POSTS_PAGE_SIZE));
  const currentPage = Math.min(safePage, pageCount);

  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip: (currentPage - 1) * PUBLIC_POSTS_PAGE_SIZE,
    take: PUBLIC_POSTS_PAGE_SIZE,
    include: { category: true },
  });

  return { posts, total, page: currentPage, pageCount };
}

/** Todos los publicados, sin recorte — lo usan el sitemap y el feed RSS, que declaran el conjunto entero. */
export async function getAllPublishedPosts(locale: Locale) {
  return prisma.post.findMany({
    where: publicWhere(locale),
    orderBy: { publishedAt: "desc" },
    include: { category: true, author: { select: { name: true } } },
  });
}

/** Artículos para seguir leyendo: primero de la misma categoría, completa con los más recientes si no alcanzan. */
export async function getRelatedPosts(
  post: { id: number; locale: PostLocale; categoryId: number },
  take = 3,
) {
  const now = new Date();
  const base: Prisma.PostWhereInput = {
    locale: post.locale,
    status: PostStatus.PUBLISHED,
    publishedAt: { lte: now },
    id: { not: post.id },
  };

  const sameCategory = await prisma.post.findMany({
    where: { ...base, categoryId: post.categoryId },
    orderBy: { publishedAt: "desc" },
    take,
    include: { category: true },
  });

  if (sameCategory.length >= take) return sameCategory;

  const seen = sameCategory.map((related) => related.id);
  const filler = await prisma.post.findMany({
    where: { ...base, id: { notIn: [post.id, ...seen] } },
    orderBy: { publishedAt: "desc" },
    take: take - sameCategory.length,
    include: { category: true },
  });

  return [...sameCategory, ...filler];
}

// Solo categorías con al menos un artículo publicado: un filtro que lleva a una lista vacía es peor que no ofrecerlo.
export async function getPublishedCategories(locale: Locale) {
  return prisma.category.findMany({
    where: {
      posts: {
        some: {
          locale: locale as PostLocale,
          status: PostStatus.PUBLISHED,
          publishedAt: { lte: new Date() },
        },
      },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, nameEn: true, slug: true },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      updatedBy: { select: { id: true, name: true } },
    },
  });
}

/** Para la pantalla de edición del admin — misma forma que getPostBySlug. */
export async function getPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      updatedBy: { select: { id: true, name: true } },
    },
  });
}

export async function createPost(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  const parsed = postFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = resolveSlug(formData, parsed.data.title);
  if (!slug) {
    return { error: "Ese título no genera un slug válido — usa al menos una letra o número." };
  }

  const authorId = await getCurrentAdminId();
  const status = parsed.data.intent === "publish" ? PostStatus.PUBLISHED : PostStatus.DRAFT;

  // Fecha elegida en el editor, o ahora si no se eligió ninguna; un borrador no lleva fecha hasta la primera publicación.
  const publishedAt =
    status === PostStatus.PUBLISHED ? (parsed.data.publishedAt ?? new Date()) : null;

  try {
    const created = await prisma.post.create({
      data: {
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        coverImageUrl: parsed.data.coverImageUrl,
        coverImageAlt: parsed.data.coverImageAlt,
        categoryId: parsed.data.categoryId,
        locale: parsed.data.locale as PostLocale,
        seoTitle: emptyToUndefined(parsed.data.seoTitle ?? ""),
        seoDescription: emptyToUndefined(parsed.data.seoDescription ?? ""),
        slug,
        status,
        publishedAt,
        authorId,
        updatedById: authorId,
      },
    });
    revalidatePost(slug);
    return { error: null, id: created.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: `Ya existe un artículo con el slug "${slug}".` };
    }
    if (isForeignKeyConstraintError(error)) {
      return { error: "La categoría seleccionada no existe." };
    }
    throw error;
  }
}

export async function updatePost(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  const adminId = await getCurrentAdminId();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "Artículo inválido." };
  }

  const parsed = postFieldsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = resolveSlug(formData, parsed.data.title);
  if (!slug) {
    return { error: "Ese título no genera un slug válido — usa al menos una letra o número." };
  }

  const existing = await prisma.post.findUnique({
    where: { id },
    select: { publishedAt: true, updatedAt: true, slug: true, content: true, coverImageUrl: true },
  });
  if (!existing) {
    return { error: "Artículo inválido." };
  }

  // Control de concurrencia: compara el updatedAt reenviado por el formulario; si no coincide, alguien guardó en el medio y se rechaza sin fusionar. Opcional para no romper llamadores viejos.
  const guard = formData.get("expectedUpdatedAt");
  if (typeof guard === "string" && guard.length > 0) {
    if (new Date(guard).getTime() !== existing.updatedAt.getTime()) {
      return {
        error:
          "Alguien más guardó este artículo mientras lo editabas. Abre una copia en otra pestaña para no perder lo tuyo, recarga esta, y vuelve a aplicar tus cambios.",
      };
    }
  }

  const status = parsed.data.intent === "publish" ? PostStatus.PUBLISHED : PostStatus.DRAFT;

  // Prioridad de publishedAt: fecha explícita del editor > primera publicación (ahora) > fecha existente sin tocar (ocultar/republicar no la mueve).
  const publishedAt =
    status === PostStatus.PUBLISHED
      ? (parsed.data.publishedAt ?? existing.publishedAt ?? new Date())
      : undefined;

  try {
    await prisma.post.update({
      where: { id },
      data: {
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        coverImageUrl: parsed.data.coverImageUrl,
        coverImageAlt: parsed.data.coverImageAlt,
        categoryId: parsed.data.categoryId,
        locale: parsed.data.locale as PostLocale,
        seoTitle: emptyToUndefined(parsed.data.seoTitle ?? ""),
        seoDescription: emptyToUndefined(parsed.data.seoDescription ?? ""),
        slug,
        status,
        updatedById: adminId,
        ...(publishedAt ? { publishedAt } : {}),
      },
    });

    // Va DESPUÉS del update: si la escritura falla, los archivos huérfanos tienen que seguir ahí.
    await collectOrphans(existing, parsed.data.content, parsed.data.coverImageUrl);

    if (existing.slug !== slug) revalidatePost(existing.slug);
    revalidatePost(slug);
    return { error: null, id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: `Ya existe un artículo con el slug "${slug}".` };
    }
    if (isForeignKeyConstraintError(error)) {
      return { error: "La categoría seleccionada no existe." };
    }
    throw error;
  }
}

// Compara imágenes ANTES vs AHORA para borrar huérfanas; si el contenido viejo no valida contra el schema actual, no se borra nada (mejor un archivo de más que una imagen rota).
async function collectOrphans(
  before: { content: unknown; coverImageUrl: string },
  afterBlocks: readonly Block[],
  afterCover: string,
): Promise<void> {
  const previousBlocks = blockArraySchema.safeParse(before.content);

  const previous = new Set<string>(previousBlocks.success ? collectImageUrls(previousBlocks.data) : []);
  if (before.coverImageUrl) previous.add(before.coverImageUrl);

  const current = new Set<string>(collectImageUrls(afterBlocks));
  if (afterCover) current.add(afterCover);

  await deleteUploads(orphanedUrls(previous, current));
}

// Ficha del artículo, separada de postFieldsSchema: ese exige content/coverImageUrl como obligatorios, lo que forzaría reenviar bloques y portada solo para corregir el título.
const postMetaSchema = postFieldsSchema.pick({
  title: true,
  excerpt: true,
  categoryId: true,
  locale: true,
  seoTitle: true,
  seoDescription: true,
});

/** Edición rápida de la ficha desde la tabla, sin abrir el editor de bloques. */
export async function updatePostMeta(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  const adminId = await getCurrentAdminId();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "Artículo inválido." };
  }

  const parsed = postMetaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = resolveSlug(formData, parsed.data.title);
  if (!slug) {
    return { error: "Ese título no genera un slug válido — usa al menos una letra o número." };
  }

  // El slug ANTERIOR también se invalida: si se renombra la URL, la página vieja quedaría cacheada como si siguiera existiendo.
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, updatedAt: true },
  });
  if (!existing) {
    return { error: "Artículo inválido." };
  }

  // Misma guarda de concurrencia que el editor: el riesgo es menor pero pisar el título/categoría de otro sigue siendo pisar trabajo ajeno en silencio.
  const guard = formData.get("expectedUpdatedAt");
  if (typeof guard === "string" && guard.length > 0) {
    if (new Date(guard).getTime() !== existing.updatedAt.getTime()) {
      return {
        error: "Alguien más editó este artículo mientras tenías el cajón abierto. Recarga la tabla y vuelve a intentarlo.",
      };
    }
  }

  try {
    await prisma.post.update({
      where: { id },
      data: {
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        categoryId: parsed.data.categoryId,
        locale: parsed.data.locale as PostLocale,
        seoTitle: emptyToUndefined(parsed.data.seoTitle ?? ""),
        seoDescription: emptyToUndefined(parsed.data.seoDescription ?? ""),
        slug,
        updatedById: adminId,
      },
    });
    if (existing.slug !== slug) revalidatePost(existing.slug);
    revalidatePost(slug);
    return { error: null, id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: `Ya existe un artículo con el slug "${slug}".` };
    }
    if (isForeignKeyConstraintError(error)) {
      return { error: "La categoría seleccionada no existe." };
    }
    throw error;
  }
}

/** Alta desde el cajón de ficha: crea el artículo en DRAFT sin bloques/portada — postFieldsSchema sigue exigiéndolos para publicar desde el editor. */
export async function createPostMeta(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  const parsed = postMetaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = resolveSlug(formData, parsed.data.title);
  if (!slug) {
    return { error: "Ese título no genera un slug válido — usa al menos una letra o número." };
  }

  const authorId = await getCurrentAdminId();

  try {
    const created = await prisma.post.create({
      data: {
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        categoryId: parsed.data.categoryId,
        locale: parsed.data.locale as PostLocale,
        seoTitle: emptyToUndefined(parsed.data.seoTitle ?? ""),
        seoDescription: emptyToUndefined(parsed.data.seoDescription ?? ""),
        slug,
        // Arranca sin bloques de muestra: uno puesto por el sistema habría que borrarlo antes de escribir.
        content: [],
        coverImageUrl: "",
        coverImageAlt: "",
        status: PostStatus.DRAFT,
        publishedAt: null,
        authorId,
        updatedById: authorId,
      },
    });
    revalidatePost(slug);
    return { error: null, id: created.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: `Ya existe un artículo con el slug "${slug}".` };
    }
    if (isForeignKeyConstraintError(error)) {
      return { error: "La categoría seleccionada no existe." };
    }
    throw error;
  }
}

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]);

/** Cambia el estado sin borrar el registro; la primera vez que pasa a PUBLISHED fija publishedAt y después no se vuelve a mover. */
export async function setPostStatus(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  const adminId = await getCurrentAdminId();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "Artículo inválido." };
  }

  const parsedStatus = statusSchema.safeParse(formData.get("status"));
  if (!parsedStatus.success) {
    return { error: "Estado inválido." };
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: { publishedAt: true, slug: true },
  });
  if (!post) {
    return { error: "Artículo inválido." };
  }

  const status = PostStatus[parsedStatus.data];
  const publishedAt = status === PostStatus.PUBLISHED && !post.publishedAt ? new Date() : undefined;

  await prisma.post.update({
    where: { id },
    data: { status, updatedById: adminId, ...(publishedAt ? { publishedAt } : {}) },
  });

  revalidatePost(post.slug);
  return { error: null };
}

/** Cambia el estado de varios artículos en una transacción y una sola revalidación (no un bucle de setPostStatus por cliente). */
export async function setPostsStatus(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  const adminId = await getCurrentAdminId();

  const ids = formData
    .getAll("id")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));

  if (ids.length === 0) {
    return { error: "No hay artículos seleccionados." };
  }

  const parsedStatus = statusSchema.safeParse(formData.get("status"));
  if (!parsedStatus.success) {
    return { error: "Estado inválido." };
  }

  const status = PostStatus[parsedStatus.data];

  const posts = await prisma.post.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true, publishedAt: true },
  });

  if (posts.length === 0) {
    return { error: "No se encontró ninguno de los artículos seleccionados." };
  }

  const now = new Date();

  // Transacción: o cambian todos o ninguno; un bucle suelto dejaría un fallo a la mitad sin forma de saber qué se aplicó.
  await prisma.$transaction(
    posts.map((post) =>
      prisma.post.update({
        where: { id: post.id },
        data: {
          status,
          updatedById: adminId,
          ...(status === PostStatus.PUBLISHED && !post.publishedAt
            ? { publishedAt: now }
            : {}),
        },
      }),
    ),
  );

  // La página propia de cada artículo se revalida aparte: sus URLs son distintas.
  revalidatePost();
  for (const post of posts) {
    revalidatePath(`/[lang]/blog/${post.slug}`, "page");
  }

  return { error: null };
}

export async function deletePost(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  await getCurrentAdminId();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "Artículo inválido." };
  }

  // Slug e imágenes se leen ANTES de borrar: después ya no hay registro del que sacarlos.
  const post = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, content: true, coverImageUrl: true },
  });
  if (!post) {
    return { error: "Artículo inválido." };
  }

  await prisma.post.delete({ where: { id } });

  // Todas las imágenes quedan huérfanas al borrar; va DESPUÉS del delete para que un fallo de la base deje los archivos donde estaban.
  await collectOrphans(post, [], "");

  revalidatePost(post.slug);
  return { error: null };
}
