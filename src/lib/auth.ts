import { auth } from "@/auth";

/** El id del AdminUser con sesión activa. Nunca sale del cliente (formData):
 *  siempre de la cookie de sesión firmada que valida Auth.js. */
export async function getCurrentAdminId(): Promise<number> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    throw new Error("No hay sesión de administrador activa.");
  }
  return Number(id);
}
