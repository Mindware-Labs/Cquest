import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type Session } from "@/lib/auth";

/* cache() por petición: el layout, la página y cada server action piden la
   sesión por separado y sin esto serían tres lecturas del mismo dato. */
export const getSession = cache(async (): Promise<Session | null> => {
  return auth.api.getSession({ headers: await headers() });
});

/* El guard del layout no protege las server actions: cada una llama a esto. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.user.role !== "admin" || session.user.banned) {
    redirect("/admin/login");
  }
  return session;
}

/* Para route handlers, donde redirect() no sirve: devuelve null y el handler
   decide el código de estado. */
export async function adminSessionOrNull(): Promise<Session | null> {
  const session = await getSession();
  if (!session || session.user.role !== "admin" || session.user.banned) return null;
  return session;
}
