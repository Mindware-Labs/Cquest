import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { getCurrentAdminId } from "@/lib/auth";

export type CategoryActionState = { error: string | null };

const nameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(60, "El nombre no puede superar 60 caracteres.");

function resolveSlug(name: string): string | null {
  const slug = slugify(name);
  return slug.length > 0 ? slug : null;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function isForeignKeyConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2003" || error.code === "P2014")
  );
}

/* Sin esto la pantalla sigue mostrando la lista cacheada y el admin cree que
   su cambio no se guardó. El blog público también depende del nombre de la
   categoría, así que se invalida junto. */
function revalidateCategories(): void {
  revalidatePath("/admin/categories");
  revalidatePath("/[lang]/blog", "page");
}

/** Lectura simple — la llama directo cualquier Server Component, sin pasar por Server Action. */
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

/** Una sola categoría por su identificador de URL.
 *
 *  Existe para que la tabla de artículos pueda nombrar la categoría por la que
 *  está filtrando. Antes lo sacaba del propio listado, pero con paginación el
 *  slug filtrado puede no estar en la página que se ve, y la etiqueta terminaba
 *  mostrando el slug crudo en vez del nombre. */
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug }, select: { name: true } });
}

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  "use server";

  await getCurrentAdminId();

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const name = parsed.data;
  const slug = resolveSlug(name);
  if (!slug) {
    return { error: "Ese nombre no genera un slug válido — usa al menos una letra o número." };
  }

  try {
    await prisma.category.create({ data: { name, slug } });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: `Ya existe una categoría con el slug "${slug}".` };
    }
    throw error;
  }

  revalidateCategories();
  return { error: null };
}

export async function renameCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  "use server";

  await getCurrentAdminId();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "Categoría inválida." };
  }

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const name = parsed.data;
  const slug = resolveSlug(name);
  if (!slug) {
    return { error: "Ese nombre no genera un slug válido — usa al menos una letra o número." };
  }

  try {
    await prisma.category.update({ where: { id }, data: { name, slug } });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: `Ya existe una categoría con el slug "${slug}".` };
    }
    throw error;
  }

  revalidateCategories();
  return { error: null };
}

export async function deleteCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  "use server";

  await getCurrentAdminId();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "Categoría inválida." };
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return { error: "No se puede eliminar: tiene artículos asociados." };
    }
    throw error;
  }

  revalidateCategories();
  return { error: null };
}
