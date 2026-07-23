"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import Arrow from "@/components/services/Arrow";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import heroCallcenterImage from "@public/hero-callcenter.jpg";
import {
  focusRiseVariants,
  heroCopyVariants,
  heroCurtainVariants,
  heroLinesVariants,
  passThroughVariants,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { HERO_LINES } from "../data";
import styles from "./Hero.module.css";

const COPY = {
  en: {
    alt: "Call center workstations with headsets and keyboards ready for agents",
    lead: "Inbound and outbound contact-center operations designed around the moments that matter to your customers.",
    exploreCapabilities: "Explore capabilities",
    pageHighlights: "Page highlights",
    signals: ["People", "Process", "Technology"],
  },
  es: {
    alt: "Estaciones de trabajo de call center con diademas y teclados listos para los agentes",
    lead: "Operaciones de contact center inbound y outbound diseñadas alrededor de los momentos que más importan a tus clientes.",
    exploreCapabilities: "Explorar capacidades",
    pageHighlights: "Aspectos destacados",
    signals: ["Personas", "Proceso", "Tecnología"],
  },
};

function HeroMedia({ mediaY, mediaScale, alt }: { mediaY: MotionValue<string>; mediaScale: MotionValue<number>; alt: string }) {
  return (
    <div className={styles.heroMedia}>
      <motion.div className={styles.heroMediaParallax} style={{ y: mediaY, scale: mediaScale }} aria-hidden>
        <Image
          src={heroCallcenterImage}
          alt={alt}
          fill
          preload
          placeholder="blur"
          quality={82}
          sizes="(min-width: 64rem) 55vw, 100vw"
          className={styles.heroMediaImg}
        />
      </motion.div>
      <span className={styles.heroMediaTint} aria-hidden />
      <span className={styles.heroMediaScrim} aria-hidden />
    </div>
  );
}

export default function Hero({ reduced }: { reduced: boolean }) {
  const { dict, lang } = useI18n();
  const t = COPY[lang];
  // Hero parallax departure — the media zooms and drifts on its own axis while
  // the copy lifts away and dissolves, so leaving the hero reads as depth, not
  // a scroll past a static banner.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(heroProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "8%"]);
  const mediaScale = useTransform(heroProgress, [0, 1], reduced ? [1, 1] : [1, 1.12]);
  const copyY = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0, -60]);
  const copyOpacity = useTransform(heroProgress, [0, 0.85], reduced ? [1, 1] : [1, 0]);

  return (
    <header ref={heroRef} data-hero-boundary className={styles.hero}>
      <div className={`${container.container} ${styles.heroGrid}`}>
        <motion.div
          className={styles.heroCopy}
          style={{ y: copyY, opacity: copyOpacity }}
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
            <LocalizedLink href="/cotizador?servicio=call-center" className={styles.primaryCta}>{dict.hero.primaryCta} <Arrow /></LocalizedLink>
            <a href="#capabilities" className={styles.secondaryCta}>{t.exploreCapabilities} <Arrow direction="down" /></a>
          </motion.div>
          <motion.div className={styles.heroSignal} aria-label={t.pageHighlights} variants={focusRiseVariants}>
            {t.signals.map((signal) => <span key={signal}>{signal}</span>)}
          </motion.div>
        </motion.div>
        <HeroMedia mediaY={mediaY} mediaScale={mediaScale} alt={t.alt} />
      </div>
    </header>
  );
}
