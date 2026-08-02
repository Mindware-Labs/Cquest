"use client";

import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { CQ_EASE, gsap } from "@/lib/gsap";
import SectorsBeam from "./SectorsBeam";
import {
  CURTAIN,
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
    heading: "Five sectors. One operational discipline.",
    body: [
      "Health, Banking & Finance, Retail & E-Commerce, Telecommunications, Tourism & Hospitality — industries with zero tolerance for a mishandled call, a late report, or a compliance gap.",
      "There's no generic formula. Each sector gets its own SLA, its own protocol, its own trained team.",
    ],
    quote: "People who know the rules. Process that gets measured. Reporting that hides nothing.",
  },
  es: {
    heading: "Cinco sectores. Una misma disciplina operativa.",
    body: [
      "Salud, Banca y Finanzas, Retail y E-Commerce, Telecomunicaciones, Turismo y Hospitalidad: industrias que no perdonan una llamada mal atendida, un reporte tarde o un proceso fuera de cumplimiento.",
      "No tenemos una fórmula genérica. Cada sector tiene su propio SLA, su propio protocolo, su propio equipo capacitado.",
    ],
    quote: "Gente que conoce las reglas. Procesos que se miden. Reportes que no esconden nada.",
  },
};

export default function StorySection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (reduced || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Scoped to the section explicitly: gsap.context() scopes selector text
      // passed *to a tween*, but gsap.utils.toArray() queries the document
      // unless it is handed a scope of its own.
      const scope = sectionRef.current;
      const paragraphs = gsap.utils.toArray<HTMLElement>(`.${styles.storyBody} p`, scope);
      const quoteCard = sectionRef.current?.querySelector(`.${styles.quoteCard}`) ?? null;

      const tl = gsap.timeline({
        defaults: { ease: CQ_EASE },
        scrollTrigger: { trigger: gridRef.current, start: REVEAL_START, once: true },
      });

      tl.fromTo(
        paragraphs,
        { ...REVEAL_FROM, clipPath: CURTAIN.fromBottom },
        { ...REVEAL_TO, clipPath: CURTAIN.open, duration: REVEAL_DURATION, stagger: 0.12 },
      ).fromTo(
        quoteCard,
        // Enters slightly detached from the paragraphs beside it: a short
        // horizontal travel and a shadow it sheds on landing, so it reads as
        // a separate object settling in rather than a third column of the
        // same block fading up.
        { autoAlpha: 0, x: 26, scale: 1.03, clipPath: CURTAIN.fromTop, "--entry-shadow": 0.3 },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          clipPath: CURTAIN.open,
          "--entry-shadow": 0,
          duration: 0.85,
        },
        "-=0.55",
      );

      /* The diagram used to get a reveal of its own here — y + opacity +
         blur, on its own ScrollTrigger. It owns its entry now: SectorsBeam
         runs a GSAP timeline that boots the core, draws each connection and
         lands each sector with the pulse that arrives on it.

         Removing this was not tidying. Two triggers were animating the same
         subtree, and this one blurred the entire diagram — the largest
         surface in the section — for 0.9s across exactly the frames in which
         the spokes are drawing themselves. A 10px blur is a full-surface
         repaint per frame, and it was being paid on top of the draw. */
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (reduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const scrollTrigger = {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: SCRUB,
      } as const;

      gsap.fromTo(
        auraRef.current,
        { yPercent: 14, scale: 0.94 },
        { yPercent: -14, scale: 1.06, ease: "none", scrollTrigger },
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
        {/* No accent rule here — this is the first heading after the carousel
            and reads better opening straight on the type. `accentColor` is
            dropped with it, since the rule was the only thing it fed. */}
        <SectionIntro title={t.heading} reduced={reduced} rule={false} />
        <div ref={gridRef} className={styles.storyGrid}>
          <div className={styles.storyBody}>
            {t.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className={styles.quoteCard}>
            <span aria-hidden className={styles.quoteMark}>&ldquo;</span>
            <p className={styles.quoteText}>{t.quote}</p>
          </div>
        </div>
        <div className={styles.storyBeam}>
          <SectorsBeam reduced={reduced} />
        </div>
      </div>
    </section>
  );
}
