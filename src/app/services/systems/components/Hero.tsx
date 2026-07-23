"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import Arrow from "@/components/services/Arrow";
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
import { HERO_LINES } from "../data";
import styles from "./Hero.module.css";

function WindowDots() {
  return (
    <span className={styles.windowDots} aria-hidden>
      <span /><span /><span />
    </span>
  );
}

export default function Hero({ reduced }: { reduced: boolean }) {
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
            {HERO_LINES.map((line) => (
              <motion.span key={line.text} className={styles.heroLineMask} variants={passThroughVariants}>
                <motion.span className={line.strong ? `${styles.heroLine} ${styles.heroHeadlineStrong}` : styles.heroLine} variants={heroCurtainVariants}>{line.text}</motion.span>
              </motion.span>
            ))}
          </motion.h1>
          <motion.p className={styles.heroLead} variants={focusRiseVariants}>CRMs, dashboards and operations automation built around how your business actually works — not the other way around.</motion.p>
          <motion.div className={styles.heroActions} variants={focusRiseVariants}>
            <Link href="/cotizador?servicio=systems" className={styles.primaryCta}>Give us a quest <Arrow /></Link>
            <a href="#capabilities" className={styles.secondaryCta}>See what we build <Arrow direction="down" /></a>
          </motion.div>
          <motion.div className={styles.heroSignal} aria-label="Page highlights" variants={focusRiseVariants}>
            <span>CRMs</span><span>Dashboards</span><span>Automation</span><span>AI</span>
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
              src="/apps/dev-hero.jpeg"
              alt="Center Quest operations platform — dashboard with call volume, agent activity and follow-up accountability"
              fill
              quality={100}
              sizes="(min-width: 64rem) 62rem, 100vw"
              className={styles.windowShot}
              priority
            />
          </div>
        </motion.div>
      </div>
    </header>
  );
}
