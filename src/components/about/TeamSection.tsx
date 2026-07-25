"use client";

import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { CQ_EASE, CQ_EASE_SNAP, gsap } from "@/lib/gsap";
import { TEAM_DEVELOPER_FOCUS, TEAM_HR_NOTE, TEAM_SPECIALTIES } from "./data";
import {
  CURTAIN,
  DETAIL_DURATION,
  REVEAL_DURATION,
  REVEAL_FROM,
  REVEAL_START,
  REVEAL_TO,
  useIsomorphicLayoutEffect,
} from "./motion";
import styles from "./TeamSection.module.css";

const COPY = {
  en: {
    heading: "Who makes the operation run",
    description: "Behind every account: developers, HR and the specialist teams that keep it staffed, compliant and improving.",
    specialtiesLabel: "Specialist teams",
  },
  es: {
    heading: "Quiénes hacen andar la operación",
    description: "Detrás de cada cuenta: programadores, RRHH y los equipos especializados que la mantienen con el personal correcto, en cumplimiento y mejorando.",
    specialtiesLabel: "Equipos especializados",
  },
};

export default function TeamSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const factsRef = useRef<HTMLDivElement>(null);

  /* One timeline for the whole block, so the chips are the payoff of a
     sequence rather than an isolated effect firing on its own trigger:

       1. The two team facts wipe in from their left edge, staggered — text
          reads left to right, so it arrives left to right.
       2. The "specialist teams" label lifts just ahead of what it labels.
       3. The chips pop in one at a time, each starting slightly low, small
          and counter-rotated, landing on an overshoot ease. The tight 0.055s
          spacing plus that overshoot is what gives the row its inertia — it
          reads as one gesture rippling across six chips, not six fades.

     The chips keep the flourish ease (CQ_EASE_SNAP) because they are the one
     low-frequency, small-element beat in this section; everything larger
     stays on the site's shared CQ_EASE so the snap reads as punctuation. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !factsRef.current) return;

    const ctx = gsap.context(() => {
      // Scoped explicitly — gsap.context() scopes selector text handed to a
      // tween, but gsap.utils.toArray() queries the document on its own.
      const scope = factsRef.current;
      const facts = gsap.utils.toArray<HTMLElement>(`.${styles.teamFact}`, scope);
      const label = gsap.utils.toArray<HTMLElement>(`.${styles.specialties} > span`, scope);
      const chips = gsap.utils.toArray<HTMLElement>(`.${styles.specialties} li`, scope);

      const tl = gsap.timeline({
        defaults: { ease: CQ_EASE },
        scrollTrigger: { trigger: factsRef.current, start: REVEAL_START, once: true },
      });

      tl.fromTo(
        facts,
        { ...REVEAL_FROM, y: 20, clipPath: CURTAIN.fromLeft },
        { ...REVEAL_TO, clipPath: CURTAIN.open, duration: REVEAL_DURATION, stagger: 0.14 },
      )
        .fromTo(label, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: DETAIL_DURATION }, "-=0.55")
        .fromTo(
          chips,
          { y: 18, scale: 0.72, rotate: -5, autoAlpha: 0 },
          {
            y: 0,
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: CQ_EASE_SNAP,
            stagger: { each: 0.055, from: "start" },
          },
          "-=0.3",
        );
    }, factsRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="team" className={styles.teamSection}>
      <div className={container.container}>
        {/* No accent rule, matching Story and Sectors — no SectionIntro in
            About carries one. The section's petroleo accent still runs on the
            specialties label and chips (see TeamSection.module.css). */}
        <SectionIntro title={t.heading} description={t.description} reduced={reduced} rule={false} />
        <div ref={factsRef} className={styles.teamFacts}>
          <p className={styles.teamFact}>{TEAM_DEVELOPER_FOCUS[lang]}</p>
          <p className={styles.teamFact}>{TEAM_HR_NOTE[lang]}</p>
          <div className={styles.specialties}>
            <span>{t.specialtiesLabel}</span>
            <ul>
              {TEAM_SPECIALTIES[lang].map((item) => (<li key={item}>{item}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
