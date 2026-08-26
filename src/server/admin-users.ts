"use server";

import { randomBytes } from "node:crypto";
import { and, asc, count, desc, ilike, ne, or } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { withOtpPurpose } from "@/lib/emails/otp-context";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fields?: Record<string, string> };

const createUserSchema = z.object({
  name: z.string().trim().min(2, "The name needs at least 2 characters."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
});

// Nunca se muestra: solo mantiene la cuenta válida hasta que él defina la suya.
function throwawayPassword(): string {
  return randomBytes(24).toString("base64url");
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !map[key]) map[key] = issue.message;
  }
  return map;
}

export async function createAdminUser(input: {
  name: string;
  email: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const { name, email } = parsed.data;

  try {
    // Con headers el endpoint exige sesión de admin: esta es la comprobación real.
    await auth.api.createUser({
      headers: await headers(),
      body: { name, email, password: throwawayPassword(), role: "admin" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the user.";
    return { ok: false, message, fields: { email: message } };
  }

  const sent = await sendWelcomeCode(email);
  if (!sent.ok) {
    return {
      ok: false,
      message: "The account was created, but the welcome email did not go out. Resend it from the list.",
    };
  }
  return { ok: true };
}

// Sin headers: ya está autorizada y no debe gastar el rate limit por IP.
async function sendWelcomeCode(email: string): Promise<ActionResult> {
  try {
    await withOtpPurpose("welcome", () =>
      auth.api.sendVerificationOTP({ body: { email, type: "forget-password" } }),
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not send the email.",
    };
  }
}

export async function resendWelcomeEmail(email: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.email().safeParse(email.trim().toLowerCase());
  if (!parsed.success) return { ok: false, message: "Invalid email address." };
  return sendWelcomeCode(parsed.data);
}

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  banned: boolean;
  createdAt: string;
};

export type AdminUserQuery = {
  page?: number;
  perPage?: number;
  sortKey?: "name" | "createdAt";
  sortDir?: "asc" | "desc";
  query?: string;
};

export type AdminUserPage = {
  rows: AdminUserRow[];
  total: number;
  page: number;
  perPage: number;
};

const PER_PAGE_ALLOWED = [10, 25, 50];

/* La cuenta de mantenimiento de Mindware Labs no sale en el listado: existe
   para sostener el panel, no para que el cliente la administre. Se oculta, no
   se borra — sigue entrando y sigue siendo dueña de los artículos que firmó. */
const HIDDEN_EMAILS = ["labsmindware@gmail.com"];

// El backslash es el escape por defecto de LIKE en Postgres.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/* La lectura va directa a la tabla en vez de a auth.api.listUsers: su búsqueda
   admite un solo campo (nombre o correo, no ambos) y el listado traía un tope
   fijo de 100 filas. Las escrituras siguen pasando por Better Auth, que es
   donde viven sus validaciones y sus hooks. */
export async function listAdminUsers(query: AdminUserQuery = {}): Promise<AdminUserPage> {
  await requireAdmin();

  const perPage = PER_PAGE_ALLOWED.includes(query.perPage ?? 0) ? query.perPage! : 10;
  const needle = query.query?.trim();
  // El filtro entra también en el conteo: si no, la paginación cuenta una fila
  // que nunca se pinta y la última página sale corta.
  const visible = and(...HIDDEN_EMAILS.map((email) => ne(user.email, email)));
  const where = needle
    ? and(
        visible,
        or(ilike(user.name, `%${escapeLike(needle)}%`), ilike(user.email, `%${escapeLike(needle)}%`)),
      )
    : visible;

  const column = query.sortKey === "name" ? user.name : user.createdAt;
  const direction = query.sortDir === "asc" ? asc : desc;

  const [{ total }] = await db.select({ total: count() }).from(user).where(where);

  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(query.page ?? 1, 1), pages);

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(where)
    // Desempate estable: sin él una fila puede repetirse entre dos páginas.
    .orderBy(direction(column), asc(user.id))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      name: row.name ?? "",
      email: row.email,
      banned: Boolean(row.banned),
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    perPage,
  };
}

export async function removeAdminUser(userId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  /* Quedarse sin ningún admin dejaría el panel inaccesible para siempre. */
  if (session.user.id === userId) {
    return { ok: false, message: "You cannot delete your own account." };
  }
  try {
    await auth.api.removeUser({ headers: await headers(), body: { userId } });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not delete the user.",
    };
  }
}

export async function setUserBanned(userId: string, banned: boolean): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.id === userId) {
    return { ok: false, message: "You cannot block your own account." };
  }
  try {
    const requestHeaders = await headers();
    if (banned) {
      await auth.api.banUser({ headers: requestHeaders, body: { userId, banReason: "Blocked from the admin panel" } });
    } else {
      await auth.api.unbanUser({ headers: requestHeaders, body: { userId } });
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not update the user.",
    };
  }
}
