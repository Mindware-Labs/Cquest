"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import {
  EASE_OUT,
  focusRiseVariants,
  groupVariants,
  ruleYVariants,
  statCardVariants,
  statLineVariants,
  stepVariants,
  VIEWPORT,
} from "@/components/services/motion";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useI18n } from "@/i18n/I18nProvider";
import LocationMap from "./LocationMap";
import { CONTACT, DIRECTIONS_URL, LOCATION_COPY } from "./locationData";
import styles from "./LocationSection.module.css";

export default function LocationSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = LOCATION_COPY[lang];
  const {
    ref: ctaRef,
    style: ctaStyle,
    onMouseEnter: onCtaMouseEnter,
    onMouseMove: onCtaMouseMove,
    onMouseLeave: onCtaMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.25, 2);

  return (
    <section id="location" className={styles.locationSection}>
      <div aria-hidden className={`${styles.grain} cq-noise`} />

      <div className={`${container.container} ${styles.inner}`}>
        <motion.div
          className={styles.head}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div className={styles.headCopy} variants={stepVariants}>
            <motion.span aria-hidden className={styles.headRule} variants={ruleYVariants} />
            <motion.span className={styles.eyebrow} variants={focusRiseVariants}>
              {t.eyebrow}
            </motion.span>
            <motion.h2 variants={focusRiseVariants}>{t.heading}</motion.h2>
          </motion.div>
          <motion.p className={styles.lead} variants={focusRiseVariants}>
          </motion.p>
        </motion.div>

        <motion.figure
          className={styles.frame}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.72, ease: EASE_OUT }}
        >
          <div className={styles.stage} data-lenis-prevent-wheel data-lenis-prevent-touch>
            <LocationMap />
          </div>

          <motion.figcaption
            className={styles.legend}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <motion.dl className={styles.records} variants={groupVariants}>
              <motion.div variants={statCardVariants}>
                <motion.dt className={styles.legendLabel} variants={statLineVariants}>
                  {t.hqLabel}
                </motion.dt>
                <motion.dd className={styles.legendValue} variants={statLineVariants}>
                  {CONTACT.city}
                </motion.dd>
              </motion.div>

              <motion.div variants={statCardVariants}>
                <motion.dt className={styles.legendLabel} variants={statLineVariants}>
                  {t.regionLabel}
                </motion.dt>
                <motion.dd className={styles.legendValue} variants={statLineVariants}>
                  {t.region}
                </motion.dd>
              </motion.div>

              <motion.div variants={statCardVariants}>
                <motion.dt className={styles.legendLabel} variants={statLineVariants}>
                  {t.timezoneLabel}
                </motion.dt>
                <motion.dd className={`${styles.legendValue} ${styles.coords}`} variants={statLineVariants}>
                  {t.timezone}
                </motion.dd>
              </motion.div>
            </motion.dl>

            <motion.div className={styles.action} variants={statCardVariants}>
              <motion.a
                ref={ctaRef}
                className={styles.cta}
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                variants={statLineVariants}
                whileHover={{ scale: 1.045 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                onMouseEnter={onCtaMouseEnter}
                onMouseMove={onCtaMouseMove}
                onMouseLeave={onCtaMouseLeave}
              >
                <span aria-hidden className={styles.ctaOverlay} />
                <motion.span className={styles.ctaLabel} style={ctaStyle}>
                  {t.directions} <Arrow />
                </motion.span>
              </motion.a>
            </motion.div>
          </motion.figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
