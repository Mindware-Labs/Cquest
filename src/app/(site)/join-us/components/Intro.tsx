"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import { TransitionLink } from "@/components/TransitionLink";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { EASE_OUT } from "@/components/services/motion";
import type { Hiring } from "../JoinUsExperience";
import { CloseIcon, OPEN_APPLICATION_HREF, PinIcon, SearchIcon, dateFormat, type LocationOption } from "./shared";
import styles from "./Intro.module.css";

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export default function Intro({
  reduced,
  count,
  hiring,
  locations,
  updatedAt,
  query,
  onQueryChange,
  onPickDepartment,
}: {
  reduced: boolean;
  count: number;
  hiring: Hiring[];
  locations: LocationOption[];
  updatedAt: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onPickDepartment: (slug: string) => void;
}) {
  const state = count > 0 ? "on" : "off";

  return (
    <div className={styles.intro}>
      <motion.header
        className={styles.copy}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <span className={styles.eyebrow}>
          <span className={styles.pulse} data-state={state} aria-hidden="true" />
          Careers at Center Quest
        </span>
        <h1 className={styles.headline}>{count > 0 ? "Where you'd fit in" : "We're always growing"}</h1>
        <p className={styles.lead}>
          Join the people behind our contact center, back office and systems work. Every role below is real and open
          right now — no third-party boards, no stale postings.
        </p>

        <div className={styles.searchRow}>
          <form className={styles.search} role="search" aria-label="Search open positions" onSubmit={(event) => event.preventDefault()}>
            <span className={styles.searchIcon} aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by role, department or keyword"
              aria-label="Search by role, department or keyword"
              className={styles.searchInput}
            />
            {query && (
              <button type="button" className={styles.searchClear} onClick={() => onQueryChange("")} aria-label="Clear search">
                <CloseIcon />
              </button>
            )}
          </form>
          <TransitionLink className={styles.resumeLink} href={OPEN_APPLICATION_HREF}>
            Send an open application <Arrow />
          </TransitionLink>
        </div>
      </motion.header>

      <motion.aside
        className={styles.panel}
        aria-label="Hiring snapshot"
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT, delay: reduced ? 0 : 0.12 }}
      >
        <div className={styles.panelHead}>
          <span className={styles.panelStatus}>
            <span className={styles.pulse} data-state={state} aria-hidden="true" />
            {count > 0 ? "Hiring now" : "No open roles today"}
          </span>
          {updatedAt && (
            <span className={styles.panelUpdated}>
              Updated <time dateTime={updatedAt}>{dateFormat.format(new Date(updatedAt))}</time>
            </span>
          )}
        </div>

        {count > 0 ? (
          <>
            <div className={styles.panelStat}>
              <span className={styles.panelCount}>{count}</span>
              <span className={styles.panelCountLabel}>
                <strong>open position{count === 1 ? "" : "s"}</strong>
                <span>{hiring.length === 1 ? `in ${hiring[0].shortLabel}` : `across ${plural(hiring.length, "department")}`}</span>
              </span>
            </div>

            {hiring.length > 0 && (
              <ul className={styles.panelList} aria-label="Open positions by department">
                {hiring.map((department) => (
                  <li key={department.slug}>
                    <a href="#openings" className={styles.panelRow} onClick={() => onPickDepartment(department.slug)}>
                      <span className={styles.panelRowIcon} aria-hidden="true">
                        <ServiceIcon name={department.icon as ServiceIconName} />
                      </span>
                      <span className={styles.panelRowLabel}>{department.shortLabel}</span>
                      <span className={styles.panelRowCount}>{plural(department.count, "role")}</span>
                      <span className={styles.panelRowArrow} aria-hidden="true">
                        <Arrow />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.panelFoot}>
              {locations.length > 0 && (
                <span className={styles.panelLocations}>
                  <PinIcon />
                  {locations.map((entry) => entry.location).join(" · ")}
                </span>
              )}
              <TransitionLink className={styles.panelFootLink} href={OPEN_APPLICATION_HREF}>
                Send your resume
              </TransitionLink>
            </div>
          </>
        ) : (
          <div className={styles.panelEmpty}>
            <p className={styles.panelEmptyText}>
              Nothing open right now — send us your resume and we&rsquo;ll reach out when a fit opens up.
            </p>
            <TransitionLink className={styles.panelCta} href={OPEN_APPLICATION_HREF}>
              Send your resume <Arrow />
            </TransitionLink>
          </div>
        )}
      </motion.aside>
    </div>
  );
}
