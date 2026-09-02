import "server-only";
import { cache } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { department } from "@/db/schema/department";

/* Lectura pública, aparte de la del panel (src/server/departments.ts): esta no
   exige sesión de admin. La usan el organigrama de /team y, más adelante, la
   página pública de vacantes. */

export type PublicDepartment = {
  id: string;
  slug: string;
  icon: string;
  label: string;
  shortLabel: string;
  responsibilities: string[];
};

function normalize(row: typeof department.$inferSelect): PublicDepartment {
  return {
    id: row.id,
    slug: row.slug,
    icon: row.icon,
    label: row.label,
    shortLabel: row.shortLabel,
    responsibilities: (row.responsibilities as string[]) ?? [],
  };
}

/* cache() por petición: la página de /team la llama desde generateMetadata y
   de nuevo desde el componente — sin esto sería dos consultas por visita. */
export const listDepartmentsForDisplay = cache(async (): Promise<PublicDepartment[]> => {
  const rows = await db.select().from(department).orderBy(asc(department.sortOrder), asc(department.id));
  return rows.map(normalize);
});
