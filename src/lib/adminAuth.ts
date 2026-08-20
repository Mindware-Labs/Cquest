import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";

export type LoginActionState = { error: string | null };

/** La sesión del panel, o un desvío al login. Toda pantalla de /admin salvo el
 *  propio login pasa por acá (AD-2). */
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
    return { error: "Completá email y contraseña." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (error) {
    /* Un login correcto también sale por acá: signIn lanza el redirect de Next
       cuando funciona. Solo AuthError es una credencial mala — cualquier otra
       cosa se relanza o se comería el redirect y el usuario quedaría trabado
       en el formulario después de haber entrado bien. */
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }

  return { error: null };
}

export async function logoutAdmin() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}
