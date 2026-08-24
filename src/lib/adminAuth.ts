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

/* La IP del cliente.
   ---------------------------------------------------------------------------

   `x-forwarded-for` es una cadena de proxies: el primer valor es el cliente y
   los siguientes son los saltos. Se toma el PRIMERO.

   Ese encabezado lo puede falsificar cualquiera si la aplicación queda expuesta
   directamente a internet — pero acá siempre hay un proxy delante (Vercel) que
   lo reescribe con la IP real de la conexión, así que el valor es confiable.
   Si algún día esto se sirve sin ese proxy, este freno deja de valer y hay que
   volver acá.

   Sin encabezado —desarrollo local— se usa una clave fija. Falla CERRADO a
   propósito: en local todos comparten contador, que como mucho molesta a quien
   está probando. Devolver "sin IP, pasá" sería un agujero que se activa solo si
   alguien logra que el encabezado no llegue. */
async function clientIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return store.get("x-real-ip")?.trim() || "desconocida";
}

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

  /* El freno va ANTES de verificar la contraseña, no después.
     -------------------------------------------------------------------------
     Comprobarlo después dejaría a cada intento bloqueado pagando igual el
     bcrypt de `verifyAdminPassword`, que es deliberadamente lento (ese es el
     punto de bcrypt). O sea que el propio freno se convertiría en la forma más
     barata de tumbar el servidor: mil peticiones por segundo, mil hashes, y no
     hace falta acertar ninguna contraseña. */
  const keys = loginKeys(await clientIp(), echo);

  const gate = await checkLoginAllowed(keys);
  if (!gate.allowed) {
    return { error: blockedMessage(gate.retryAfterSeconds), email: echo };
  }

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
      /* El fallo se anota y, si con éste se llegó al umbral, el mensaje ya
         avisa de la espera en vez de dejar que la persona descubra el bloqueo
         recién en el intento siguiente. */
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

  /* Entrar bien borra la racha: alguien que se equivocó cuatro veces y acertó a
     la quinta no arrastra el contador a su próxima sesión. */
  await clearLoginFailures(keys);

  return { error: null, ok: true };
}

export async function logoutAdmin() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}
