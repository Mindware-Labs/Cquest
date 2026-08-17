"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { EASE_OUT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import PhotoDeck from "./PhotoDeck";
import styles from "./Hero.module.css";

const COPY = {
  en: {
    title: ["Six departments.", "One coordinated operation."],
    lead: "Our team is organized around clear responsibilities, so operations, technology, people and finance move in the same direction.",
    explore: "Explore the departments",
    talk: "Talk to us",
    peopleLabel: "The people behind the operation — Center Quest team at work.",
  },
  es: {
    title: ["Seis departamentos.", "Una operación coordinada."],
    lead: "Nuestro equipo está organizado alrededor de responsabilidades claras, para que las operaciones, la tecnología, la gente y las finanzas avancen en una misma dirección.",
    explore: "Explorar los departamentos",
    talk: "Hablemos",
    peopleLabel: "La gente detrás de la operación — el equipo de Center Quest en su día a día.",
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

        {/* El mapa de los departamentos vivía aquí; ahora lo cuenta el
            organigrama de abajo, que es su sitio natural. El hero enseña a la
            gente. */}
        <PhotoDeck reduced={reduced} label={t.peopleLabel} />
      </div>
    </header>
  );
}
