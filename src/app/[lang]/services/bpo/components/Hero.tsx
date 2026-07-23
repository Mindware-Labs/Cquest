"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Arrow from "@/components/services/Arrow";
import {
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

export default function Hero({ reduced }: { reduced: boolean }) {
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
            {HERO_LINES.map((line) => (
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
            Back office, data processing and omnichannel support — the
            repeatable work of your operation, run accurately at volume.
          </motion.p>
          <motion.div
            className={styles.heroActions}
            variants={focusRiseVariants}
          >
            <Link href="/cotizador?servicio=bpo" className={styles.primaryCta}>
              Give us a quest <Arrow />
            </Link>
            <a href="#capabilities" className={styles.secondaryCta}>
              Explore capabilities <Arrow direction="down" />
            </a>
          </motion.div>
        </motion.div>
        {/* softRise (opacity/blur only) keeps the transform channel free for
            the scroll-linked metaY — variant and MotionValue never fight. */}
        <motion.aside
          className={styles.heroMeta}
          variants={softRiseVariants}
          style={{ y: metaY }}
          aria-label="Operating scope"
        >
          <span className={styles.heroMetaLabel}>Operating scope</span>
          <ul className={styles.heroMetaList}>
            <li>Back office</li>
            <li>Data processing</li>
            <li>Omnichannel</li>
            <li>Quality &amp; risk</li>
          </ul>
          <p className={styles.heroMetaNote}>
            Every engagement runs under a documented SLA — accuracy, turnaround
            and coverage, agreed before launch.
          </p>
        </motion.aside>
      </motion.div>
    </header>
  );
}
