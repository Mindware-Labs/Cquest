import Link from "next/link";
import t from "@/components/admin/dataTable.module.css";
import type { DashboardData } from "@/server/dashboard";
import styles from "./DashboardView.module.css";

function percent(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function DeltaNote({ current, previous }: { current: number; previous: number }) {
  if (current === previous) return <span className={styles.delta}>Same as last week</span>;
  const diff = current - previous;
  return (
    <span className={styles.delta} data-tone={diff > 0 ? "up" : "down"}>
      {diff > 0 ? "+" : ""}
      {diff} vs last week
    </span>
  );
}

export default function DashboardView({ data }: { data: DashboardData }) {
  const { stats, weeklyApplications, byDepartment, topVacancies, needsAttention, duplicates } = data;
  const weeklyMax = Math.max(1, ...weeklyApplications.map((w) => w.count));
  const departmentTotal = byDepartment.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.openVacancies}</span>
          <span className={styles.statLabel}>Open vacancies</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.totalApplications}</span>
          <span className={styles.statLabel}>Applications, all time</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.applicationsThisWeek}</span>
          <span className={styles.statLabel}>This week</span>
          <DeltaNote current={stats.applicationsThisWeek} previous={stats.applicationsLastWeek} />
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.hiresThisMonth}</span>
          <span className={styles.statLabel}>Hires this month</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.avgDaysToHire !== null ? Math.round(stats.avgDaysToHire) : "—"}</span>
          <span className={styles.statLabel}>Avg. days to hire</span>
        </div>
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <span className={styles.panelTitle}>Applications — last 8 weeks</span>
          <ul className={styles.bars}>
            {weeklyApplications.map((week) => (
              <li key={week.label} className={styles.barRow}>
                <span className={styles.barLabel}>{week.label}</span>
                <span className={styles.barTrack}>
                  <span className={styles.barFill} style={{ width: `${percent(week.count, weeklyMax)}%` }} />
                </span>
                <span className={styles.barValue}>{week.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <span className={styles.panelTitle}>By department</span>
          {byDepartment.length === 0 ? (
            <p className={styles.empty}>No applications yet.</p>
          ) : (
            <ul className={styles.bars}>
              {byDepartment.map((entry) => (
                <li key={entry.label} className={styles.barRow}>
                  <span className={styles.barLabel}>{entry.label}</span>
                  <span className={styles.barTrack}>
                    <span className={styles.barFill} style={{ width: `${percent(entry.count, departmentTotal)}%` }} />
                  </span>
                  <span className={styles.barValue}>{entry.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.panel}>
        <span className={styles.panelTitle}>Top vacancies by applicants</span>
        {topVacancies.length === 0 ? (
          <p className={styles.empty}>No applications yet.</p>
        ) : (
          <div className={t.scroller}>
            <table className={t.table}>
              <caption className={t.srOnly}>Top vacancies by number of applicants.</caption>
              <thead>
                <tr>
                  <th className={t.th}>Vacancy</th>
                  <th className={t.th}>Department</th>
                  <th className={t.th}>Applicants</th>
                  <th className={t.th}>Hired</th>
                  <th className={t.th}>Conversion</th>
                  <th className={t.th}>
                    <span className={t.srOnly}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {topVacancies.map((vacancy) => (
                  <tr key={vacancy.id} className={t.row}>
                    <td className={t.td}>{vacancy.title}</td>
                    <td className={t.td}>{vacancy.departmentLabel ?? "No department"}</td>
                    <td className={`${t.td} ${t.nowrap}`}>{vacancy.applications}</td>
                    <td className={`${t.td} ${t.nowrap}`}>{vacancy.hired}</td>
                    <td className={`${t.td} ${t.nowrap}`}>{percent(vacancy.hired, vacancy.applications)}%</td>
                    <td className={`${t.td} ${t.actionsCell}`}>
                      <Link className={styles.rowLink} href={`/admin/vacancies/${vacancy.id}/report`}>
                        View report →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <span className={styles.panelTitle}>Needs attention</span>
          <span className={styles.panelHint}>Sitting in “New” for 5+ days without a status change.</span>
          {needsAttention.length === 0 ? (
            <p className={styles.empty}>Nothing waiting — the New pipeline is caught up.</p>
          ) : (
            <ul className={styles.list}>
              {needsAttention.map((candidate) => (
                <li key={candidate.id} className={styles.listRow}>
                  <Link className={styles.listName} href={`/admin/applications/${candidate.id}`}>
                    {candidate.fullName}
                  </Link>
                  <span className={styles.listBadge}>{candidate.daysOld}d</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <span className={styles.panelTitle}>Possible duplicates</span>
          <span className={styles.panelHint}>Same email, more than one application.</span>
          {duplicates.length === 0 ? (
            <p className={styles.empty}>No repeated emails.</p>
          ) : (
            <ul className={styles.list}>
              {duplicates.map((entry) => (
                <li key={entry.email} className={styles.listRow}>
                  <Link className={styles.listName} href={`/admin/applications?q=${encodeURIComponent(entry.email)}`}>
                    {entry.fullName}
                  </Link>
                  <span className={styles.listBadge}>×{entry.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
