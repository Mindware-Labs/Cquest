"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { createTimeline, onScroll, stagger } from "animejs";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { EASE, useAnimeScope } from "../components/anime";
import { TransitionLink } from "@/components/TransitionLink";
import ApplicationForm from "../apply/ApplicationForm";
import {
  EMPLOYMENT_LABEL,
  MODE_LABEL,
  TRACK_LABEL,
  departmentLabel,
  type Position,
} from "../data";
import styles from "./position.module.css";

const COPY = {
  back: "All openings",
  apply: "Apply now",
  responsibilities: "What you will do",
  requirements: "What we ask for",
  niceToHave: "Nice to have",
  panelTitle: "Position details",
  area: "Area",
  location: "Location",
  mode: "Work mode",
  type: "Contract",
  schedule: "Schedule",
  posted: "Posted",
  panelCta: "Apply for this position",
  panelNote: "One screen, about two minutes. Human Resources reviews every application.",
};

export default function PositionDetail({ position }: { position: Position }) {
  const t = COPY;
  const reduced = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);

  /* La ficha entra en dos tiempos: el encabezado al cargar, y los bloques con
     el panel al llegar el scroll. El formulario que va debajo NO se anima: es
     el destino de la página y tiene que estar disponible siempre. */
  useAnimeScope(
    root,
    () => {
      if (reduced) return;

      createTimeline({ defaults: { ease: EASE } }).add(`.${styles.hero} > *`, {
        opacity: [0, 1],
        y: [22, 0],
        duration: 720,
        delay: stagger(80),
      });

      createTimeline({
        defaults: { ease: EASE },
        autoplay: onScroll({ enter: "bottom-=80 top", sync: "play", repeat: false }),
      })
        .add(`.${styles.blocks} > *`, { opacity: [0, 1], y: [24, 0], duration: 660, delay: stagger(110) })
        .add(`.${styles.panel}`, { opacity: [0, 1], y: [24, 0], duration: 720 }, "-=520");
    },
    [reduced],
  );

  const posted = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(position.postedAt));

  const facts: readonly { label: string; value: string }[] = [
    { label: t.area, value: departmentLabel(position.department) },
    { label: t.location, value: position.location },
    { label: t.mode, value: MODE_LABEL[position.mode] },
    { label: t.type, value: EMPLOYMENT_LABEL[position.employmentType] },
    { label: t.schedule, value: position.schedule },
    { label: t.posted, value: posted },
  ];

  return (
    <div ref={root}>
      <header data-hero-boundary className={styles.hero}>
        <div className={container.container}>
          <TransitionLink href="/careers#openings" className={styles.back}>
            {t.back}
          </TransitionLink>
          <p className={styles.track}>{TRACK_LABEL[position.track]}</p>
          <h1 className={styles.title}>{position.title}</h1>
          <p className={styles.summary}>{position.summary}</p>
          <div className={styles.heroActions}>
            <a href="#apply" className={styles.applyCta}>
              {t.apply} <Arrow direction="down" />
            </a>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={`${container.container} ${styles.layout}`}>
          <div className={styles.blocks}>
            <section>
              <h2 className={styles.blockTitle}>{t.responsibilities}</h2>
              <ul className={styles.list}>
                {position.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={styles.blockTitle}>{t.requirements}</h2>
              <ul className={styles.list}>
                {position.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {position.niceToHave.length > 0 && (
              <section>
                <h2 className={styles.blockTitle}>{t.niceToHave}</h2>
                <ul className={styles.list}>
                  {position.niceToHave.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className={styles.panel}>
            <p className={styles.panelTitle}>{t.panelTitle}</p>
            <ul className={styles.facts}>
              {facts.map((fact) => (
                <li key={fact.label} className={styles.fact}>
                  <span className={styles.factLabel}>{fact.label}</span>
                  <span className={styles.factValue}>{fact.value}</span>
                </li>
              ))}
            </ul>
            <a href="#apply" className={styles.panelCta}>
              {t.panelCta} <Arrow direction="down" />
            </a>
            <p className={styles.panelNote}>{t.panelNote}</p>
          </aside>
        </div>
      </div>

      {/* El formulario va EMBEBIDO en la vacante, no en otra ruta: cada salto
          de página pierde candidatos, y la vacante ya lleva el contexto. */}
      <div className={styles.formSection}>
        <div className={container.container}>
          <div className={styles.formWrap}>
            <ApplicationForm
              id="apply"
              positionSlug={position.slug}
              positionTitle={position.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
