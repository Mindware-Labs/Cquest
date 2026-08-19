import { z } from "zod";
import { Prisma, PostStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { getCurrentAdminId } from "@/lib/auth";

export type PostActionState = { error: string | null };

const postFieldsSchema = z.object({
  title: z.string().trim().min(4, "El título debe tener al menos 4 caracteres.").max(120, "Máximo 120 caracteres."),
  excerpt: z.string().trim().min(10, "El extracto debe tener al menos 10 caracteres.").max(300, "Máximo 300 caracteres."),
  content: z.string().trim().min(20, "El cuerpo del artículo es muy corto."),
  /* Siempre sale de uploadCoverImage() (src/lib/blob.ts): una ruta relativa
     a /api/images/..., no una URL absoluta — así no queda atada a un dominio
     fijo entre local, preview y producción. */
  coverImageUrl: z
    .string()
    .trim()
    .min(1, "Falta la portada.")
    .startsWith("/api/images/", "La portada debe salir de la subida a Vercel Blob."),
  categoryId: z.coerce.number().int("Categoría inválida."),
  seoTitle: z.string().trim().max(70, "Máximo 70 caracteres.").optional().or(z.literal("")),
  seoDescription: z.string().trim().max(160, "Máximo 160 caracteres.").optional().or(z.literal("")),
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

/** Listado completo para el panel admin — todos los estados. */
export async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, author: { select: { id: true, name: true } } },
  });
}

/** Lo que ve el blog público: solo publicado y ya en su fecha de publicación. */
export async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { category: true, author: { select: { id: true, name: true } } },
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

  try {
    await prisma.post.create({
      data: {
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        coverImageUrl: parsed.data.coverImageUrl,
        categoryId: parsed.data.categoryId,
        seoTitle: emptyToUndefined(parsed.data.seoTitle ?? ""),
        seoDescription: emptyToUndefined(parsed.data.seoDescription ?? ""),
        slug,
        status: PostStatus.DRAFT,
        authorId,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: `Ya existe un artículo con el slug "${slug}".` };
    }
    if (isForeignKeyConstraintError(error)) {
      return { error: "La categoría seleccionada no existe." };
    }
    throw error;
  }

  return { error: null };
}

export async function updatePost(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  await getCurrentAdminId();

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

  try {
    await prisma.post.update({
      where: { id },
      data: {
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        coverImageUrl: parsed.data.coverImageUrl,
        categoryId: parsed.data.categoryId,
        seoTitle: emptyToUndefined(parsed.data.seoTitle ?? ""),
        seoDescription: emptyToUndefined(parsed.data.seoDescription ?? ""),
        slug,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: `Ya existe un artículo con el slug "${slug}".` };
    }
    if (isForeignKeyConstraintError(error)) {
      return { error: "La categoría seleccionada no existe." };
    }
    throw error;
  }

  return { error: null };
}

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]);

/** Cambia el estado (publicar/ocultar/volver a borrador) sin borrar el registro.
 *  La primera vez que pasa a PUBLISHED fija publishedAt; ocultarlo y
 *  republicarlo después no vuelve a mover esa fecha. */
export async function setPostStatus(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  await getCurrentAdminId();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "Artículo inválido." };
  }

  const parsedStatus = statusSchema.safeParse(formData.get("status"));
  if (!parsedStatus.success) {
    return { error: "Estado inválido." };
  }

  const post = await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!post) {
    return { error: "Artículo inválido." };
  }

  const status = PostStatus[parsedStatus.data];
  const publishedAt = status === PostStatus.PUBLISHED && !post.publishedAt ? new Date() : undefined;

  await prisma.post.update({
    where: { id },
    data: { status, ...(publishedAt ? { publishedAt } : {}) },
  });

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

  await prisma.post.delete({ where: { id } });
  return { error: null };
}
