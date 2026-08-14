"use client";

import Image from "next/image";
import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import ServiceIcon from "@/components/services/ServiceIcon";
import { EASE_OUT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { DEPARTMENTS } from "../data";
import styles from "./Hero.module.css";

const COPY = {
  en: {
    title: ["Four departments.", "One coordinated operation."],
    lead: "Our team is organized around clear responsibilities, so operations, technology, people and finance move in the same direction.",
    explore: "Explore the departments",
    talk: "Talk to us",
    mapMeta: "Operating structure",
    mapStatus: "4 connected departments",
  },
  es: {
    title: ["Cuatro departamentos.", "Una operación coordinada."],
    lead: "Nuestro equipo está organizado alrededor de responsabilidades claras, para que las operaciones, la tecnología, la gente y las finanzas avancen en una misma dirección.",
    explore: "Explorar los departamentos",
    talk: "Hablemos",
    mapMeta: "Estructura operativa",
    mapStatus: "4 departamentos conectados",
  },
};

export default function Hero({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];

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
            <span>{t.title[0]}</span>
            <strong>{t.title[1]}</strong>
          </h1>
          <p className={styles.lead}>{t.lead}</p>
          <div className={styles.actions}>
            <a href="#departments" className={styles.primaryCta}>
              {t.explore} <Arrow direction="down" />
            </a>
            <LocalizedLink href="/quote" className={styles.secondaryCta}>
              {t.talk} <Arrow />
            </LocalizedLink>
          </div>
        </motion.div>

        <div className={styles.systemMap} aria-label={t.mapStatus}>
          <div className={styles.mapHeader}>
            <span className={styles.mapIdentity}>
              <Image
                src="/logo.png"
                alt="Center Quest"
                width={692}
                height={512}
                sizes="66px"
                className={styles.mapLogo}
              />
              <span>{t.mapMeta}</span>
            </span>
            <span className={styles.mapStatus}>
              <span aria-hidden className={styles.statusDot} />
              {t.mapStatus}
            </span>
          </div>

          <ul className={styles.mapGrid}>
            {DEPARTMENTS.map((department) => (
              <li key={department.id} className={styles.mapNode}>
                <span className={styles.mapIcon}>
                  <ServiceIcon name={department.icon} />
                </span>
                <span>{department.shortLabel[lang]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
