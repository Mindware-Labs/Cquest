"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import HeroHeadline from "@/components/hero/HeroHeadline";
import HeroNav from "@/components/hero/HeroNav";
import HeroReactiveGrid from "@/components/hero/HeroReactiveGrid";
import HeroScrollCue from "@/components/hero/HeroScrollCue";
import QuestBotScene from "@/components/hero/QuestBotScene";
import { useI18n } from "@/i18n/I18nProvider";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import {
  BEAT,
  EASE_OUT_EXPO,
  INTRO_SAFETY_MS,
  leadDelayFor,
  rise,
  ruleVariants,
  SERVICE_QUESTION_INDEX,
} from "@/components/hero/animation";

export default function HeroImage() {
  const { dict } = useI18n();
  const reduced = useReducedMotion() ?? false;

  /* Lo pone HeroNav al pasar por un link de Servicios y lo lee QuestBotScene
     para saltar su burbuja a la pregunta de ese servicio. */
  const [hoveredServiceHref, setHoveredServiceHref] = useState<string | null>(null);
  const pinnedQuestionIndex = hoveredServiceHref
    ? (SERVICE_QUESTION_INDEX[hoveredServiceHref] ?? null)
    : null;

  const leadDelay = leadDelayFor(dict.hero.headline.split(" ").length);
  const cueDelay = leadDelay + 0.28;
  const tabVisible = useTabVisibility();
  const sectionRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  /* Puerta SEPARADA y más tardía que onScreen — ver los observers abajo. */
  const [parallaxLive, setParallaxLive] = useState(true);

  /* Acto uno / acto dos. False = la mascota tiene el hero para ella sola. */
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);
  const restartIntro = useCallback(() => setRevealed(false), []);

  /* Acto cero. Un rAF y no un flip inmediato: el estado oscuro tiene que
     COMMITEARSE un frame o la transición no tiene valor de partida. */
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLit(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* Lenis es el único amortiguador. Un segundo spring encima iría por detrás
     del gesto. */
  const fieldY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 54]);
  const fieldScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.07]);

  /* El rango acaba en 0.55, no en 1: pasado ese punto el telón de servicios
     ya cubre el escenario y todo lo demás se juega a puerta cerrada. */
  const sceneY = useTransform(scrollYProgress, [0, 0.55], reduced ? [0, 0] : [0, -24]);
  const sceneOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.55],
    reduced ? [1, 1, 1] : [1, 0.92, 0.42],
  );

  const cueOpacity = useTransform(
    scrollYProgress,
    [0, 0.12],
    reduced ? [1, 1] : [1, 0],
  );

  /* Dos puertas porque son dos preguntas: onScreen = "¿alguien ve los loops?";
     parallaxLive = "¿los planos siguen MOVIÉNDOSE?" (ver .cq-hero-plane). */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const ambientIo = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "-25% 0px 0px 0px", threshold: 0 },
    );
    const parallaxIo = new IntersectionObserver(
      ([entry]) => setParallaxLive(entry.isIntersecting),
      { rootMargin: "25% 0px 0px 0px", threshold: 0 },
    );
    ambientIo.observe(node);
    parallaxIo.observe(node);
    return () => {
      ambientIo.disconnect();
      parallaxIo.disconnect();
    };
  }, []);

  /* Salidas de emergencia del acto uno: nunca se puede quedar colgado
     (INTRO_SAFETY_MS) ni atrapar a quien ya alargó la mano hacia la página. */
  useEffect(() => {
    if (revealed || reduced) return;

    const cap = window.setTimeout(reveal, INTRO_SAFETY_MS);
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("pointerdown", reveal);
    window.addEventListener("keydown", reveal);

    return () => {
      window.clearTimeout(cap);
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("pointerdown", reveal);
      window.removeEventListener("keydown", reveal);
    };
  }, [revealed, reduced, reveal]);

  const ambient = onScreen && tabVisible && !reduced;

  return (
    <section
      ref={sectionRef}
      id="hero"

      data-onscreen={onScreen ? "true" : "false"}
      data-parallax={parallaxLive ? "true" : "false"}
      data-stage={lit ? "lit" : "dark"}
      data-ambient={ambient ? "on" : "off"}
      /* Publicado a CSS para que el CAMPO también conteste al reveal: el acto
         dos no es solo texto llegando, es el cuarto abriéndose alrededor. */
      data-revealed={revealed ? "true" : "false"}
      className="cq-hero relative isolate flex min-h-svh scroll-mt-20 flex-col overflow-hidden bg-ink text-white"
    >
      <motion.div
        aria-hidden
        style={{ y: fieldY, scale: fieldScale }}
        className="cq-hero-plane pointer-events-none absolute inset-x-0 -inset-y-8"
      >

        <div className="cq-hero-field" />

        <div
          className="cq-hero-ambience"
          data-ambient={ambient ? "on" : "off"}
          data-revealed={revealed ? "true" : "false"}
        >
          <HeroReactiveGrid ambient={ambient && revealed} reduced={reduced} />
        </div>

        {/* Fuera de la ambience a propósito: la textura es la constante del
            cuarto; lo que el reveal sube es la luz. */}
        <span className="cq-field-grain" />

        <div className="cq-hero-vignette" />
      </motion.div>

      <HeroNav
        reduced={reduced}
        revealed={revealed}
        onServiceHover={setHoveredServiceHref}
      />

      {/* Un solo plano con las dos mitades: que el copy y la mascota compartan
          eje tiene que ser estructural, no dos números que hoy coinciden. */}
      <motion.div
        style={{ y: sceneY, opacity: sceneOpacity }}
        className="cq-hero-band cq-hero-plane absolute inset-x-0 bottom-[var(--hero-band-bottom)] top-0 z-10 grid grid-rows-2 items-center px-4 sm:px-6 lg:grid-rows-1 lg:px-8 xl:px-10"
      >

        {/* Primero en el DOM, segundo en el frame: así el copy gana el hit test
            sobre su propio texto en vez del cursor de replay de la mascota. */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.95, ease: EASE_OUT_EXPO, delay: BEAT.scene }}
          className="row-start-2 w-full lg:col-start-1 lg:row-start-1"
        >
          <QuestBotScene
            reduced={reduced}
            ambient={ambient}
            onIntroDone={reveal}
            onReplayStart={restartIntro}
            pinnedQuestionIndex={pinnedQuestionIndex}
          />
        </motion.div>

        <motion.div
          initial={reduced ? false : "hidden"}
          animate={revealed ? "visible" : "hidden"}
          /* Sin inert: el h1 de dentro es el único encabezado de la página y
             un lector de pantalla tiene que encontrarlo ya en el acto uno. */
          className="cq-hero-copy row-start-1 ps-[var(--hero-inset)] lg:col-start-1 lg:row-start-1"
        >
          <motion.div aria-hidden variants={ruleVariants} className="cq-hero-rule" />

          <HeroHeadline
            text={dict.hero.headline}
            reduced={reduced}
            revealed={revealed}
          />

          <motion.p variants={rise(leadDelay)} className="cq-hero-lead">
            {dict.hero.lead}
          </motion.p>
        </motion.div>
      </motion.div>

      <HeroScrollCue
        reduced={reduced}
        ambient={ambient}
        revealed={revealed}
        opacity={cueOpacity}
        cueDelay={cueDelay}
      />
    </section>
  );
}
