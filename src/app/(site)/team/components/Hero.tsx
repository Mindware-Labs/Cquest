"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { EASE_OUT } from "@/components/services/motion";
import { TransitionLink } from "@/components/TransitionLink";
import PhotoDeck from "./PhotoDeck";
import styles from "./Hero.module.css";

const COPY = {
  title: ["Six departments.", "One coordinated operation."],
  lead: "Our team is organized around clear responsibilities, so operations, technology, people and finance move in the same direction.",
  explore: "Explore the departments",
  talk: "Talk to us",
  peopleLabel: "The people behind the operation — Center Quest team at work.",
};

export default function Hero({ reduced }: { reduced: boolean }) {
  const t = COPY;

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
            <TransitionLink href="/quote" className={styles.secondaryCta}>
              {t.talk} <Arrow />
            </TransitionLink>
          </div>
        </motion.div>

        <PhotoDeck reduced={reduced} label={t.peopleLabel} />
      </div>
    </header>
  );
}
