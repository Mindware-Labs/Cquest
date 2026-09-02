import type { Metadata } from "next";
import { listVacancies } from "@/server/vacancies";
import { listAllDepartments } from "@/server/departments";
import VacanciesTable from "./VacanciesTable";
import VacanciesHeader from "./VacanciesHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Vacancies · Center Quest Admin",
  robots: { index: false, follow: false },
};

/* Página y orden viven en la URL, no en estado del cliente: mismo patrón que
   /admin/posts (ver src/app/(admin)/admin/(panel)/posts/page.tsx). */
export default async function VacanciesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string; sort?: string; dir?: string; q?: string }>;
}) {
  const params = await searchParams;

  const sortKey = params.sort === "title" ? "title" : "updatedAt";
  const sortDir = params.dir === "asc" ? "asc" : "desc";
  const query = params.q ?? "";

  const [{ rows, total, page, perPage }, departments] = await Promise.all([
    listVacancies({
      page: Number(params.page) || 1,
      perPage: Number(params.perPage) || 10,
      sortKey,
      sortDir,
      query,
    }),
    listAllDepartments(),
  ]);

  return (
    <div className={styles.page}>
      <VacanciesHeader departments={departments} />
      <VacanciesTable
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sortKey={sortKey}
        sortDir={sortDir}
        query={query}
      />
    </div>
  );
}
