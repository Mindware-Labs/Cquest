"use client";

import Image from "next/image";
import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import { TransitionLink } from "@/components/TransitionLink";
import {
  groupVariants,
  mediaRevealVariants,
  mediaSettleVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { WORKS, type Work } from "../data";
import styles from "./WorkSection.module.css";

const MotionLink = motion.create(TransitionLink);

const COPY = {
  title: <>Selected work</>,
  description: "Open the plate for the full case study — the challenge, the system we shipped, and how it works end to end.",
  appScreenshot: "App screenshot",
  caseStudy: (title: string) => `Case study: ${title}`,
  inCuration: (build: string) => `${build} case study — in curation`,
  flagshipTitle: "A flagship build, in curation",
  flagshipSummary: "The full case study — the challenge, the system we built, and the number it moved — is being prepared.",
  measuredResult: "Measured result",
  viewCaseStudy: "View case study",
};

function WorkMedia({ work, featured = false }: { work: Work; featured?: boolean }) {
  const t = COPY;
  return (
    <div className={styles.workMedia} data-featured={featured || undefined}>
      {work.image ? (
        <motion.div className={styles.workReveal} variants={mediaRevealVariants}>
          <motion.div className={styles.workZoom} variants={mediaSettleVariants}>
            <Image
              src={work.image}
              alt={work.alt ?? work.title ?? ""}
              fill
              sizes={featured ? "(max-width: 64rem) 100vw, 45rem" : "(max-width: 64rem) 100vw, 22rem"}
              className={styles.workShot}
            />
          </motion.div>
        </motion.div>
      ) : (
        <div className={styles.workSlot}>
          <span className={styles.workSlotIcon}><ServiceIcon name={work.icon} /></span>
          <span className={styles.workSlotLabel}>{t.appScreenshot}</span>
          <span className={styles.workSlotMeta}>{featured ? "16 : 9 · WebP" : "16 : 10 · WebP"}</span>
        </div>
      )}
      {featured && (
        <>
          <span className={styles.workTick} data-c="tl" aria-hidden />
          <span className={styles.workTick} data-c="tr" aria-hidden />
          <span className={styles.workTick} data-c="bl" aria-hidden />
          <span className={styles.workTick} data-c="br" aria-hidden />
        </>
      )}
    </div>
  );
}

export default function WorkSection({ reduced }: { reduced: boolean }) {
  const t = COPY;
  const featuredWork = WORKS.find((work) => work.featured) ?? WORKS[0];

  return (
    <section id="work" className={styles.workSection}>
      <div className={container.container}>
        <SectionIntro
          title={t.title}
          description={t.description}
          reduced={reduced}
          accentColor="var(--sy-blue)"
        />
        <motion.div
          className={styles.workGallery}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <MotionLink
            href={featuredWork.href}
            className={`${styles.workPlate} ${styles.workFeatured}`}
            variants={softRiseVariants}
            aria-label={featuredWork.title ? t.caseStudy(featuredWork.title) : t.inCuration(featuredWork.build)}
          >
            <WorkMedia work={featuredWork} featured />
            <div className={styles.workCaption}>
              <div className={styles.workTags}>
                <span className={styles.workChip}><ServiceIcon name={featuredWork.icon} />{featuredWork.build}</span>
              </div>
              {featuredWork.title ? (
                <>
                  <h3 className={styles.workTitle}>{featuredWork.title}</h3>
                  {featuredWork.sector && <p className={styles.workSector}>{featuredWork.sector}</p>}
                  {featuredWork.summary && <p className={styles.workSummary}>{featuredWork.summary}</p>}
                </>
              ) : (
                <>
                  <h3 className={styles.workTitle} data-reserved>{t.flagshipTitle}</h3>
                  <p className={styles.workSummary}>{t.flagshipSummary}</p>
                </>
              )}
              <div className={styles.workOutcome}>
                {featuredWork.outcome ? (
                  <span className={styles.workOutcomeValue}>{featuredWork.outcome.value}</span>
                ) : (
                  <span className={styles.workOutcomeValue} data-empty aria-hidden>&mdash;</span>
                )}
                <span className={styles.workOutcomeLabel}>{featuredWork.outcome?.label ?? t.measuredResult}</span>
              </div>
              <span className={styles.workCta}>{t.viewCaseStudy} <Arrow /></span>
            </div>
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
}
