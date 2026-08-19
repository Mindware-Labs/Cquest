import { prisma } from "@/lib/prisma";

/* TODO(auth): placeholder hasta que Auth.js (Fase 2 del plan) quede wireado.
   Un Post siempre necesita un autor, y ese id NUNCA debe venir del cliente
   (formData) — eso permitiría publicar "como" cualquier admin. Mientras no
   haya sesión real, se resuelve al único AdminUser existente en desarrollo.
   Reemplazar el cuerpo de esta función por la lectura de la sesión real es
   el único cambio que va a necesitar src/lib/posts.ts cuando eso pase. */
export async function getCurrentAdminId(): Promise<number> {
  const admin = await prisma.adminUser.findFirst({ orderBy: { id: "asc" } });
  if (!admin) {
    throw new Error(
      "No hay ningún AdminUser en la base de datos todavía — crea uno antes de publicar artículos.",
    );
  }
  return admin.id;
}
