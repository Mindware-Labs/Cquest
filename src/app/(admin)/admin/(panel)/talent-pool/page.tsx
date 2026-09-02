import type { Metadata } from "next";
import ExportButton from "@/components/admin/ExportButton";
import InfoHint from "@/components/admin/InfoHint";
import { isApplicationStatus } from "@/lib/applicationStatus";
import { listTalentPoolPage } from "@/server/applications";
import { listAllDepartments } from "@/server/departments";
import TalentPoolTable from "./TalentPoolTable";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Talent pool · Center Quest Admin",
  robots: { index: false, follow: false },
};

/* Página, orden y filtros viven en la URL, igual que /admin/applications. */
export default async function TalentPoolPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    sort?: string;
    dir?: string;
    q?: string;
    status?: string;
    experience?: string;
    english?: string;
    availability?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const params = await searchParams;

  const sortKey = params.sort === "fullName" ? "fullName" : "createdAt";
  const sortDir = params.dir === "asc" ? "asc" : "desc";
  const query = params.q ?? "";
  const status = params.status && isApplicationStatus(params.status) ? params.status : null;
  const experience = params.experience || null;
  const english = params.english || null;
  const availability = params.availability || null;
  const departmentId = params.department || null;
  const dateFrom = params.dateFrom || null;
  const dateTo = params.dateTo || null;

  const [{ rows, total, page, perPage, counts }, departments] = await Promise.all([
    listTalentPoolPage({
      page: Number(params.page) || 1,
      perPage: Number(params.perPage) || 10,
      sortKey,
      sortDir,
      query,
      status,
      experience,
      english,
      availability,
      departmentId,
      dateFrom,
      dateTo,
    }),
    listAllDepartments(),
  ]);

  const exportParams = new URLSearchParams();
  if (query) exportParams.set("q", query);
  if (status) exportParams.set("status", status);
  if (experience) exportParams.set("experience", experience);
  if (english) exportParams.set("english", english);
  if (availability) exportParams.set("availability", availability);
  if (departmentId) exportParams.set("department", departmentId);
  if (dateFrom) exportParams.set("dateFrom", dateFrom);
  if (dateTo) exportParams.set("dateTo", dateTo);
  const exportQs = exportParams.toString();
  const exportHref = `/api/admin/talent-pool/export${exportQs ? `?${exportQs}` : ""}`;

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Talent pool</h1>
          <InfoHint label="How the talent pool works">
            Candidates who applied without picking a specific vacancy land here. Filter by profile to find who
            fits a role you’re hiring for — to actually bring one onto a vacancy, open that vacancy’s own
            “Talent pool” tab and save them from there.
          </InfoHint>
        </div>
        <ExportButton className={styles.primary} href={exportHref} fallbackFilename="talent-pool.xlsx" />
      </div>

      <TalentPoolTable
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        sortKey={sortKey}
        sortDir={sortDir}
        query={query}
        status={status}
        experience={experience}
        english={english}
        availability={availability}
        departmentId={departmentId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        counts={counts}
        departments={departments}
      />
    </div>
  );
}
