"use client";

import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import container from "@/components/services/Container.module.css";
import { gsap } from "@/lib/gsap";
import SectorsBeam from "./SectorsBeam";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import styles from "./StorySection.module.css";

const COPY = {
  heading: ["Five sectors.", "One operational discipline."],
  lead: "There's no generic formula. Each sector gets its own SLA, its own protocol, its own trained team.",
};

export default function StorySection({ reduced }: { reduced: boolean }) {
  const t = COPY;
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

        <SectionIntro
          title={
            <>
              {t.heading[0]}
              <br />
              {t.heading[1]}
            </>
          }
          description={t.lead}
          reduced={reduced}
          /* Con filete como el resto de secciones: era la única que abría sin
             él. Petróleo por la regla de los dos azules — superficie clara. */
          accentColor="var(--ab-petroleo)"
        />
        <SectorsBeam reduced={reduced} />
      </div>
    </section>
  );
}
