"use client";

import Image from "next/image";
import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import {
  groupVariants,
  mediaRevealVariants,
  mediaSettleVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { WORKS, type Work } from "../data";
import styles from "./WorkSection.module.css";

const MotionLink = motion.create(LocalizedLink);

const COPY = {
  en: {
    title: <>Selected work</>,
    description: "Open the plate for the full case study — the challenge, the system we shipped, and how it works end to end.",
    appScreenshot: "App screenshot",
    caseStudy: (title: string) => `Case study: ${title}`,
    inCuration: (build: string) => `${build} case study — in curation`,
    flagshipTitle: "A flagship build, in curation",
    flagshipSummary: "The full case study — the challenge, the system we built, and the number it moved — is being prepared.",
    measuredResult: "Measured result",
    viewCaseStudy: "View case study",
  },
  es: {
    title: <>Trabajo seleccionado</>,
    description: "Abre la ficha para ver el caso de éxito completo — el reto, el sistema que entregamos, y cómo funciona de principio a fin.",
    appScreenshot: "Captura de la app",
    caseStudy: (title: string) => `Caso de éxito: ${title}`,
    inCuration: (build: string) => `Caso de éxito de ${build} — en preparación`,
    flagshipTitle: "Un proyecto insignia, en preparación",
    flagshipSummary: "El caso de éxito completo — el reto, el sistema que construimos, y el número que movió — está en preparación.",
    measuredResult: "Resultado medido",
    viewCaseStudy: "Ver caso de éxito",
  },
};

// Media slot for a work plate: a real screenshot once `image` is set, or a
// labeled, reserved placeholder until then. Featured plates carry a 16:9 frame
// with registration ticks; supporting plates a quieter 16:10.
function WorkMedia({ work, featured = false }: { work: Work; featured?: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  return (
    <div className={styles.workMedia} data-featured={featured || undefined}>
      {work.image ? (
        /* The screenshot is revealed inside its frame — the crop wipes open
           upward while the shot settles from a slight overscale. Variants
           inherit the plate's hidden/visible labels, so the reveal rides the
           gallery's own entrance. */
        <motion.div className={styles.workReveal} variants={mediaRevealVariants}>
          <motion.div className={styles.workZoom} variants={mediaSettleVariants}>
            <Image
              src={work.image}
              alt={work.alt?.[lang] ?? work.title?.[lang] ?? ""}
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
  const { lang } = useI18n();
  const t = COPY[lang];
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
            aria-label={featuredWork.title ? t.caseStudy(featuredWork.title[lang]) : t.inCuration(featuredWork.build[lang])}
          >
            <WorkMedia work={featuredWork} featured />
            <div className={styles.workCaption}>
              <div className={styles.workTags}>
                <span className={styles.workChip}><ServiceIcon name={featuredWork.icon} />{featuredWork.build[lang]}</span>
              </div>
              {featuredWork.title ? (
                <>
                  <h3 className={styles.workTitle}>{featuredWork.title[lang]}</h3>
                  {featuredWork.sector && <p className={styles.workSector}>{featuredWork.sector[lang]}</p>}
                  {featuredWork.summary && <p className={styles.workSummary}>{featuredWork.summary[lang]}</p>}
                </>
              ) : (
                <>
                  <h3 className={styles.workTitle} data-reserved>{t.flagshipTitle}</h3>
                  <p className={styles.workSummary}>{t.flagshipSummary}</p>
                </>
              )}
              <div className={styles.workOutcome}>
                {featuredWork.outcome ? (
                  <span className={styles.workOutcomeValue}>{featuredWork.outcome.value[lang]}</span>
                ) : (
                  <span className={styles.workOutcomeValue} data-empty aria-hidden>&mdash;</span>
                )}
                <span className={styles.workOutcomeLabel}>{featuredWork.outcome?.label[lang] ?? t.measuredResult}</span>
              </div>
              <span className={styles.workCta}>{t.viewCaseStudy} <Arrow /></span>
            </div>
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
}
