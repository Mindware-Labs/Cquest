import Link from "next/link";
import t from "@/components/admin/dataTable.module.css";
import { APPLICATION_STATUSES, APPLICATION_STATUS_META } from "@/lib/applicationStatus";
import type { VacancyReport } from "@/server/vacancies";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, optionLabel } from "@/app/(site)/join-us/apply/data";
import ExportButton from "@/components/admin/ExportButton";
import styles from "./VacancyReport.module.css";

const stamp = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Santo_Domingo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatStamp(iso: string): string {
  const parts = stamp.formatToParts(new Date(iso));
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`;
}

// No se importa de ApplicationsTable.tsx: es "use client", y una función
// exportada desde un módulo cliente no se puede invocar desde un server
// component aunque la función en sí no use hooks ni JSX.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function percent(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function BreakdownList({ title, counts, options, total }: { title: string; counts: Record<string, number>; options: readonly { value: string; label: string }[]; total: number }) {
  const entries = options.map((option) => ({ label: option.label, count: counts[option.value] ?? 0 })).filter((entry) => entry.count > 0);

  return (
    <div className={styles.breakdown}>
      <span className={styles.breakdownTitle}>{title}</span>
      {entries.length === 0 ? (
        <p className={styles.empty}>No data yet.</p>
      ) : (
        <ul className={styles.bars}>
          {entries.map((entry) => (
            <li key={entry.label} className={styles.barRow}>
              <span className={styles.barLabel}>{entry.label}</span>
              <span className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: `${percent(entry.count, total)}%` }} />
              </span>
              <span className={styles.barValue}>
                {entry.count} · {percent(entry.count, total)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function VacancyReportView({ report }: { report: VacancyReport }) {
  const { vacancy, total, statusCounts, experienceCounts, englishCounts, availabilityCounts, candidates } = report;
  const hired = statusCounts.hired;
  const conversion = total > 0 ? `${percent(hired, total)}%` : "—";
  const live = vacancy.publishedAt ? `${daysSince(vacancy.publishedAt)} days` : "Not published yet";

  return (
    <div className={styles.page}>
      <Link className={styles.back} href={`/admin/vacancies/${vacancy.id}`}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to vacancy
      </Link>

      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>Report</span>
          <h1 className={styles.title}>{vacancy.title}</h1>
          <span className={styles.subline}>
            {vacancy.departmentLabel ?? "No department"} · {vacancy.status === "published" ? "Published" : vacancy.status === "hidden" ? "Hidden" : "Draft"}
          </span>
        </div>
        <ExportButton
          className={styles.export}
          href={`/api/admin/vacancies/${vacancy.id}/report/export`}
          fallbackFilename={`${vacancy.title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "vacancy"}-candidates.xlsx`}
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{total}</span>
          <span className={styles.statLabel}>Total applicants</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{hired}</span>
          <span className={styles.statLabel}>Hired</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{conversion}</span>
          <span className={styles.statLabel}>Conversion to hire</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{live}</span>
          <span className={styles.statLabel}>Live on Join Us</span>
        </div>
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <span className={styles.panelTitle}>Pipeline</span>
          {total === 0 ? (
            <p className={styles.empty}>No applications yet for this vacancy.</p>
          ) : (
            <ul className={styles.bars}>
              {APPLICATION_STATUSES.map((status) => {
                const meta = APPLICATION_STATUS_META[status];
                const count = statusCounts[status];
                return (
                  <li key={status} className={styles.barRow}>
                    <span className={styles.barLabel}>{meta.label}</span>
                    <span className={styles.barTrack}>
                      <span className={styles.barFill} style={{ width: `${percent(count, total)}%`, background: meta.ink }} />
                    </span>
                    <span className={styles.barValue}>
                      {count} · {percent(count, total)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <span className={styles.panelTitle}>Candidate profile</span>
          <div className={styles.breakdowns}>
            <BreakdownList title="Experience" counts={experienceCounts} options={EXPERIENCE_OPTIONS} total={total} />
            <BreakdownList title="English" counts={englishCounts} options={ENGLISH_OPTIONS} total={total} />
            <BreakdownList title="Availability" counts={availabilityCounts} options={AVAILABILITY_OPTIONS} total={total} />
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <span className={styles.panelTitle}>Candidates</span>
        {candidates.length === 0 ? (
          <p className={styles.empty}>No applications yet for this vacancy.</p>
        ) : (
          <div className={t.scroller}>
            <table className={t.table}>
              <caption className={t.srOnly}>Candidates for {vacancy.title}, {candidates.length} total.</caption>
              <thead>
                <tr>
                  <th className={t.th}>Candidate</th>
                  <th className={t.th}>Profile</th>
                  <th className={t.th}>Status</th>
                  <th className={t.th}>Applied</th>
                  <th className={t.th}>
                    <span className={t.srOnly}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => {
                  const meta = APPLICATION_STATUS_META[candidate.status];
                  return (
                    <tr key={candidate.id} className={t.row}>
                      <td className={t.td}>
                        <span className={t.person}>
                          <span className={t.avatar} aria-hidden="true">
                            {initials(candidate.fullName)}
                          </span>
                          <span className={t.personName}>{candidate.fullName}</span>
                        </span>
                      </td>
                      <td className={`${t.td} ${styles.profileCell}`}>
                        {optionLabel(EXPERIENCE_OPTIONS, candidate.experience)} · {optionLabel(ENGLISH_OPTIONS, candidate.english)} English
                      </td>
                      <td className={t.td}>
                        <span className={t.badge} style={{ "--badge-ink": meta.ink } as React.CSSProperties}>
                          {meta.label}
                        </span>
                      </td>
                      <td className={`${t.td} ${t.nowrap}`}>{formatStamp(candidate.createdAt)}</td>
                      <td className={`${t.td} ${t.actionsCell}`}>
                        <span className={t.actions}>
                          <Link className={t.action} href={`/admin/applications/${candidate.id}`} title="View application" aria-label={`View ${candidate.fullName}`}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                              <path d="M1.4 8s2.6-4.2 6.6-4.2S14.6 8 14.6 8s-2.6 4.2-6.6 4.2S1.4 8 1.4 8Z" strokeLinejoin="round" />
                              <circle cx="8" cy="8" r="1.9" />
                            </svg>
                          </Link>
                          <a
                            className={t.action}
                            href={`/api/admin/applications/${candidate.id}/resume?download=1`}
                            title="Download resume"
                            aria-label={`Download resume of ${candidate.fullName}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                              <path d="M8 2.6v7.2M5.2 7l2.8 2.8L10.8 7" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M3 11v2.4h10V11" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
