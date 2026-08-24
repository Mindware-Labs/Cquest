import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import {
  blockedMessage,
  checkLoginAllowed,
  clearLoginFailures,
  loginKeys,
  registerLoginFailure,
} from "@/lib/loginRateLimit";

// x-forwarded-for es confiable porque Vercel siempre reescribe el primer valor con la IP real; sin ese proxy delante este freno deja de valer. Sin header (local) se usa una clave fija: falla cerrado a propósito, en vez de dejar pasar sin límite.
/** Exportada también para src/app/admin/reset-password/actions.ts (mismo proxy, mismo modelo de confianza). */
export async function clientIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return store.get("x-real-ip")?.trim() || "desconocida";
}

// El email vuelve en el estado a propósito (React resetea el form al terminar la acción); la contraseña no vuelve.
export type LoginActionState = { error: string | null; email?: string; ok?: boolean };

/** La sesión del panel, o un desvío al login. Toda pantalla de /admin salvo el propio login pasa por acá (AD-2). */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  return session;
}

export async function loginAdmin(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Completa email y contraseña." };
  }

  const echo = email.trim();

  // El freno va antes del bcrypt de verifyAdminPassword: si fuera después, cada intento bloqueado igual pagaría el hash lento, y el freno mismo sería la forma más barata de tumbar el servidor.
  const keys = loginKeys(await clientIp(), echo);

  const gate = await checkLoginAllowed(keys);
  if (!gate.allowed) {
    return { error: blockedMessage(gate.retryAfterSeconds), email: echo };
  }

  try {
    // redirect: false a propósito: next-auth ya setea la cookie de sesión antes de decidir el redirect, así que esto permite mostrar el aviso de éxito sin perder la sesión (la navegación queda del lado del cliente).
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    // Sólo AuthError es credencial mala; cualquier otra cosa se relanza.
    if (error instanceof AuthError) {
      const limit = await registerLoginFailure(keys);
      return {
        error: limit.allowed
          ? "Email o contraseña incorrectos."
          : blockedMessage(limit.retryAfterSeconds),
        email: echo,
      };
    }
    throw error;
  }

  // Entrar bien borra la racha de fallos previos.
  await clearLoginFailures(keys);

  return { error: null, ok: true };
}

export async function logoutAdmin() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}
