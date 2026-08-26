"use client";

import { motion, useReducedMotion } from "motion/react";
import CompassMark from "./CompassMark";
import { textGroupVariants } from "./animation";
import { EASE_OUT, focusRiseVariants, ruleXVariants } from "@/components/services/motion";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import { TransitionLink } from "@/components/TransitionLink";
import { dict } from "@/lib/dictionary";
import styles from "./NotFoundScene.module.css";

const COPY = {
  eyebrow: "404",
  title: "This page took a different route.",
  lead: "The page you're looking for doesn't exist, or it moved. Let's get you back on track.",
  cta: "Back to home",
};

export default function NotFoundScene() {
  const t = COPY;
  const reduced = useReducedMotion() ?? false;
  const tabVisible = useTabVisibility();
  const ambient = tabVisible && !reduced;

  return (
    <section className={styles.scene}>
      <div aria-hidden className={styles.field} />
      <span aria-hidden className={styles.ghostNumeral}>404</span>
      <div aria-hidden className={`${styles.grain} cq-noise`} />

      <div className={styles.content}>
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <CompassMark reduced={reduced} ambient={ambient} />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4"
          initial={reduced ? false : "hidden"}
          animate="visible"
          variants={textGroupVariants}
        >
          <motion.span aria-hidden variants={ruleXVariants} className={styles.rule} />

          <motion.span
            variants={focusRiseVariants}
            className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-petroleo"
          >
            {t.eyebrow}
          </motion.span>

          <motion.h1
            variants={focusRiseVariants}
            className="max-w-lg text-pretty font-heading text-3xl font-medium text-foreground sm:text-4xl"
          >
            {t.title}
          </motion.h1>

          <motion.p variants={focusRiseVariants} className="max-w-md text-pretty text-muted">
            {t.lead}
          </motion.p>

          <motion.div variants={focusRiseVariants} className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 420, damping: 26 }}>
              <TransitionLink
                href="/"
                className="cq-rect-cta inline-flex items-center bg-petroleo px-6 py-3 text-white shadow-[0_2px_10px_-4px_rgba(15,32,40,0.35)] transition-shadow duration-500 hover:shadow-[0_14px_28px_-8px_rgba(15,32,40,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
              >
                {t.cta}
              </TransitionLink>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 420, damping: 26 }}>
              <TransitionLink
                href="/quote"
                className="cq-rect-cta inline-flex items-center border border-border bg-transparent px-6 py-3 text-foreground transition-colors duration-300 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
              >
                {dict.common.contactUs}
              </TransitionLink>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
