"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
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

const MotionLink = motion.create(Link);

export default function Hero({ reduced }: { reduced: boolean }) {
  return (
    <header data-hero-boundary className={styles.hero}>
      <motion.div
        className={`${container.container} ${styles.heroInner}`}
        variants={heroCopyVariants}
        initial={reduced ? false : "hidden"}
        animate="visible"
      >
        <div className={styles.heroCopy}>
          <MotionLink
            href="/#services"
            className={styles.breadcrumb}
            variants={focusRiseVariants}
          >
            Services <span aria-hidden>/</span> BPO
          </MotionLink>
          <motion.div className={styles.liveLine} variants={focusRiseVariants}>
            <span aria-hidden />
            Business Process Outsourcing under clear SLAs
          </motion.div>
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
              Request a quote <Arrow />
            </Link>
            <a href="#capabilities" className={styles.secondaryCta}>
              Explore capabilities <Arrow direction="down" />
            </a>
          </motion.div>
        </div>
        <motion.aside
          className={styles.heroMeta}
          variants={focusRiseVariants}
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
