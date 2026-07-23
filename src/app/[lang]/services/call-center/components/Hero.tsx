"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import Arrow from "@/components/services/Arrow";
import heroCallcenterImage from "../../../../../public/hero-callcenter.jpg";
import {
  focusRiseVariants,
  heroCopyVariants,
  heroCurtainVariants,
  heroLinesVariants,
  passThroughVariants,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { HERO_LINES } from "../data";
import styles from "./Hero.module.css";

function HeroMedia({ mediaY, mediaScale }: { mediaY: MotionValue<string>; mediaScale: MotionValue<number> }) {
  return (
    <div className={styles.heroMedia}>
      <motion.div className={styles.heroMediaParallax} style={{ y: mediaY, scale: mediaScale }} aria-hidden>
        <Image
          src={heroCallcenterImage}
          alt="Call center workstations with headsets and keyboards ready for agents"
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
            {HERO_LINES.map((line) => (
              <motion.span key={line.text} className={styles.heroLineMask} variants={passThroughVariants}>
                <motion.span className={line.strong ? `${styles.heroLine} ${styles.heroHeadlineStrong}` : styles.heroLine} variants={heroCurtainVariants}>{line.text}</motion.span>
              </motion.span>
            ))}
          </motion.h1>
          <motion.p className={styles.heroLead} variants={focusRiseVariants}>Inbound and outbound contact-center operations designed around the moments that matter to your customers.</motion.p>
          <motion.div className={styles.heroActions} variants={focusRiseVariants}>
            <Link href="/cotizador?servicio=call-center" className={styles.primaryCta}>Give us a quest <Arrow /></Link>
            <a href="#capabilities" className={styles.secondaryCta}>Explore capabilities <Arrow direction="down" /></a>
          </motion.div>
          <motion.div className={styles.heroSignal} aria-label="Page highlights" variants={focusRiseVariants}>
            <span>People</span><span>Process</span><span>Technology</span>
          </motion.div>
        </motion.div>
        <HeroMedia mediaY={mediaY} mediaScale={mediaScale} />
      </div>
    </header>
  );
}
