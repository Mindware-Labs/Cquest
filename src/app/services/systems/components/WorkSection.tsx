"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import {
  groupVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { WORKS, type Work } from "../data";
import styles from "./WorkSection.module.css";

const MotionLink = motion.create(Link);

// Media slot for a work plate: a real screenshot once `image` is set, or a
// labeled, reserved placeholder until then. Featured plates carry a 16:9 frame
// with registration ticks; supporting plates a quieter 16:10.
function WorkMedia({ work, featured = false }: { work: Work; featured?: boolean }) {
  return (
    <div className={styles.workMedia} data-featured={featured || undefined}>
      {work.image ? (
        <Image
          src={work.image}
          alt={work.alt ?? work.title ?? ""}
          fill
          sizes={featured ? "(max-width: 64rem) 100vw, 45rem" : "(max-width: 64rem) 100vw, 22rem"}
          className={styles.workShot}
        />
      ) : (
        <div className={styles.workSlot}>
          <span className={styles.workSlotIcon}><ServiceIcon name={work.icon} /></span>
          <span className={styles.workSlotLabel}>App screenshot</span>
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
  const featuredWork = WORKS.find((work) => work.featured) ?? WORKS[0];

  return (
    <section id="work" className={styles.workSection}>
      <div className={container.container}>
        <SectionIntro
          title={<>Selected work</>}
          description="A recent build. Open the plate for the full case study — the challenge, the system we shipped, and how it works end to end."
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
            aria-label={featuredWork.title ? `Case study: ${featuredWork.title}` : `${featuredWork.build} case study — in curation`}
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
                  <h3 className={styles.workTitle} data-reserved>A flagship build, in curation</h3>
                  <p className={styles.workSummary}>The full case study — the challenge, the system we built, and the number it moved — is being prepared.</p>
                </>
              )}
              <div className={styles.workOutcome}>
                {featuredWork.outcome ? (
                  <span className={styles.workOutcomeValue}>{featuredWork.outcome.value}</span>
                ) : (
                  <span className={styles.workOutcomeValue} data-empty aria-hidden>&mdash;</span>
                )}
                <span className={styles.workOutcomeLabel}>{featuredWork.outcome?.label ?? "Measured result"}</span>
              </div>
              <span className={styles.workCta}>View case study <Arrow /></span>
            </div>
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
}
