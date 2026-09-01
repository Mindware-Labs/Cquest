"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { EASE_OUT, VIEWPORT, focusRiseVariants, groupVariants } from "@/components/services/motion";
import { CONTACT } from "@/components/footer/data";
import type { PublicVacancy } from "@/lib/vacancies";
import type { Hiring } from "../JoinUsExperience";
import styles from "./Listing.module.css";

const WORK_MODE_LABEL: Record<string, string> = {
  onsite: "On site",
  hybrid: "Hybrid",
  remote: "Remote",
};

const EMPLOYMENT_LABEL: Record<string, string> = {
  "full-time": "Full time",
  "part-time": "Part time",
};

const TRACK_LABEL: Record<string, string> = {
  entry: "Entry level",
  professional: "Professional",
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

function applyHref(title: string): string {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(`Application — ${title}`)}`;
}

function VacancyCard({ vacancy }: { vacancy: PublicVacancy }) {
  const hasDetails = vacancy.responsibilities.length > 0 || vacancy.requirements.length > 0 || vacancy.niceToHave.length > 0;
  const meta = [
    vacancy.workMode && WORK_MODE_LABEL[vacancy.workMode],
    vacancy.employmentType && EMPLOYMENT_LABEL[vacancy.employmentType],
    vacancy.location,
    vacancy.schedule,
  ].filter((entry): entry is string => Boolean(entry));

  return (
    <motion.article className={styles.card} variants={focusRiseVariants}>
      <div className={styles.cardHead}>
        {vacancy.departmentShortLabel && (
          <span className={styles.deptChip}>
            {vacancy.departmentIcon && (
              <span className={styles.deptChipIcon} aria-hidden="true">
                <ServiceIcon name={vacancy.departmentIcon as ServiceIconName} />
              </span>
            )}
            {vacancy.departmentShortLabel}
          </span>
        )}
        {vacancy.track && <span className={styles.trackChip}>{TRACK_LABEL[vacancy.track]}</span>}
      </div>

      <h3 className={styles.title}>{vacancy.title}</h3>

      {meta.length > 0 && (
        <ul className={styles.meta}>
          {meta.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      )}

      {vacancy.summary && <p className={styles.summary}>{vacancy.summary}</p>}

      {hasDetails && (
        <details className={styles.details}>
          <summary>
            View responsibilities &amp; requirements
            <Arrow direction="down" className={styles.detailsArrow} />
          </summary>

          <div className={styles.detailsBody}>
            {vacancy.responsibilities.length > 0 && (
              <div className={styles.detailsGroup}>
                <span className={styles.detailsLabel}>Responsibilities</span>
                <ul className={styles.detailsList}>
                  {vacancy.responsibilities.map((line, index) => (
                    <li key={`${index}-${line}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {vacancy.requirements.length > 0 && (
              <div className={styles.detailsGroup}>
                <span className={styles.detailsLabel}>Requirements</span>
                <ul className={styles.detailsList}>
                  {vacancy.requirements.map((line, index) => (
                    <li key={`${index}-${line}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {vacancy.niceToHave.length > 0 && (
              <div className={styles.detailsGroup}>
                <span className={styles.detailsLabel}>Nice to have</span>
                <ul className={styles.detailsList}>
                  {vacancy.niceToHave.map((line, index) => (
                    <li key={`${index}-${line}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}

      <div className={styles.cardFoot}>
        <time className={styles.posted} dateTime={vacancy.publishedAt}>
          Posted {dateFormat.format(new Date(vacancy.publishedAt))}
        </time>
        <a className={styles.applyCta} href={applyHref(vacancy.title)}>
          Apply <Arrow />
        </a>
      </div>
    </motion.article>
  );
}

export default function Listing({
  reduced,
  openings,
  hiring,
}: {
  reduced: boolean;
  openings: PublicVacancy[];
  hiring: Hiring[];
}) {
  const [department, setDepartment] = useState<string | null>(null);

  const visible = useMemo(
    () => (department ? openings.filter((entry) => entry.departmentSlug === department) : openings),
    [openings, department],
  );

  return (
    <section id="openings" className={styles.section}>
      <div className={container.container}>
        <motion.header
          className={styles.intro}
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.62, ease: EASE_OUT }}
        >
          <span className={styles.eyebrow}>Open positions</span>
          <h2 className={styles.headline}>Where you&rsquo;d fit in</h2>
          <p className={styles.lead}>
            Every role below is real and open right now — no third-party boards, no stale postings.
            Pick a department to narrow the list.
          </p>
        </motion.header>

        <div className={styles.layout}>
          {hiring.length > 1 && (
            <aside className={styles.sidebar}>
              <nav aria-label="Filter by department">
                <span className={styles.sidebarTitle}>Departments</span>
                <ul className={styles.deptList}>
                  <li>
                    <button
                      type="button"
                      className={styles.deptButton}
                      aria-current={department === null ? "true" : undefined}
                      onClick={() => setDepartment(null)}
                    >
                      All
                      <span className={styles.deptCount}>{openings.length}</span>
                    </button>
                  </li>
                  {hiring.map((entry) => (
                    <li key={entry.slug}>
                      <button
                        type="button"
                        className={styles.deptButton}
                        aria-current={department === entry.slug ? "true" : undefined}
                        onClick={() => setDepartment(entry.slug)}
                      >
                        {entry.shortLabel}
                        <span className={styles.deptCount}>{entry.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <section className={styles.pitch}>
                <p className={styles.pitchText}>Don&rsquo;t see a fit yet? We keep resumes on file for the next opening.</p>
                <a className={styles.pitchCta} href={applyHref("Open application")}>
                  Send your resume
                </a>
              </section>
            </aside>
          )}

          <div className={styles.main}>
            {visible.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyMark} aria-hidden="true">
                  <ServiceIcon name="userplus" />
                </span>
                <h3 className={styles.emptyTitle}>
                  {openings.length === 0 ? "Nothing open right now" : "Nothing open in that department"}
                </h3>
                <p className={styles.emptyText}>
                  {openings.length === 0
                    ? "We are not actively hiring at this exact moment, but our team keeps growing. Send us your resume and we will reach out when a fit opens up."
                    : "That department has no open positions today. The rest of the list is one click away."}
                </p>
                <a
                  className={styles.emptyCta}
                  href={openings.length === 0 ? applyHref("Open application") : "#openings"}
                  onClick={openings.length > 0 ? () => setDepartment(null) : undefined}
                >
                  {openings.length === 0 ? "Send your resume" : "See all open positions"}
                </a>
              </div>
            ) : (
              <motion.div
                className={styles.list}
                variants={groupVariants}
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={VIEWPORT}
              >
                {visible.map((vacancy) => (
                  <VacancyCard key={vacancy.id} vacancy={vacancy} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
