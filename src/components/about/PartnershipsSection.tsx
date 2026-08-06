"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import SectionIntro from "@/components/services/SectionIntro";
import { groupVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import { PARTNER_SLOTS } from "./partnershipsData";
import styles from "./PartnershipsSection.module.css";

const COPY = {
  en: {
    heading: "Partnerships",
    lead: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    directory: "Partnership profile",
    sampleNote: "Sample content · Profile in development",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
    viewProfile: "View partnership",
    logoPlaceholder: "Logo placeholder",
  },
  es: {
    heading: "Partnerships",
    lead: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    directory: "Perfil de alianza",
    sampleNote: "Contenido de ejemplo · Perfil en desarrollo",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
    viewProfile: "Ver alianza",
    logoPlaceholder: "Espacio para logo",
  },
};

export default function PartnershipsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];

  return (
    <section id="partnerships" className={styles.partnershipsSection}>
      <div className={container.container}>
        <SectionIntro
          title={t.heading}
          description={t.lead}
          reduced={reduced}
          accentColor="var(--ab-celeste)"
        />

        <motion.div
          className={styles.registry}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div className={styles.registryHeader} variants={stepVariants}>
            <span>{t.directory}</span>
            <span>{t.sampleNote}</span>
          </motion.div>

          <motion.ul className={styles.partnerList} variants={groupVariants}>
            {PARTNER_SLOTS.map((partner) => (
              <motion.li key={partner.slug} variants={stepVariants}>
                <LocalizedLink
                  href={`/partnerships/${partner.slug}`}
                  prefetch={false}
                  className={styles.partnerRow}
                  aria-label={`${t.viewProfile}: ${partner.name[lang]}`}
                >
                  <span className={styles.logoFrame} aria-label={t.logoPlaceholder}>
                    <span>Logo</span>
                  </span>

                  <span className={styles.identity}>
                    <span className={styles.companyName}>{partner.name[lang]}</span>
                  </span>

                  <span className={styles.description}>{t.description}</span>

                  <span className={styles.profileAction}>
                    {t.viewProfile}
                    <Arrow className={styles.rowArrow} />
                  </span>
                </LocalizedLink>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
