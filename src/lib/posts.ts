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

/* Se reexporta para que las pantallas del admin no tengan que saber que la
   conversión vive en otro módulo — es parte de la misma superficie. */
export { toEditorDateTime } from "@/lib/postDates";

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

/* `<input type="datetime-local">` manda "2026-09-01T08:30" — sin segundos y sin
   zona. La conversión vive en lib/postDates.ts (funciones puras, con pruebas).

   Vacío significa "ahora" y se resuelve en cada acción, no acá: el valor
   depende de si el artículo ya tenía fecha. */
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
  /* Fecha de publicación elegida en el editor, como la manda un
     `<input type="datetime-local">`: "2026-09-01T08:30", sin zona.

     Con una fecha futura el artículo queda PROGRAMADO — el estado sigue siendo
     PUBLISHED y lo que lo mantiene invisible es la condición `publishedAt <=
     ahora` que el listado público y la página del artículo ya aplicaban. Esa
     condición existía desde el principio pero era letra muerta: las acciones
     siempre escribían `new Date()`, así que nunca había una fecha futura que
     filtrar. Acá es donde deja de serlo. */
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

/* Un artículo toca varias superficies cacheadas: la tabla del admin, el listado
   público, su propia página y el feed. Publicar sin invalidarlas deja el
   artículo "publicado" en la base pero invisible en el sitio.

   El sitemap NO está en la lista, y no es un olvido: su route es
   `force-dynamic` con `revalidate = 3600`, o sea que no hay entrada cacheada
   que invalidar. La llamada que había ahí no hacía nada y daba la falsa
   seguridad de que sí. */
function revalidatePost(slug?: string): void {
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
  revalidatePath("/[lang]/blog", "page");
  if (slug) revalidatePath(`/[lang]/blog/${slug}`, "page");
  revalidatePath("/[lang]/blog/rss.xml", "page");
}

/* ---------------------------------------------------------------------------
   Estado visible
   ---------------------------------------------------------------------------

   En la base hay tres estados; en pantalla hay cuatro. Un artículo PUBLISHED
   con fecha futura está PROGRAMADO: no se ve en el blog, pero decir "Publicado"
   en la tabla del admin sería mentir sobre lo único que esa columna promete.

   Se DERIVA en vez de guardarse como un cuarto valor del enum: un estado
   guardado que depende del reloj hay que ir a corregirlo cuando el reloj pasa,
   y ese es exactamente el trabajo de fondo que nadie recuerda escribir.
--------------------------------------------------------------------------- */

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

/** Listado completo para el panel admin — todos los estados.
 *
 *  Se mantiene para quien necesite el conjunto entero (hoy, el tablero). La
 *  TABLA de artículos ya no lo usa: ver getAdminPosts. */
export async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, author: { select: { id: true, name: true } } },
  });
}

/* ---------------------------------------------------------------------------
   Listado paginado de la tabla del admin
   ---------------------------------------------------------------------------

   Antes la tabla llamaba a getPosts() y filtraba en memoria. Con veinte
   artículos daba igual; con quinientos son quinientas filas montadas de una,
   cada una un componente de cliente con su propio useActionState y su <Image>,
   sobre quinientas filas traídas de la base para mostrar veinticinco.

   Acá el recorte, el orden y la página los hace Postgres. Los tres controles
   —estado, búsqueda, categoría— viven en la URL igual que antes, así que una
   pestaña con "borradores de onboarding, página 2" se sigue pudiendo compartir
   y sigue funcionando con el botón de atrás.
--------------------------------------------------------------------------- */

export const ADMIN_POSTS_PAGE_SIZE = 25;

/* El orden es un conjunto cerrado y no un par campo+dirección libre: dejar que
   la URL nombre una columna arbitraria es dejar que la URL nombre una columna
   de la base. */
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

