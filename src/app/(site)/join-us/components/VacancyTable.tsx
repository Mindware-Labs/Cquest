"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import Arrow from "@/components/services/Arrow";
import { TransitionLink } from "@/components/TransitionLink";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { EASE_OUT, VIEWPORT, groupVariants } from "@/components/services/motion";
import type { PublicVacancy } from "@/lib/vacancies";
import { ChevronIcon, ClockIcon, EMPLOYMENT_LABEL, PinIcon, TRACK_LABEL, WORK_MODE_LABEL, applyHref, dateFormat } from "./shared";
import styles from "./VacancyTable.module.css";

const COLUMNS = 7;

// Sin desplazamiento grande: transform sobre <tr> se lleva mal con las tablas.
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

function DetailGroup({ label, lines }: { label: string; lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <div className={styles.detailGroup}>
      <span className={styles.detailLabel}>{label}</span>
      <ul className={styles.detailList}>
        {lines.map((line, index) => (
          <li key={`${index}-${line}`}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function Row({
  vacancy,
  open,
  reduced,
  onToggle,
}: {
  vacancy: PublicVacancy;
  open: boolean;
  reduced: boolean;
  onToggle: () => void;
}) {
  const detailsId = useId();
  const hasLists = vacancy.responsibilities.length > 0 || vacancy.requirements.length > 0 || vacancy.niceToHave.length > 0;
  const expandable = hasLists || Boolean(vacancy.summary) || Boolean(vacancy.schedule);
  const employment = vacancy.employmentType ? EMPLOYMENT_LABEL[vacancy.employmentType] : null;
  const mode = vacancy.workMode ? WORK_MODE_LABEL[vacancy.workMode] : null;

  return (
    <>
      <motion.tr
        role="row"
        className={styles.row}
        data-open={open || undefined}
        data-expandable={expandable || undefined}
        variants={rowVariants}
        onClick={expandable ? onToggle : undefined}
      >
        <td role="cell" className={styles.cellPosition}>
          <span className={styles.position}>
            <span className={styles.icon} aria-hidden="true">
              <ServiceIcon name={(vacancy.departmentIcon ?? "userplus") as ServiceIconName} />
            </span>
            <span className={styles.positionText}>
              {expandable ? (
                <button type="button" className={styles.title} aria-expanded={open} aria-controls={open ? detailsId : undefined}>
                  {vacancy.title}
                </button>
              ) : (
                <span className={styles.title}>{vacancy.title}</span>
              )}
              {vacancy.departmentShortLabel && <span className={styles.dept}>{vacancy.departmentShortLabel}</span>}
            </span>
          </span>
        </td>

        <td role="cell" className={styles.cellMeta}>
          {vacancy.location ? (
            <span className={styles.meta}>
              <PinIcon />
              {vacancy.location}
            </span>
          ) : (
            <span className={styles.none}>—</span>
          )}
        </td>

        <td role="cell" className={styles.cellMeta}>
          {employment || mode ? (
            <span className={styles.meta}>
              <ClockIcon />
              <span className={styles.metaStack}>
                {employment && <span>{employment}</span>}
                {mode && <span className={employment ? styles.metaSub : undefined}>{mode}</span>}
              </span>
            </span>
          ) : (
            <span className={styles.none}>—</span>
          )}
        </td>

        <td role="cell" className={styles.cellMeta}>
          {vacancy.track ? (
            <span className={styles.chip} data-track={vacancy.track}>
              {TRACK_LABEL[vacancy.track]}
            </span>
          ) : (
            <span className={styles.none}>—</span>
          )}
        </td>

        <td role="cell" className={styles.cellPosted}>
          <span className={styles.postedLabel}>Posted</span>
          <time dateTime={vacancy.publishedAt}>{dateFormat.format(new Date(vacancy.publishedAt))}</time>
        </td>

        <td role="cell" className={styles.cellApply}>
          <TransitionLink className={styles.apply} href={applyHref(vacancy.slug)} onClick={(event) => event.stopPropagation()}>
            Apply <Arrow />
          </TransitionLink>
        </td>

        <td role="cell" className={styles.cellToggle}>
          {expandable && (
            <span className={styles.toggle} aria-hidden="true">
              <ChevronIcon />
            </span>
          )}
        </td>
      </motion.tr>

      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.tr role="row" key="details" className={styles.detailRow}>
            <td role="cell" colSpan={COLUMNS} id={detailsId} className={styles.detailCell}>
              <motion.div
                className={styles.detailClip}
                initial={reduced ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0, transition: { duration: reduced ? 0 : 0.35, ease: EASE_OUT } }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                <div className={styles.detailBody}>
                  {vacancy.summary && <p className={styles.summary}>{vacancy.summary}</p>}
                  {vacancy.schedule && (
                    <p className={styles.schedule}>
                      <ClockIcon />
                      {vacancy.schedule}
                    </p>
                  )}

                  {hasLists && (
                    <div className={styles.detailGrid}>
                      <DetailGroup label="Responsibilities" lines={vacancy.responsibilities} />
                      <DetailGroup label="Requirements" lines={vacancy.requirements} />
                      <DetailGroup label="Nice to have" lines={vacancy.niceToHave} />
                    </div>
                  )}

                  <div className={styles.detailFoot}>
                    <TransitionLink className={styles.detailApply} href={applyHref(vacancy.slug)}>
                      Apply for this role <Arrow />
                    </TransitionLink>
                  </div>
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default function VacancyTable({ reduced, vacancies }: { reduced: boolean; vacancies: PublicVacancy[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={styles.wrap}>
      <table role="table" className={styles.table}>
        <caption className={styles.srOnly}>Open positions at Center Quest</caption>
        <thead role="rowgroup" className={styles.head}>
          <tr role="row">
            <th role="columnheader" scope="col">Position</th>
            <th role="columnheader" scope="col">Location</th>
            <th role="columnheader" scope="col">Type</th>
            <th role="columnheader" scope="col">Level</th>
            <th role="columnheader" scope="col">Posted</th>
            <th role="columnheader" scope="col">
              <span className={styles.srOnly}>Apply</span>
            </th>
            <th role="columnheader" scope="col">
              <span className={styles.srOnly}>Details</span>
            </th>
          </tr>
        </thead>
        <motion.tbody
          role="rowgroup"
          variants={groupVariants}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
        >
          {vacancies.map((vacancy) => (
            <Row
              key={vacancy.id}
              vacancy={vacancy}
              open={openId === vacancy.id}
              reduced={reduced}
              onToggle={() => setOpenId((current) => (current === vacancy.id ? null : vacancy.id))}
            />
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
