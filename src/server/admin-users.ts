"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { withOtpPurpose } from "@/lib/emails/otp-context";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fields?: Record<string, string> };

const createUserSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.email("Escribe un correo válido.").trim().toLowerCase(),
});

/* El usuario nunca ve esta contraseña: existe solo para que la cuenta sea
   válida hasta que él defina la suya con el código de seis dígitos. */
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
    return { ok: false, message: "Revisa los campos marcados.", fields: fieldErrors(parsed.error) };
  }
  const { name, email } = parsed.data;

  try {
    /* Con headers, el endpoint exige sesión de admin; es la comprobación real,
       requireAdmin() de arriba solo evita llegar hasta aquí sin nada. */
    await auth.api.createUser({
      headers: await headers(),
      body: { name, email, password: throwawayPassword(), role: "admin" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el usuario.";
    return { ok: false, message, fields: { email: message } };
  }

  const sent = await sendWelcomeCode(email);
  if (!sent.ok) {
    return {
      ok: false,
      message: "La cuenta se creó, pero no salió el correo de bienvenida. Reenvíalo desde la lista.",
    };
  }
  return { ok: true };
}

/* Sin sesión reenviada: es una acción del servidor ya autorizada arriba y no
   debe consumir el rate limit por IP del formulario público de recuperación. */
async function sendWelcomeCode(email: string): Promise<ActionResult> {
  try {
    await withOtpPurpose("welcome", () =>
      auth.api.sendVerificationOTP({ body: { email, type: "forget-password" } }),
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo enviar el correo.",
    };
  }
}

export async function resendWelcomeEmail(email: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.email().safeParse(email.trim().toLowerCase());
  if (!parsed.success) return { ok: false, message: "Correo inválido." };
  return sendWelcomeCode(parsed.data);
}

export async function listAdminUsers() {
  await requireAdmin();
  return auth.api.listUsers({
    headers: await headers(),
    query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
  });
}

export async function removeAdminUser(userId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  /* Quedarse sin ningún admin dejaría el panel inaccesible para siempre. */
  if (session.user.id === userId) {
    return { ok: false, message: "No puedes eliminar tu propia cuenta." };
  }
  try {
    await auth.api.removeUser({ headers: await headers(), body: { userId } });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo eliminar el usuario.",
    };
  }
}

export async function setUserBanned(userId: string, banned: boolean): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.id === userId) {
    return { ok: false, message: "No puedes bloquear tu propia cuenta." };
  }
  try {
    const requestHeaders = await headers();
    if (banned) {
      await auth.api.banUser({ headers: requestHeaders, body: { userId, banReason: "Bloqueado desde el panel" } });
    } else {
      await auth.api.unbanUser({ headers: requestHeaders, body: { userId } });
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo actualizar el usuario.",
    };
  }
}
