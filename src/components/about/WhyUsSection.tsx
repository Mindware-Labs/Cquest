"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, VIEWPORT, focusRiseVariants, groupVariants, lineMaskGroupVariants, lineMaskVariants, ruleYVariants, softRiseVariants, stepVariants } from "@/components/services/motion";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import { gsap } from "@/lib/gsap";
import { SCRUB, useEnteredOnce, useIsomorphicLayoutEffect } from "./motion";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import styles from "./WhyUsSection.module.css";

type Accent = "celeste" | "verde";
type WhyCard = { id: string; accent: Accent; es: { title: string; body: string }; en: { title: string; body: string } };

const CARDS: readonly WhyCard[] = [
  {
    id: "one-roof",
    accent: "celeste",
    es: { title: "Un solo techo", body: "Call Center, BPO y Desarrollo de Sistemas bajo un mismo equipo. Un solo responsable, no tres proveedores que coordinar." },
    en: { title: "One roof", body: "Call Center, BPO and Systems Development under one team. One accountable partner, not three vendors to coordinate." },
  },
  {
    id: "engineering",
    accent: "verde",
    es: { title: "Ingeniería propia", body: "Un equipo de desarrolladores propios construye CRMs, dashboards y automatización a la medida. La mayoría de los BPO no puede decir lo mismo." },
    en: { title: "In-house engineering", body: "A team of in-house developers builds CRMs, dashboards and automation shaped around your operation. Most BPOs can't say the same." },
  },
  {
    id: "control-room",
    accent: "celeste",
    es: { title: "Una sala de control real", body: "Un mismo piso de operaciones, un mismo equipo. Real, visitable — no subcontratado en cascada." },
    en: { title: "A real control room", body: "One operations floor, one team. Real, visitable — not layers of outsourced subcontracting." },
  },
  {
    id: "people",
    accent: "celeste",
    es: { title: "Gente formada, no alquilada", body: "Un departamento de RR. HH. propio recluta y forma a cada operador, con equipos especializados por sector." },
    en: { title: "People we train, not rent", body: "A dedicated in-house HR team recruits and trains every operator, with teams specialized by sector." },
  },
];

const COPY = {
  en: {
    eyebrow: "Why Center Quest",
    heading: ["Four reasons.", "One operation."] as const,
    lead: "Not a pitch — this is how the team is actually built.",
    carouselAriaLabel: "Reasons to choose Center Quest",
    goToCard: (n: number) => `Show reason ${n} of ${CARDS.length}`,
    liveAnnouncement: (n: number, title: string) => `Reason ${n} of ${CARDS.length}: ${title}`,
    pause: "Pause rotation",
    resume: "Resume rotation",
  },
  es: {
    eyebrow: "Por qué Center Quest",
    heading: ["Cuatro razones.", "Una sola operación."] as const,
    lead: "No es una promesa — así está armado el equipo.",
    carouselAriaLabel: "Razones para elegir Center Quest",
    goToCard: (n: number) => `Mostrar razón ${n} de ${CARDS.length}`,
    liveAnnouncement: (n: number, title: string) => `Razón ${n} de ${CARDS.length}: ${title}`,
    pause: "Pausar rotación",
    resume: "Reanudar rotación",
  },
};

const CARD_COUNT = CARDS.length;
const TURN_DURATION = 0.9;
const AUTO_ADVANCE_MS = 4600;
const PAD2 = (n: number) => String(n).padStart(2, "0");

type Slot = { x: string; y: string; z: number; rotateY: number; scale: number; opacity: number; zIndex: number };
const SLOT_FRONT: Slot = { x: "0%", y: "0%", z: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 4 };
const SLOT_RIGHT: Slot = { x: "56%", y: "0%", z: -70, rotateY: -24, scale: 0.82, opacity: 0.58, zIndex: 2 };
const SLOT_LEFT: Slot = { x: "-56%", y: "0%", z: -70, rotateY: 24, scale: 0.82, opacity: 0.58, zIndex: 2 };

const SLOT_BACK: Slot = { x: "0%", y: "-38%", z: -120, rotateY: 0, scale: 0.7, opacity: 0.42, zIndex: 1 };

function relativeSlot(index: number, activeIndex: number) {
  const forward = ((index - activeIndex) % CARD_COUNT + CARD_COUNT) % CARD_COUNT;
  return forward === CARD_COUNT - 1 ? -1 : forward;
}

function slotFor(relative: number): Slot {
  if (relative === 0) return SLOT_FRONT;
  if (relative === 1) return SLOT_RIGHT;
  if (relative === -1) return SLOT_LEFT;
  return SLOT_BACK;
}

function WhyCardFace({
  card,
  relative,
  lang,
  number,
  onSelect,
}: {
  card: WhyCard;
  relative: number;
  lang: Locale;
  number: string;
  onSelect: () => void;
}) {
  const copy = card[lang];
  const isActive = relative === 0;
  const slot = slotFor(relative);

  return (
    <motion.div
      className={styles.face}
      data-accent={card.accent}
      data-active={isActive || undefined}

      /* Izquierda y derecha por separado, no un genérico "side": el velo de las
         tarjetas que se van es direccional y necesita saber hacia dónde giran. */
      data-slot={relative === 0 ? "front" : relative === 1 ? "right" : relative === -1 ? "left" : "back"}
      aria-hidden={!isActive}
      style={{ zIndex: slot.zIndex }}
      animate={{ x: slot.x, y: slot.y, z: slot.z, rotateY: slot.rotateY, scale: slot.scale, opacity: slot.opacity }}
      transition={{ duration: TURN_DURATION, ease: EASE_OUT }}

      onClick={isActive ? undefined : onSelect}
    >
      <span className={styles.faceIndex}>{number}</span>
      <h3>{copy.title}</h3>
      <p>{copy.body}</p>
    </motion.div>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" fill="currentColor">
      <rect x="2.5" y="1.5" width="2" height="9" rx="0.5" />
      <rect x="7.5" y="1.5" width="2" height="9" rx="0.5" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" fill="currentColor">
      <path d="M3 1.6 10 6 3 10.4Z" />
    </svg>
  );
}

