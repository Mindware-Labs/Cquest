"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import SectionIntro from "@/components/services/SectionIntro";
import { groupVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import { gsap } from "@/lib/gsap";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import { PARTNER_SLOTS } from "./partnershipsData";
import styles from "./PartnershipsSection.module.css";

const COPY = {
  en: {
    heading: "Partnerships",
    lead:
      "Strategic relationships with specialized teams whose expertise complements ours and expands what we can build together.",
    directory: "Partnership profile",
    description:
      "A software engineering team focused on designing, building and maintaining digital products and operational systems.",
    viewProfile: "View partnership",
  },
  es: {
    heading: "Partnerships",
    lead:
      "Relaciones estratégicas con equipos especializados cuya experiencia complementa la nuestra y amplía lo que podemos desarrollar juntos.",
    directory: "Perfil de alianza",
    description:
      "Un equipo de ingeniería de software enfocado en diseñar, construir y mantener productos digitales y sistemas para operaciones.",
    viewProfile: "Ver alianza",
  },
};

export default function PartnershipsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const auraRef = useRef<HTMLSpanElement>(null);

  /* The section's celeste corner wash used to be baked straight into the
     background — the one About band that moved nothing on scroll, closing
     the page's whole narrative on a frozen note next to StorySection's own
     scrubbed aura one band up. Same device, verbatim: a parallaxed light
     behind the content, too faint to notice as an effect on its own. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        auraRef.current,
        { yPercent: 14, scale: 0.94 },
        {
          yPercent: -14,
          scale: 1.06,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: SCRUB,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="partnerships" ref={sectionRef} className={styles.partnershipsSection}>
      {!reduced && (
        <span aria-hidden className={styles.partnershipsAura}>
          <span ref={auraRef} className={styles.partnershipsAuraLight} />
        </span>
      )}
      <div className={container.container}>
        <SectionIntro
          title={t.heading}
          description={t.lead}
          reduced={reduced}
          accentColor="var(--ab-celeste)"
        />

        <motion.div
          className={styles.registry}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div className={styles.registryHeader} variants={stepVariants}>
            <span>{t.directory}</span>
          </motion.div>

          <motion.ul className={styles.partnerList} variants={groupVariants}>
            {PARTNER_SLOTS.map((partner) => (
              <motion.li key={partner.slug} variants={stepVariants}>
                <LocalizedLink
                  href={`/partnerships/${partner.slug}`}
                  prefetch={false}
                  className={styles.partnerRow}
                  aria-label={`${t.viewProfile}: ${partner.name[lang]}`}
                >
                  <span className={styles.logoFrame}>
                    <Image
                      src={partner.logo.src}
                      alt={`${partner.name[lang]} logo`}
                      width={partner.logo.width}
                      height={partner.logo.height}
                      sizes="(max-width: 672px) 144px, 184px"
                      className={styles.logoImage}
                    />
                  </span>

                  <span className={styles.identity}>
                    <span className={styles.companyName}>{partner.name[lang]}</span>
                  </span>

                  <span className={styles.description}>{t.description}</span>

                  <span className={styles.profileAction}>
                    {t.viewProfile}
                    <Arrow className={styles.rowArrow} />
                  </span>
                </LocalizedLink>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
