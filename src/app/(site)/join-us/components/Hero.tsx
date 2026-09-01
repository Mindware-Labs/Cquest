"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { EASE_OUT } from "@/components/services/motion";
import { CONTACT } from "@/components/footer/data";
import type { Hiring } from "../JoinUsExperience";
import styles from "./Hero.module.css";

const COPY = {
  lead: "Join the people behind our contact center, back office and systems work — hired to build a career, not just fill a shift.",
  explore: "See open positions",
  resume: "Send us your resume",
  hiringNow: "Hiring now",
  noOpenings: "No open roles today",
};

function positionsWord(count: number): string {
  return count === 1 ? "position" : "positions";
}

export default function Hero({ reduced, count, hiring }: { reduced: boolean; count: number; hiring: Hiring[] }) {
  const t = COPY;

  return (
    <header data-hero-boundary className={styles.hero}>
      <div className={`${container.container} ${styles.layout}`}>
        <motion.div
          className={styles.copy}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE_OUT }}
        >
          <h1 className={styles.headline}>
            <span>{count > 0 ? `${count} open ${positionsWord(count)}.` : "No open roles today."}</span>
            <strong>{count > 0 ? "One growing team." : "We're always growing."}</strong>
          </h1>
          <p className={styles.lead}>{t.lead}</p>
          <div className={styles.actions}>
            <a href="#openings" className={styles.primaryCta}>
              {t.explore} <Arrow direction="down" />
            </a>
            <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Open application — Center Quest")}`} className={styles.secondaryCta}>
              {t.resume} <Arrow />
            </a>
          </div>
        </motion.div>

        <motion.div
          className={styles.panel}
          initial={reduced ? false : { opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: EASE_OUT, delay: reduced ? 0 : 0.12 }}
          aria-hidden="true"
        >
          <div className={styles.panelHead}>
            <span className={styles.pulse} data-state={count > 0 ? "on" : "off"} />
            {count > 0 ? t.hiringNow : t.noOpenings}
          </div>

          {count > 0 ? (
            <>
              <span className={styles.panelCount}>{count}</span>
              <span className={styles.panelCountLabel}>open {positionsWord(count)} right now</span>

              {hiring.length > 0 && (
                <ul className={styles.panelList}>
                  {hiring.map((department) => (
                    <li key={department.slug} className={styles.panelRow}>
                      <span className={styles.panelRowIcon}>
                        <ServiceIcon name={department.icon as ServiceIconName} />
                      </span>
                      <span className={styles.panelRowLabel}>{department.shortLabel}</span>
                      <span className={styles.panelRowCount}>{department.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className={styles.panelEmpty}>
              Nothing open right now — send us your resume and we&rsquo;ll reach out when a fit opens up.
            </p>
          )}
        </motion.div>
      </div>
    </header>
  );
}