/* Las cuatro pestañas de la tabla. Son cuatro y no tres porque "Programado" no
   es un valor del enum sino PUBLISHED con fecha futura — ver displayStatus().
   Se define acá y no en la página para que el conteo y el recorte salgan de la
   MISMA fuente: eran dos listas paralelas esperando a divergir. */
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
    /* Publicado significa VISIBLE en el blog. Antes "Publicados" habría contado
       también los programados, y la pestaña habría prometido un conjunto que el
       público no ve. Las cuatro pestañas parten el total sin solaparse. */
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
  /* Un solo `now` para toda la función. Con `new Date()` en cada consulta, el
     recorte de la página y los conteos de las pestañas se evalúan con relojes
     distintos, y un artículo programado justo en ese milisegundo aparecería en
     una y no en la otra. */
  const now = new Date();
  /* El recorte que NO depende del estado. Se separa porque los conteos de las
     pestañas tienen que contar dentro de la búsqueda y la categoría actuales
     —si dijeran el total, "Borradores 12" al lado de una lista de 2 sería una
     contradicción en la misma fila— pero obviamente no dentro del estado que
     esa misma pestaña representa. */
  const scope: Prisma.PostWhereInput = {
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    /* Se busca sobre título, identificador de URL y nombre de categoría. El
       slug entra porque es lo que se ve en la URL pública y a veces es lo único
       que se recuerda de un artículo viejo. */
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

  /* El conteo va ANTES de traer las filas, no en paralelo: con `?pagina=99`
     sobre tres páginas, un `skip` calculado con la página cruda devuelve vacío,
     y la vista termina dibujando una paginación que dice "página 3 de 3" arriba
     de una lista sin nada. Cuesta un viaje más y a cambio la página pedida
     siempre se puede acotar a una que existe.

     Los conteos de las pestañas ya no salen de un groupBy por estado: con
     "Programado" partiendo PUBLISHED en dos según el reloj, el agrupado por
     columna no puede expresarlo. Son cuatro `count` con el mismo recorte de
     búsqueda y categoría, que Postgres resuelve sobre el índice. */
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
    /* `updatedBy` viaja con la fila: la tabla dice "editado hace 5 minutos" y
       sin un nombre al lado eso no alcanza para saber a quién preguntarle. */
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

/* ---------------------------------------------------------------------------
   El blog público
   ---------------------------------------------------------------------------

   Antes esto era un `take: 60` y nada más — un techo, no paginación. El
   artículo número 61 simplemente desaparecía del sitio mientras el sitemap
   seguía declarándolo, así que Google encontraba una página a la que ninguna
   ruta del propio blog llevaba. Ahora hay páginas de verdad, en la URL, y el
   sitemap y el feed siguen leyendo TODO por su cuenta.
--------------------------------------------------------------------------- */

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

  /* Mismo orden que en el admin: contar primero para poder acotar la página
     pedida a una que existe, en vez de servir una lista vacía bajo un
     "página 4 de 2". */
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

/** Todos los publicados, sin recorte. Lo usan el sitemap y el feed RSS, que por
 *  definición declaran el conjunto entero — paginar ahí sería esconderle a
 *  Google justo lo que el sitemap existe para mostrarle. */
export async function getAllPublishedPosts(locale: Locale) {
  return prisma.post.findMany({
    where: publicWhere(locale),
    orderBy: { publishedAt: "desc" },
    include: { category: true, author: { select: { name: true } } },
  });
}

/** Artículos para seguir leyendo al final de uno.
 *
 *  Primero los de su misma categoría, y si no alcanzan se completa con los más
 *  recientes del idioma. Un pie que dice "seguí leyendo" y muestra dos huecos
 *  porque la categoría tenía un solo artículo es peor que no ofrecer nada. */
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

  /* La fecha elegida en el editor, o ahora mismo si no se eligió ninguna. Un
     borrador no lleva fecha: se la pone la primera publicación. */
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

  /* Control de concurrencia.
     -------------------------------------------------------------------------

     El editor tenía exactamente el problema que motivó separar la ficha en su
     propio esquema: dos pestañas abiertas sobre el mismo artículo, la que
     guarda segunda pisa el trabajo de la primera sin decir una palabra. Con
     bloques de por medio eso puede ser media hora de escritura.

     El formulario reenvía el `updatedAt` que tenía cuando cargó. Si ya no
     coincide, alguien guardó en el medio y esta escritura se rechaza. No se
     intenta fusionar: fusionar dos árboles de bloques sin preguntar es una
     forma más creativa de perder trabajo. Se avisa y la persona decide.

     Es opcional a propósito: un formulario viejo, o cualquier otro llamador que
     no lo mande, sigue funcionando como antes en vez de quedar bloqueado. */
  const guard = formData.get("expectedUpdatedAt");
  if (typeof guard === "string" && guard.length > 0) {
    if (new Date(guard).getTime() !== existing.updatedAt.getTime()) {
      return {
        error:
          "Alguien más guardó este artículo mientras lo editabas. Abrí una copia en otra pestaña para no perder lo tuyo, recargá esta, y volvé a aplicar tus cambios.",
      };
    }
  }

  const status = parsed.data.intent === "publish" ? PostStatus.PUBLISHED : PostStatus.DRAFT;

  /* La fecha de publicación ahora la manda el editor y puede ser futura
     (programado). Reglas, en orden:

     - Si el editor mandó una fecha explícita, esa manda — así se corrige una
       programación o se antedata un artículo importado.
     - Si no mandó y el artículo nunca se publicó, es la primera publicación:
       ahora.
     - Si no mandó y ya tenía fecha, no se toca. Ocultar y republicar no vuelve
       a mover la fecha original, igual que en setPostStatus. */
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

    /* Las imágenes que este guardado dejó sin referencia. Va DESPUÉS del update
       y no antes: si la escritura falla, los archivos tienen que seguir ahí. */
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

/* Las imágenes del artículo ANTES contra las de AHORA: lo que salió se borra
   del store. Cubre las tres formas de dejar un archivo huérfano —cambiar la
   portada, quitar un bloque de imagen, vaciar una galería— con la misma
   comparación, en vez de una regla por caso.

   El contenido viejo se lee como Json crudo y se valida antes de recorrerlo: un
   artículo guardado con una versión anterior del schema puede no encajar, y en
   ese caso lo correcto es NO borrar nada. Un archivo de más cuesta centavos;
   uno de menos es una imagen rota en un artículo publicado. */
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

/* La FICHA del artículo: todo lo que lo identifica y lo hace encontrable, sin
   una sola línea de su contenido.

   Se separa de `postFieldsSchema` a propósito y no se reusa entero. Ese pide
   `content`, `coverImageUrl` y `coverImageAlt` como obligatorios, que es
   correcto para el editor —un artículo sin portada no se publica— pero haría
   imposible corregir una tilde del título desde la tabla sin reenviar el árbol
   de bloques y la portada en el mismo formulario. Y reenviar el contenido para
   editar el título es exactamente cómo se pierde el trabajo de otro: dos
   pestañas abiertas, la que guarda segunda pisa los bloques de la primera.

   Acá se escriben SÓLO los campos que el cajón muestra. Los bloques, la portada
   y el estado no se tocan ni se leen. */
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

  /* El slug ANTERIOR hay que invalidarlo además del nuevo: si se renombra la
     URL de un artículo publicado, la página vieja se queda cacheada y servida
     como si siguiera existiendo. */
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, updatedAt: true },
  });
  if (!existing) {
    return { error: "Artículo inválido." };
  }

  /* Misma guarda que el editor. Acá el riesgo es menor —este cajón nunca toca
     los bloques— pero pisar el título y la categoría que otro acaba de corregir
     igual es pisar trabajo ajeno en silencio. */
  const guard = formData.get("expectedUpdatedAt");
  if (typeof guard === "string" && guard.length > 0) {
    if (new Date(guard).getTime() !== existing.updatedAt.getTime()) {
      return {
        error: "Alguien más editó este artículo mientras tenías el cajón abierto. Recargá la tabla y volvé a intentarlo.",
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

/** Alta desde el cajón de ficha: crea el artículo en borrador y devuelve su id.
 *
 *  Usa el MISMO esquema que la edición rápida —los mismos seis campos, las
 *  mismas reglas— porque es el mismo formulario. Lo que no pide es lo que no se
 *  puede pedir en un cajón: los bloques, la portada y el estado. Esos tres
 *  nacen vacíos y se completan en el editor, que es donde se suben imágenes y
 *  se arma el contenido.
 *
 *  Y por eso el artículo nace DRAFT y sin fecha: `postFieldsSchema` sigue
 *  exigiendo portada y contenido para guardar desde el editor, así que un
 *  artículo creado acá no puede publicarse hasta tenerlos. La regla de "no se
 *  publica nada sin portada" no se debilita — sólo se corre el momento en que
 *  se pide. */
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
        /* El árbol de bloques arranca vacío, no con un párrafo de muestra: un
           bloque puesto por el sistema hay que borrarlo antes de escribir. */
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

/** Cambia el estado (publicar/ocultar/volver a borrador) sin borrar el registro.
 *  La primera vez que pasa a PUBLISHED fija publishedAt; ocultarlo y
 *  republicarlo después no vuelve a mover esa fecha. */
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

  /* Una transacción: o cambian todos o no cambia ninguno. Con un bucle suelto,
     un fallo a la mitad deja una selección aplicada por partes y sin forma de
     saber cuál sí y cuál no. */
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

  /* El slug y las imágenes se leen ANTES de borrar: después ya no hay registro
     del que sacarlos. Sin el slug, la página pública de ese artículo se quedaría
     cacheada sin nadie que la invalide; sin las imágenes, sus archivos quedarían
     en el store para siempre y sin forma de saber cuáles eran. */
  const post = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, content: true, coverImageUrl: true },
  });
  if (!post) {
    return { error: "Artículo inválido." };
  }

  await prisma.post.delete({ where: { id } });

  /* Borrado el artículo, TODAS sus imágenes quedaron huérfanas: el conjunto de
     después está vacío. Va después del delete para que un fallo de la base deje
     los archivos donde estaban. */
  await collectOrphans(post, [], "");

  revalidatePost(post.slug);
  return { error: null };
}
