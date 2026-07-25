"use client";

import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { CQ_EASE, gsap } from "@/lib/gsap";
import BusinessLinesBeam from "./BusinessLinesBeam";
import {
  CURTAIN,
  DETAIL_DURATION,
  REVEAL_DURATION,
  REVEAL_FROM,
  REVEAL_START,
  REVEAL_TO,
  SCRUB,
  useIsomorphicLayoutEffect,
} from "./motion";
import styles from "./StorySection.module.css";

const COPY = {
  en: {
    heading: "Built to be a Dominican operations partner",
    description:
      "Center Quest exists to run the operations that keep other companies running — call center, back office and the systems that connect them.",
    body: [
      "We work across three business lines — Call Center, BPO and Systems Development — because most operations problems don't respect the line between people, process and software. A collections team needs the right script and the right dashboard. A back-office queue needs the right process and the right people trained on it.",
      "Clients bring us the operation they need run well; we bring the people, the protocols and the technology to run it — and the reporting to prove it's working.",
    ],
    missionLabel: "Mission",
    mission: "We power operations. Our clients drive growth.",
  },
  es: {
    heading: "Construidos para ser un aliado dominicano de operaciones",
    description:
      "Center Quest existe para gestionar las operaciones que mantienen funcionando a otras empresas — call center, back office y los sistemas que los conectan.",
    body: [
      "Trabajamos en tres líneas de negocio — Call Center, BPO y Desarrollo de Sistemas — porque la mayoría de los problemas operativos no respetan la línea entre personas, proceso y software. Un equipo de cobros necesita el guion correcto y el dashboard correcto. Una cola de back office necesita el proceso correcto y a la gente correcta capacitada en él.",
      "Los clientes nos traen la operación que necesitan gestionar bien; nosotros aportamos las personas, los protocolos y la tecnología para gestionarla — y los reportes para demostrar que funciona.",
    ],
    missionLabel: "Misión",
    mission: "Nosotros impulsamos las operaciones. Nuestros clientes impulsan el crecimiento.",
  },
};

export default function StorySection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLSpanElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  /* Story sets the tone for everything below it, so it carries the most
     deliberate choreography in About — one ScrollTrigger timeline, staged in
     the order the layout reads:

       1. Body paragraphs wipe open from their bottom edge (the curtain
          gesture heroCurtainVariants uses for hero lines) while rising out of
          blur — text arrives like it is being set, not switched on.
       2. The mission card lands a beat later on the opposite edge — clipped
          from the top, so its 3px celeste border draws down into place — and
          settles out of a slight overscale, borrowing mediaSettleVariants'
          language so it reads as a framed object rather than a fading box.
       3. Its label and mission line cascade up inside it once the frame has
          landed: the same card → inner-lines order as statCardVariants.

     Only transform / opacity / clip-path / filter are touched, so no step of
     the sequence can shift layout. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Scoped to the section explicitly: gsap.context() scopes selector text
      // passed *to a tween*, but gsap.utils.toArray() queries the document
      // unless it is handed a scope of its own.
      const scope = sectionRef.current;
      const paragraphs = gsap.utils.toArray<HTMLElement>(`.${styles.storyBody} p`, scope);
      const missionLines = gsap.utils.toArray<HTMLElement>(`.${styles.missionCard} > *`, scope);

      const tl = gsap.timeline({
        defaults: { ease: CQ_EASE },
        scrollTrigger: { trigger: gridRef.current, start: REVEAL_START, once: true },
      });

      tl.fromTo(
        paragraphs,
        { ...REVEAL_FROM, clipPath: CURTAIN.fromBottom },
        { ...REVEAL_TO, clipPath: CURTAIN.open, duration: REVEAL_DURATION, stagger: 0.12 },
      )
        .fromTo(
          missionRef.current,
          { autoAlpha: 0, scale: 1.04, clipPath: CURTAIN.fromTop },
          { autoAlpha: 1, scale: 1, clipPath: CURTAIN.open, duration: 1.05 },
          "-=0.6",
        )
        .fromTo(
          missionLines,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: DETAIL_DURATION, stagger: 0.09 },
          "-=0.45",
        );

      /* The diagram gets its own trigger rather than a slot in the timeline
         above: it sits a full block lower, so chaining it would fire the
         reveal while it is still off-screen.

         Deliberately y + opacity + blur only — no scale, no clip. The beams
         measure their endpoints with getBoundingClientRect and only
         re-measure when the ResizeObserver fires, which transforms do not
         trigger; a uniform translate moves container and endpoints together
         so the relative geometry survives, whereas a scale would leave the
         paths measured against a box that no longer exists. */
      gsap.fromTo(
        beamRef.current,
        REVEAL_FROM,
        {
          ...REVEAL_TO,
          duration: REVEAL_DURATION,
          ease: CQ_EASE,
          scrollTrigger: { trigger: beamRef.current, start: REVEAL_START, once: true },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  /* Two decorative layers share one smoothed scrub:
       • the mission card lags the scroll a few percent — a weighted
         counter-parallax against the body copy beside it;
       • a cold celeste aura drifts the other way behind the grid, the only
         lighting in this otherwise flat, paper-white section.
     Smoothed scrub rather than `true`, so both trail the scrollbar and settle
     instead of tracking it 1:1 like a readout. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const scrollTrigger = {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: SCRUB,
      } as const;

      gsap.fromTo(missionRef.current, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger });
      gsap.fromTo(
        auraRef.current,
        { yPercent: 14, scale: 0.94 },
        { yPercent: -14, scale: 1.06, ease: "none", scrollTrigger },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="story" ref={sectionRef} className={styles.storySection}>
      {!reduced && (
        <span aria-hidden className={styles.storyAura}>
          <span ref={auraRef} className={styles.storyAuraLight} />
        </span>
      )}
      <div className={container.container}>
        {/* No accent rule here — this is the first heading after the carousel
            and reads better opening straight on the type. `accentColor` is
            dropped with it, since the rule was the only thing it fed. */}
        <SectionIntro title={t.heading} description={t.description} reduced={reduced} rule={false} />
        <div ref={gridRef} className={styles.storyGrid}>
          <div className={styles.storyBody}>
            {t.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div ref={missionRef} className={styles.missionCard}>
            <span className={styles.missionLabel}>{t.missionLabel}</span>
            <p className={styles.missionText}>{t.mission}</p>
          </div>
        </div>
        {/* The body copy's convergence claim, drawn. Sits directly under the
            grid so the paragraph and its diagram are read as one statement. */}
        <div ref={beamRef} className={styles.storyBeam}>
          <BusinessLinesBeam reduced={reduced} />
        </div>
      </div>
    </section>
  );
}
