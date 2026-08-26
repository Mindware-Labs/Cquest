"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import ServiceIcon from "@/components/services/ServiceIcon";
import { EASE_OUT } from "@/components/services/motion";
import { TransitionLink } from "@/components/TransitionLink";
import { DEPARTMENTS } from "../data";
import styles from "./OrgChart.module.css";

const COPY = {
  heading: "The work behind every operation.",
  lead: "Each department owns a distinct part of the work. Together, they connect process execution, technology, people and finance into one coordinated operation.",
  listLabel: "Center Quest departments and responsibilities",
  closeTitle: "Build the right operation for your business.",
  closeBody: "Tell us what needs to run. We will help you define the team, process and technology behind it.",
  closeAction: "Discuss your operation",
};

export default function DepartmentDirectory({ reduced }: { reduced: boolean }) {
  const t = COPY;

  return (
    <section id="departments" className={styles.section}>
      <div className={container.container}>
        <header className={styles.intro}>
          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.62, ease: EASE_OUT }}
          >
            {t.heading}
          </motion.h2>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.62, ease: EASE_OUT, delay: 0.08 }}
          >
            {t.lead}
          </motion.p>
        </header>

        <div className={styles.directory} role="list" aria-label={t.listLabel}>
          {DEPARTMENTS.map((department, index) => (
            <motion.article
              key={department.id}
              className={styles.department}
              role="listitem"
              initial={reduced ? false : { opacity: 0, y: 22, filter: "blur(4px)" }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.58, ease: EASE_OUT, delay: (index % 3) * 0.06 }}
            >
              <header className={styles.departmentHeader}>
                <span className={styles.icon}>
                  <ServiceIcon name={department.icon} />
                </span>
                <h3>{department.label}</h3>
              </header>

              <ul className={styles.responsibilities}>
                {department.responsibilities.map((responsibility) => (
                  <li key={responsibility}>
                    <span aria-hidden className={styles.responsibilityMark} />
                    {responsibility}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <motion.div
          className={styles.close}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.62, ease: EASE_OUT }}
        >
          <div>
            <h2>{t.closeTitle}</h2>
            <p>{t.closeBody}</p>
          </div>
          <TransitionLink href="/quote" className={styles.closeAction}>
            {t.closeAction} <Arrow />
          </TransitionLink>
        </motion.div>
      </div>
    </section>
  );
}
