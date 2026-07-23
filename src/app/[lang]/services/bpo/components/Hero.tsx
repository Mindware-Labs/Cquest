"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Arrow from "@/components/services/Arrow";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import {
  focusRiseVariants,
  heroCopyVariants,
  heroCurtainVariants,
  heroLinesVariants,
  passThroughVariants,
  softRiseVariants,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { HERO_LINES } from "../data";
import styles from "./Hero.module.css";

const COPY = {
  en: {
    lead: "Back office, data processing and omnichannel support — the repeatable work of your operation (BPO), run accurately at volume.",
    exploreCapabilities: "Explore capabilities",
    operatingScope: "Operating scope",
    scopeItems: ["Back office", "Data processing", "Omnichannel", "Quality & risk"],
    note: "Every engagement runs under a documented SLA — accuracy, turnaround and coverage, agreed before launch.",
  },
  es: {
    lead: "Back office, procesamiento de datos y soporte omnicanal — el trabajo repetible de tu operación (BPO), ejecutado con precisión a volumen.",
    exploreCapabilities: "Explorar capacidades",
    operatingScope: "Alcance operativo",
    scopeItems: ["Back office", "Procesamiento de datos", "Omnicanal", "Calidad y riesgo"],
    note: "Cada proyecto opera bajo un SLA documentado — precisión, tiempo de entrega y cobertura, acordados antes del lanzamiento.",
  },
};

export default function Hero({ reduced }: { reduced: boolean }) {
  const { dict, lang } = useI18n();
  const t = COPY[lang];
  // Hero departure with depth — as the page scrolls, the copy lifts away and
  // dissolves while the scope card trails at a slower rate, so leaving the
  // hero reads as two planes separating rather than one block scrolling by.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0, -58]);
  const copyOpacity = useTransform(heroProgress, [0, 0.85], reduced ? [1, 1] : [1, 0]);
  const metaY = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0, -26]);

  return (
    <header ref={heroRef} data-hero-boundary className={styles.hero}>
      <motion.div
        className={`${container.container} ${styles.heroInner}`}
        variants={heroCopyVariants}
        initial={reduced ? false : "hidden"}
        animate="visible"
      >
        <motion.div className={styles.heroCopy} style={{ y: copyY, opacity: copyOpacity }}>
          <motion.h1
            className={styles.heroHeadline}
            variants={heroLinesVariants}
          >
            {HERO_LINES[lang].map((line) => (
              <motion.span
                key={line.text}
                className={styles.heroLineMask}
                variants={passThroughVariants}
              >
                <motion.span
                  className={
                    line.strong
                      ? `${styles.heroLine} ${styles.heroHeadlineStrong}`
                      : styles.heroLine
                  }
                  variants={heroCurtainVariants}
                >
                  {line.text}
                </motion.span>
              </motion.span>
            ))}
          </motion.h1>
          <motion.p className={styles.heroLead} variants={focusRiseVariants}>
            {t.lead}
          </motion.p>
          <motion.div
            className={styles.heroActions}
            variants={focusRiseVariants}
          >
            <LocalizedLink href="/cotizador?servicio=bpo" className={styles.primaryCta}>
              {dict.hero.primaryCta} <Arrow />
            </LocalizedLink>
            <a href="#capabilities" className={styles.secondaryCta}>
              {t.exploreCapabilities} <Arrow direction="down" />
            </a>
          </motion.div>
        </motion.div>
        {/* softRise (opacity/blur only) keeps the transform channel free for
            the scroll-linked metaY — variant and MotionValue never fight. */}
        <motion.aside
          className={styles.heroMeta}
          variants={softRiseVariants}
          style={{ y: metaY }}
          aria-label={t.operatingScope}
        >
          <span className={styles.heroMetaLabel}>{t.operatingScope}</span>
          <ul className={styles.heroMetaList}>
            {t.scopeItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className={styles.heroMetaNote}>
            {t.note}
          </p>
        </motion.aside>
      </motion.div>
    </header>
  );
}
