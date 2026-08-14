"use client";

import { useRef } from "react";
import { createTimeline, splitText, stagger } from "animejs";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { EASE, useAnimeScope } from "./anime";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import HeroBoard from "./HeroBoard";
import styles from "./Hero.module.css";

/* Sin cifras: ni sedes, ni departamentos, ni conteo de vacantes. Nadie ha
   confirmado esos números y una portada de empleos que los afirma queda
   desmentida por el propio listado en cuanto Recursos Humanos publique el
   contenido real. Lo único que se afirma aquí es lo que sí es cierto: dónde
   se trabaja y que la formación corre por nuestra cuenta. */
const COPY = {
  en: {
    eyebrow: "Careers at Center Quest",
    title: ["Your first job", "or your next one."],
    lead: "We hire in Santo Domingo — from entry-level agents with no experience to the specialists who run the operation. If you want to grow, this is a place that trains you.",
    openings: "See open positions",
    talent: "Send your CV",
  },
  es: {
    eyebrow: "Empleos en Center Quest",
    title: ["Tu primer empleo,", "o el siguiente."],
    lead: "Contratamos en Santo Domingo — desde agentes de primer empleo sin experiencia hasta los especialistas que dirigen la operación. Si quieres crecer, aquí te formamos.",
    openings: "Ver vacantes abiertas",
    talent: "Enviar tu CV",
  },
};

export default function Hero({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const root = useRef<HTMLElement>(null);

  /* El titular se parte en palabras y cada una sube desde detrás de su propia
     línea, como un telón por palabra. Es el gesto más fuerte de la página y
     está donde debe estar: la primera frase que se lee.

     `accessible` deja el texto original para lectores de pantalla, así que
     partirlo no cuesta semántica. */
  useAnimeScope(
    root,
    () => {
      if (reduced) return;

      const headline = splitText(`.${styles.headline}`, {
        words: { wrap: "clip" },
        chars: false,
        accessible: true,
      });

      createTimeline({ defaults: { ease: EASE } })
        .add(`.${styles.eyebrow}`, { opacity: [0, 1], y: [14, 0], duration: 620 })
        .add(
          headline.words,
          { y: ["112%", "0%"], duration: 1050, delay: stagger(70) },
          "-=380",
        )
        .add(
          `.${styles.lead}, .${styles.actions}`,
          { opacity: [0, 1], y: [22, 0], duration: 760, delay: stagger(110) },
          "-=700",
        );
    },
    [reduced],
  );

  return (
    <header ref={root} data-hero-boundary className={styles.hero}>
      <div className={`${container.container} ${styles.layout}`}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h1 className={styles.headline}>
            <span>{t.title[0]}</span>
            <strong>{t.title[1]}</strong>
          </h1>
          <p className={styles.lead}>{t.lead}</p>

          <div className={styles.actions}>
            <a href="#openings" className={styles.primaryCta}>
              {t.openings} <Arrow direction="down" />
            </a>
            <LocalizedLink href="/careers/apply" className={styles.secondaryCta}>
              {t.talent} <Arrow />
            </LocalizedLink>
          </div>
        </div>

        <HeroBoard reduced={reduced} />
      </div>
    </header>
  );
}
