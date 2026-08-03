"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import {
  focusRiseVariants,
  heroCopyVariants,
  heroCurtainVariants,
  heroLinesVariants,
  passThroughVariants,
} from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import styles from "./Hero.module.css";

/* Every figure below is drawn from components/about/data.ts, which marks them
   as real client-supplied headcount — nothing here is invented, and nothing
   here describes the DEPARTMENT structure, which does not exist yet. The lead
   deliberately stops at "how it is organised" without asserting anything about
   the chart underneath it; the chart carries its own placeholder notice. */
const COPY = {
  en: {
    eyebrow: "Our team",
    lines: [
      { text: "The people behind", strong: false },
      { text: "every operation.", strong: true },
    ],
    lead: "Over 200 call center operators, 10 specialized developers, and a dedicated HR department whose only job is finding and training the right people.",
    seeChart: "See the org chart",
    talk: "Talk to us",
    signals: ["Call Center", "Operations", "Systems", "HR"],
  },
  es: {
    eyebrow: "Nuestro equipo",
    lines: [
      { text: "La gente detrás", strong: false },
      { text: "de cada operación.", strong: true },
    ],
    lead: "Más de 200 operadores de call center, 10 programadores especializados y un departamento de RRHH dedicado exclusivamente a buscar y formar a la gente correcta.",
    seeChart: "Ver el organigrama",
    talk: "Hablemos",
    signals: ["Call Center", "Operaciones", "Sistemas", "RRHH"],
  },
};

export default function Hero({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];

  return (
    <header data-hero-boundary className={styles.hero}>
      <div className={container.container}>
        <motion.div
          className={styles.heroCopy}
          variants={heroCopyVariants}
          initial={reduced ? false : "hidden"}
          animate="visible"
        >
          <motion.span className={styles.eyebrow} variants={focusRiseVariants}>
            {t.eyebrow}
          </motion.span>

          <motion.h1 className={styles.headline} variants={heroLinesVariants}>
            {t.lines.map((line) => (
              <motion.span key={line.text} className={styles.lineMask} variants={passThroughVariants}>
                <motion.span
                  className={line.strong ? `${styles.line} ${styles.lineStrong}` : styles.line}
                  variants={heroCurtainVariants}
                >
                  {line.text}
                </motion.span>
              </motion.span>
            ))}
          </motion.h1>

          <motion.p className={styles.lead} variants={focusRiseVariants}>
            {t.lead}
          </motion.p>

          <motion.div className={styles.actions} variants={focusRiseVariants}>
            <a href="#chart" className={styles.primaryCta}>
              {t.seeChart} <Arrow direction="down" />
            </a>
            <LocalizedLink href="/quote" className={styles.secondaryCta}>
              {t.talk} <Arrow />
            </LocalizedLink>
          </motion.div>

          <motion.div className={styles.signal} aria-hidden variants={focusRiseVariants}>
            {t.signals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
