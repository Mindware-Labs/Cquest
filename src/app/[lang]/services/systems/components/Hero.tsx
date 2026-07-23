"use client";

import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import Arrow from "@/components/services/Arrow";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import devHeroImage from "@public/apps/dev-hero.jpeg";
import {
  EASE_OUT,
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
    lead: "CRMs, dashboards and operations automation built around how your business actually works — not the other way around.",
    seeWhatWeBuild: "See what we build",
    pageHighlights: "Page highlights",
    signals: ["CRMs", "Dashboards", "Automation", "AI"],
    windowAlt: "Center Quest operations platform — dashboard with call volume, agent activity and follow-up accountability",
  },
  es: {
    lead: "CRMs, dashboards y automatización de operaciones construidos según cómo realmente funciona tu negocio — y no al revés.",
    seeWhatWeBuild: "Ve lo que construimos",
    pageHighlights: "Aspectos destacados",
    signals: ["CRMs", "Dashboards", "Automatización", "IA"],
    windowAlt: "Plataforma de operaciones de Center Quest — dashboard con volumen de llamadas, actividad de agentes y seguimiento de responsabilidades",
  },
};

function WindowDots() {
  return (
    <span className={styles.windowDots} aria-hidden>
      <span /><span /><span />
    </span>
  );
}

export default function Hero({ reduced }: { reduced: boolean }) {
  const { dict, lang } = useI18n();
  const t = COPY[lang];
  // The product window arrives tilted in perspective and flattens as the
  // page scrolls — the deliverable settling onto the desk. Transforms are
  // owned by these MotionValues; the entrance variants only touch
  // opacity/filter so the two never fight over the same channel.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end 30%"],
  });
  const smoothProgress = useSpring(heroProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const windowRotateX = useTransform(smoothProgress, [0, 0.7], reduced ? [0, 0] : [9, 0]);
  const windowY = useTransform(smoothProgress, [0, 0.7], reduced ? [0, 0] : [0, -26]);
  const windowScale = useTransform(smoothProgress, [0, 0.7], reduced ? [1, 1] : [1, 1.025]);

  return (
    <header ref={heroRef} data-hero-boundary className={styles.hero}>
      <div className={container.container}>
        <motion.div
          className={styles.heroCopy}
          variants={heroCopyVariants}
          initial={reduced ? false : "hidden"}
          animate="visible"
        >
          <motion.h1 className={styles.heroHeadline} variants={heroLinesVariants}>
            {HERO_LINES[lang].map((line) => (
              <motion.span key={line.text} className={styles.heroLineMask} variants={passThroughVariants}>
                <motion.span className={line.strong ? `${styles.heroLine} ${styles.heroHeadlineStrong}` : styles.heroLine} variants={heroCurtainVariants}>{line.text}</motion.span>
              </motion.span>
            ))}
          </motion.h1>
          <motion.p className={styles.heroLead} variants={focusRiseVariants}>{t.lead}</motion.p>
          <motion.div className={styles.heroActions} variants={focusRiseVariants}>
            <LocalizedLink href="/cotizador?servicio=systems" className={styles.primaryCta}>{dict.hero.primaryCta} <Arrow /></LocalizedLink>
            <a href="#capabilities" className={styles.secondaryCta}>{t.seeWhatWeBuild} <Arrow direction="down" /></a>
          </motion.div>
          <motion.div className={styles.heroSignal} aria-label={t.pageHighlights} variants={focusRiseVariants}>
            {t.signals.map((signal) => <span key={signal}>{signal}</span>)}
          </motion.div>
        </motion.div>
      </div>
      <div className={styles.windowStage}>
        <motion.div
          className={styles.window}
          style={{ rotateX: windowRotateX, y: windowY, scale: windowScale }}
          initial={reduced ? false : "hidden"}
          animate="visible"
          variants={softRiseVariants}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.55 }}
        >
          <div className={styles.windowBar}>
            <WindowDots />
            <span className={styles.windowAddress}>app.centerquest.com.do/operations</span>
          </div>
          <div className={styles.windowBody}>
            <Image
              src={devHeroImage}
              alt={t.windowAlt}
              fill
              quality={82}
              placeholder="blur"
              preload
              sizes="(min-width: 64rem) 62rem, 100vw"
              className={styles.windowShot}
            />
          </div>
        </motion.div>
      </div>
    </header>
  );
}
