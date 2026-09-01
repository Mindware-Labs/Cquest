"use client";

import { motion, useReducedMotion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { EASE_OUT } from "@/components/services/motion";
import { CONTACT } from "@/components/footer/data";
import { TransitionLink } from "@/components/TransitionLink";
import type { PublicVacancy } from "@/lib/vacancies";
import { ClockIcon, EMPLOYMENT_LABEL, PinIcon, TRACK_LABEL, WORK_MODE_LABEL } from "../components/shared";
import ApplicationForm from "./ApplicationForm";
import styles from "./apply.module.css";

export type ApplyDepartment = { slug: string; shortLabel: string; icon: string };

const NEXT_STEPS = [
  { title: "We read your application", text: "A real person on our team reviews every resume that comes in." },
  { title: "A short call", text: "If your profile fits, we reach out by phone or WhatsApp to talk it through." },
  { title: "Meet the team", text: "An interview with the people you would work with, on site or remote." },
];

export default function ApplyExperience({
  vacancy,
  departments,
}: {
  vacancy: PublicVacancy | null;
  departments: ApplyDepartment[];
}) {
  const reduced = useReducedMotion() ?? false;
  const employment = vacancy?.employmentType ? EMPLOYMENT_LABEL[vacancy.employmentType] : null;
  const mode = vacancy?.workMode ? WORK_MODE_LABEL[vacancy.workMode] : null;
  const type = [employment, mode].filter(Boolean).join(" · ");

  return (
    <section className={styles.page}>
      <div className={container.container}>
        <motion.div
          className={styles.crumbs}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <TransitionLink href="/join-us" className={styles.back}>
            <span className={styles.backArrow} aria-hidden="true">
              <Arrow />
            </span>
            All open positions
          </TransitionLink>
        </motion.div>

        <div className={styles.layout}>
          <motion.aside
            className={styles.side}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEyebrow}>
                  <span className={styles.pulse} aria-hidden="true" />
                  {vacancy ? "Applying for" : "Open application"}
                </span>
                {vacancy?.departmentShortLabel && <span className={styles.cardDept}>{vacancy.departmentShortLabel}</span>}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.titleRow}>
                  <span className={styles.titleIcon} aria-hidden="true">
                    <ServiceIcon name={(vacancy?.departmentIcon ?? "userplus") as ServiceIconName} />
                  </span>
                  <h1 className={styles.title}>{vacancy ? vacancy.title : "Join our talent pool"}</h1>
                </div>

                {vacancy ? (
                  <>
                    {(vacancy.location || type || vacancy.track) && (
                      <ul className={styles.meta}>
                        {vacancy.location && (
                          <li>
                            <PinIcon />
                            {vacancy.location}
                          </li>
                        )}
                        {type && (
                          <li>
                            <ClockIcon />
                            {type}
                          </li>
                        )}
                        {vacancy.track && (
                          <li>
                            <span className={styles.trackChip}>{TRACK_LABEL[vacancy.track]}</span>
                          </li>
                        )}
                      </ul>
                    )}
                    {vacancy.summary && <p className={styles.summary}>{vacancy.summary}</p>}
                  </>
                ) : (
                  <p className={styles.summary}>
                    No open role fits you yet? Leave your resume with us. We keep it on file and reach out as soon as a
                    position matches your profile.
                  </p>
                )}
              </div>

              <div className={styles.steps}>
                <span className={styles.stepsTitle}>What happens next</span>
                <ol className={styles.stepList}>
                  {NEXT_STEPS.map((step, index) => (
                    <li key={step.title} className={styles.step}>
                      <span className={styles.stepIndex} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.stepText}>
                        <strong>{step.title}</strong>
                        <span>{step.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className={styles.cardFoot}>
                Questions?{" "}
                <a href={`mailto:${CONTACT.email}`} className={styles.footLink}>
                  {CONTACT.email}
                </a>
              </div>
            </div>
          </motion.aside>

          <motion.div
            className={styles.main}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
          >
            <ApplicationForm
              reduced={reduced}
              vacancySlug={vacancy?.slug ?? null}
              vacancyTitle={vacancy?.title ?? null}
              departments={vacancy ? [] : departments}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