export default function WhyUsSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const tabVisible = useTabVisibility();

  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  /* Antes que `inView`, que llega al 25% y es la puerta del autoplay: la luz
     tiene que estar subiendo cuando la sala todavía está entrando. */
  const lit = useEnteredOnce(sectionRef, { enabled: !reduced });
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Era la única de las cuatro salas con el fondo completamente quieto,
     mientras las de al lado derivan con el scroll. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !glowRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        glowRef.current,
        /* ±1.5% y no más: el horizonte vive en esta capa y un recorrido mayor
           lo desliza respecto al tambor que se apoya en él. */
        { yPercent: 1.5 },
        {
          yPercent: -1.5,
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

  const advanceTo = useCallback((index: number) => setActiveIndex(index), []);

  const advance = useCallback(() => {
    setActiveIndex((current) => (current + 1) % CARD_COUNT);
  }, []);

  useEffect(() => {
    if (reduced || paused || held || !inView || !tabVisible) return;
    const id = window.setTimeout(advance, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [reduced, paused, held, inView, tabVisible, activeIndex, advance]);

  const counting = !reduced && !paused && !held && inView && tabVisible;

  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) advance();
  };

  return (
    <section
      id="why-us"
      ref={sectionRef}
      className={styles.whyUsSection}
      data-lit={lit ? "true" : "false"}
    >

      {/* Orden de pintura: luz de consola, cuadrícula sobre ella, encuadre y
          grano. Todas se centran en --why-stage-x/y (WhyUsSection.module.css). */}
      <div ref={glowRef} aria-hidden className={styles.stageGlow} />
      <div aria-hidden className={styles.fieldGrid} />
      <div aria-hidden className={styles.vignette} />
      <div aria-hidden className={`${styles.grain} cq-noise`} />

      <div className={`${container.container} ${styles.inner}`}>
        <motion.div
          className={styles.header}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.span aria-hidden className={styles.rule} variants={ruleYVariants} />
          <motion.span className={styles.eyebrow} variants={focusRiseVariants}>
            {t.eyebrow}
          </motion.span>
          {/* Máscara por línea en vez de la subida genérica: es la otra vez
              que la página afirma algo, como el h1 del hero. */}
          <motion.h2 variants={lineMaskGroupVariants}>
            {t.heading.map((line) => (
              <span key={line} className={styles.headingLine}>
                <motion.span variants={lineMaskVariants}>{line}</motion.span>
              </span>
            ))}
          </motion.h2>
          <motion.p variants={focusRiseVariants}>{t.lead}</motion.p>
        </motion.div>

        {reduced ? (
          <ul className={styles.staticGrid}>
            {CARDS.map((card, index) => (
              <li key={card.id} className={styles.staticCard} data-accent={card.accent}>
                <span className={styles.faceIndex}>{PAD2(index + 1)}</span>
                <h3>{card[lang].title}</h3>
                <p>{card[lang].body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <motion.div
            className={styles.stageWrap}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={stepVariants}
          >
            <motion.div
              className={styles.stage}
              variants={softRiseVariants}
              role="group"
              aria-roledescription="carousel"
              aria-label={t.carouselAriaLabel}
              tabIndex={0}
              onPointerEnter={() => setHeld(true)}
              onPointerLeave={() => setHeld(false)}
              onFocus={() => setHeld(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
              }}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  advance();
                }
              }}
            >
              <div className={styles.drum}>
                {CARDS.map((card, index) => (
                  <WhyCardFace
                    key={card.id}
                    card={card}
                    relative={relativeSlot(index, activeIndex)}
                    lang={lang}
                    number={PAD2(index + 1)}
                    onSelect={() => advanceTo(index)}
                  />
                ))}
              </div>
            </motion.div>

            <div className={styles.rail}>
              <ol className={styles.ticks}>
                {CARDS.map((card, index) => (
                  <li key={card.id}>
                    <button
                      type="button"
                      className={styles.tick}
                      aria-label={t.goToCard(index + 1)}
                      aria-current={activeIndex === index ? "true" : undefined}
                      data-active={activeIndex === index || undefined}
                      onClick={() => advanceTo(index)}
                    >

                      <span aria-hidden className={styles.tickTrack}>
                        {activeIndex === index && counting && (
                          <motion.span
                            key={activeIndex}
                            className={styles.tickFill}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: "linear" }}
                          />
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className={styles.pauseToggle}
                aria-label={paused ? t.resume : t.pause}
                aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIndex}
                  className={styles.indexReadout}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  {PAD2(activeIndex + 1)} / {PAD2(CARD_COUNT)}
                </motion.span>
              </AnimatePresence>
            </div>

            <span role="status" aria-live="polite" className="sr-only">
              {t.liveAnnouncement(activeIndex + 1, CARDS[activeIndex][lang].title)}
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
