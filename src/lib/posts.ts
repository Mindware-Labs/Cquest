import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma, PostStatus, PostLocale } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { locales, type Locale } from "@/i18n/config";
import { slugify } from "@/lib/slug";
import { getCurrentAdminId } from "@/lib/auth";
import { blockArraySchema } from "@/lib/blocks";

export type PostActionState = { error: string | null; id?: number };

/* El editor manda el arreglo de bloques serializado en un input oculto —
   se parsea como JSON y se valida con el mismo schema que usan el renderer
   público y el editor, así los tres nunca pueden divergir. */
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

const postFieldsSchema = z.object({
  title: z.string().trim().min(4, "El título debe tener al menos 4 caracteres.").max(120, "Máximo 120 caracteres."),
  excerpt: z.string().trim().min(10, "El extracto debe tener al menos 10 caracteres.").max(300, "Máximo 300 caracteres."),
  content: contentSchema,
  /* Siempre sale de uploadCoverImage() (src/lib/blob.ts): una ruta relativa
     a /api/images/..., no una URL absoluta — así no queda atada a un dominio
     fijo entre local, preview y producción. */
  coverImageUrl: z
    .string()
    .trim()
    .min(1, "Falta la portada.")
    .startsWith("/api/images/", "La portada debe salir de la subida a Vercel Blob."),
  coverImageAlt: z.string().trim().min(1, "Falta el texto alternativo de la portada.").max(200, "Máximo 200 caracteres."),
  categoryId: z.coerce.number().int("Categoría inválida."),
  /* Un artículo vive en un idioma, no es la traducción de otro: el listado
     público filtra por acá. Sale del mismo `locales` que el resto del sitio
     para que agregar un idioma sea un solo cambio. */
  locale: z.enum(locales).default("es"),
  seoTitle: z.string().trim().max(70, "Máximo 70 caracteres.").optional().or(z.literal("")),
  seoDescription: z.string().trim().max(160, "Máximo 160 caracteres.").optional().or(z.literal("")),
  /* Los dos botones del editor ("Guardar borrador" / "Publicar") mandan esto
     directo — así publicar es un solo submit, sin una segunda llamada a
     setPostStatus. */
  intent: z.enum(["draft", "publish"]),
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

/* Un artículo toca cuatro superficies cacheadas: la tabla del admin, el
   listado público, su propia página y el sitemap. Publicar sin invalidarlas
   deja el artículo "publicado" en la base pero invisible en el sitio. */
function revalidatePost(slug?: string): void {
  revalidatePath("/admin/posts");
  revalidatePath("/[lang]/blog", "page");
  if (slug) revalidatePath(`/[lang]/blog/${slug}`, "page");
  revalidatePath("/sitemap.xml");
}

/** Listado completo para el panel admin — todos los estados. */
export async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, author: { select: { id: true, name: true } } },
  });
}

/** Lo que ve el blog público: del idioma pedido, publicado, y ya en su fecha.
 *  El límite no es paginación — es el techo que evita que /blog crezca sin
 *  control cuando haya 200 artículos. La paginación real llega si hace falta. */
export const PUBLIC_POSTS_LIMIT = 60;

export async function getPublishedPosts(locale: Locale, categorySlug?: string) {
  return prisma.post.findMany({
    where: {
      locale: locale as PostLocale,
      status: PostStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: PUBLIC_POSTS_LIMIT,
    include: { category: true },
  });
}

/* Solo las categorías que tienen al menos un artículo publicado en este idioma.
   Ofrecer un filtro que lleva a una lista vacía es peor que no ofrecerlo. */
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
    select: { id: true, name: true, slug: true },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { category: true, author: { select: { id: true, name: true } } },
  });
}

/** Para la pantalla de edición del admin — misma forma que getPostBySlug. */
export async function getPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },
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
  const status = parsed.data.intent === "publish" ? PostStatus.PUBLISHED : PostStatus.DRAFT;

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
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
        authorId,
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

  const existing = await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!existing) {
    return { error: "Artículo inválido." };
  }

  const status = parsed.data.intent === "publish" ? PostStatus.PUBLISHED : PostStatus.DRAFT;
  /* Igual que setPostStatus: solo fija publishedAt la primera vez que pasa a
     PUBLISHED. Guardar como borrador después de haber estado publicado no
     lo borra — solo cambia el estado. */
  const publishedAt = status === PostStatus.PUBLISHED && !existing.publishedAt ? new Date() : undefined;

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
        ...(publishedAt ? { publishedAt } : {}),
      },
    });
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
    data: { status, ...(publishedAt ? { publishedAt } : {}) },
  });

  revalidatePost(post.slug);
  return { error: null };
}

/** Cambia el estado de VARIOS artículos de una vez.
 *
 *  No es azúcar sobre setPostStatus en un bucle del cliente: publicar diez
 *  borradores así eran diez viajes al servidor, diez revalidaciones de las
 *  mismas rutas, y un estado a medio aplicar si el tercero fallaba. Acá es una
 *  transacción y una sola revalidación al final.
 *
 *  La fecha de publicación se resuelve por artículo y no en bloque: sólo se
 *  fija en los que nunca se publicaron, igual que en la versión de a uno.
 *  Ocultar y republicar no vuelve a mover esa fecha. */
export async function setPostsStatus(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  "use server";

  await getCurrentAdminId();

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

  /* Una transacción: o cambian todos o no cambia ninguno. Con un bucle suelto,
     un fallo a la mitad deja una selección aplicada por partes y sin forma de
     saber cuál sí y cuál no. */
  await prisma.$transaction(
    posts.map((post) =>
      prisma.post.update({
        where: { id: post.id },
        data: {
          status,
          ...(status === PostStatus.PUBLISHED && !post.publishedAt
            ? { publishedAt: now }
            : {}),
        },
      }),
    ),
  );

  /* Una revalidación del listado y del blog, más la página propia de cada
     artículo tocado: sus URLs son distintas, así que esas sí van una por una. */
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

  /* El slug se lee ANTES de borrar: después ya no hay registro del que sacarlo,
     y la página pública de ese artículo se quedaría cacheada sin nadie que la
     invalide. */
  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
  if (!post) {
    return { error: "Artículo inválido." };
  }

  await prisma.post.delete({ where: { id } });

  revalidatePost(post.slug);
  return { error: null };
}
