import type { Metadata } from "next";
import Link from "next/link";
import InfoHint from "@/components/admin/InfoHint";
import { isApplicationStatus } from "@/lib/applicationStatus";
import { listApplicationScopes, listApplications } from "@/server/applications";
import ApplicationsTable from "./ApplicationsTable";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Applications · Center Quest Admin",
  robots: { index: false, follow: false },
};

/* Página, orden y filtros viven en la URL, igual que /admin/vacancies. */
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    sort?: string;
    dir?: string;
    q?: string;
    status?: string;
    vacancy?: string;
    from?: string;
  }>;
}) {
  const params = await searchParams;

  const sortKey = params.sort === "fullName" ? "fullName" : "createdAt";
  const sortDir = params.dir === "asc" ? "asc" : "desc";
  const query = params.q ?? "";
  const status = params.status && isApplicationStatus(params.status) ? params.status : null;
  const scope = params.vacancy || null;

  /* Se llega aquí desde la lista de vacantes o desde el editor de una en
     particular (ver VacanciesTable.tsx y VacancyEditor.tsx): el link de
     vuelta apunta a donde el admin realmente estaba, no siempre a la lista. */
  const isVacancyScope = Boolean(scope && scope !== "pool");
  const back = isVacancyScope
    ? params.from === "editor"
      ? { href: `/admin/vacancies/${scope}`, label: "Back to vacancy" }
      : { href: "/admin/vacancies", label: "Back to vacancies" }
    : null;

  const [{ rows, total, page, perPage, counts }, scopes] = await Promise.all([
    listApplications({
      page: Number(params.page) || 1,
      perPage: Number(params.perPage) || 10,
      sortKey,
      sortDir,
      query,
      status,
      scope,
    }),
    listApplicationScopes(),
  ]);

  return (
    <div className={styles.page}>
      {back && (
        <Link className={styles.back} href={back.href}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {back.label}
        </Link>
      )}

      <div className={styles.head}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Applications</h1>
          <InfoHint label="How applications work">
            Every application sent from the public site lands here with its resume attached. Filter by
            vacancy or by the talent pool (open applications), move candidates through the pipeline with the
            status, and keep private notes on each one. Deleting an application also deletes its resume.
          </InfoHint>
        </div>
      </div>

      <ApplicationsTable
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sortKey={sortKey}
        sortDir={sortDir}
        query={query}
        status={status}
        scope={scope}
        counts={counts}
        scopes={scopes}
      />
    </div>
  );
}
