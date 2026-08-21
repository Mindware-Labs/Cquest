import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";

/* El email vuelve en el estado a propósito: React resetea el formulario cuando
   la acción termina, así que sin este eco un intento fallido borra el email y
   obliga a reescribirlo. La contraseña NO vuelve — esa sí se reescribe. */
export type LoginActionState = { error: string | null; email?: string; ok?: boolean };

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

  const echo = email.trim();

  try {
    /* `redirect: false` a propósito. Con el redirect del servidor, un login
       correcto se lleva la página antes de que el cliente pueda decir nada, y no
       hay momento de éxito posible. La cookie de sesión se escribe igual —
       next-auth la setea antes de decidir si redirige—, así que acá se gana el
       aviso al usuario sin perder la sesión. Navegar queda del lado del cliente,
       después de la animación. */
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    /* Solo AuthError es una credencial mala. Cualquier otra cosa se relanza:
       tragarla dejaría al usuario mirando un formulario que no explica nada. */
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos.", email: echo };
    }
    throw error;
  }

  return { error: null, ok: true };
}

export async function logoutAdmin() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}
