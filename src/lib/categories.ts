import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

/* TODO(auth): las tres mutaciones de abajo todavía no verifican sesión —
   Auth.js es la Fase 2 del plan y esta es la Fase 3 adelantada a pedido. Una
   vez conectadas a un formulario, cada una es un endpoint público: hay que
   agregar el guard de sesión aquí dentro antes de exponer /admin. */

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

/** Lectura simple — la llama directo cualquier Server Component, sin pasar por Server Action. */
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  "use server";

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

  return { error: null };
}

export async function renameCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  "use server";

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

  return { error: null };
}

export async function deleteCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  "use server";

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

  return { error: null };
}
