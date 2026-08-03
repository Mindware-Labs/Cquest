"use client";

import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { gsap } from "@/lib/gsap";
import SectorsBeam from "./SectorsBeam";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import styles from "./StorySection.module.css";

/* ── What this section says, and where it says it ────────────────────────
   This used to be prose left, diagram right: two paragraphs and a pull
   quote in one column, the figure in the other, and the sector's own detail
   opening in a reserved band UNDERNEATH the figure. Three problems, one
   cause — the argument was being made twice.

     • The first paragraph listed the five sectors by name. The diagram names
       all five, on screen, permanently. It has been dropped; nothing was
       lost that the figure was not already saying better.
     • The second paragraph IS the argument — one discipline, five different
       SLAs — so it moves up beside the heading as the section's lead, where
       a claim of that size belongs.
     • The pull quote moves into the detail panel as its resting state (see
       SectorsBeam). It was a conclusion floating beside the evidence; it is
       now the panel's answer until you ask about a specific sector, which
       gives the panel something true to hold at rest and gives the quote a
       job instead of a box.

   What the space bought is the whole point. The figure and its detail now
   sit side by side in one row, and the section fits in a viewport — you
   click a sector and the answer is already on screen, rather than a screen
   below the thing you clicked. */
const COPY = {
  en: {
    heading: "Five sectors. One operational discipline.",
    lead: "There's no generic formula. Each sector gets its own SLA, its own protocol, its own trained team.",
  },
  es: {
    heading: "Cinco sectores. Una misma disciplina operativa.",
    lead: "No tenemos una fórmula genérica. Cada sector tiene su propio SLA, su propio protocolo, su propio equipo capacitado.",
  },
};

export default function StorySection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const auraRef = useRef<HTMLSpanElement>(null);

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
    <section id="sectors" ref={sectionRef} className={styles.storySection}>
      {!reduced && (
        <span aria-hidden className={styles.storyAura}>
          <span ref={auraRef} className={styles.storyAuraLight} />
        </span>
      )}
      <div className={container.container}>
        {/* No accent rule — this is the first heading after the carousel and
            reads better opening straight on the type. With the lead beside it
            the intro is one row rather than a column of prose, which is where
            the vertical budget for the split below comes from. */}
        <SectionIntro title={t.heading} description={t.lead} reduced={reduced} rule={false} />
        <SectorsBeam reduced={reduced} />
      </div>
    </section>
  );
}
