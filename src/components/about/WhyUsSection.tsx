"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, VIEWPORT, focusRiseVariants, groupVariants, ruleYVariants, softRiseVariants, stepVariants } from "@/components/services/motion";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import styles from "./WhyUsSection.module.css";

/* ── The reasons ───────────────────────────────────────────────────────
   Every claim here is a fact already established elsewhere on this site
   (ABOUT_METRICS, LocationSection's "one floor" framing, StorySection's
   five sectors) — nothing invented for this section. `accent: "verde"`
   marks the one card carrying the brand's secondary colour: in-house
   software is the fact that actually sets Center Quest apart from a plain
   call-center/BPO shop, so it is the one thing on this dark band allowed to
   pull on a second hue (DISENIO.md: verde is sparing, for the thing that
   "requiere destacar sin competir con el azul principal"). */
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
const AUTO_ADVANCE_MS = 5600;
const PAD2 = (n: number) => String(n).padStart(2, "0");

/* ── The stack, not a spinning drum ────────────────────────────────────
   An earlier pass drove all four plaques off one shared rotateY, true
   perspective geometry that made a card genuinely edge-on at 90° — correct
   physics, but it also meant the three non-active reasons faded to a hairline
   sliver or vanished behind backface-visibility. The brief here is the
   opposite: the other three should stay visibly present, beside and behind
   the active one, the way a hand of cards fans out rather than a rolodex
   spinning past.

   So each plaque now animates independently to one of four fixed SLOTS —
   front / right / left / back — chosen from its distance to the active
   index. Motion tweens a card's own x/z/rotateY/scale/opacity straight from
   whichever slot it was just in to whichever slot it's moving to, so the
   transition still reads as one continuous shift, not a cut. `x` is a
   PERCENTAGE (resolved against the card's own width, same as CSS
   `translateX(%)`), so the side offset stays proportional as --plaque-w
   itself shrinks on narrow viewports — no separate breakpoint math needed. */
type Slot = { x: string; y: string; z: number; rotateY: number; scale: number; opacity: number; zIndex: number };
const SLOT_FRONT: Slot = { x: "0%", y: "0%", z: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 4 };
const SLOT_RIGHT: Slot = { x: "56%", y: "0%", z: -70, rotateY: -24, scale: 0.82, opacity: 0.58, zIndex: 2 };
const SLOT_LEFT: Slot = { x: "-56%", y: "0%", z: -70, rotateY: 24, scale: 0.82, opacity: 0.58, zIndex: 2 };
/* Centred behind the front card would mean directly ECLIPSED by it — smaller
   AND in the same spot is just hidden, not "behind". The upward `y` is what
   actually makes it read as a card peeking out from the back of the stack:
   its top edge clears the front card's, so a genuine sliver of it is always
   visible above, not merely implied by the front card getting a shadow. */
const SLOT_BACK: Slot = { x: "0%", y: "-38%", z: -120, rotateY: 0, scale: 0.7, opacity: 0.42, zIndex: 1 };

/** -1 (left) · 0 (front) · 1 (right) · 2 (back) — the card's position
 *  relative to whichever index is currently active. With exactly four cards
 *  every one of these four slots is always occupied by exactly one card. */
function relativeSlot(index: number, activeIndex: number) {
  const forward = ((index - activeIndex) % CARD_COUNT + CARD_COUNT) % CARD_COUNT; // 0..3
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
      /* Discrete, never touched by Motion — the material itself (background/
         border) steps darker with distance so depth reads in the surface,
         not just in the opacity Motion is already animating toward zero. */
      data-slot={isActive ? "front" : relative === 2 ? "back" : "side"}
      aria-hidden={!isActive}
      style={{ zIndex: slot.zIndex }}
      animate={{ x: slot.x, y: slot.y, z: slot.z, rotateY: slot.rotateY, scale: slot.scale, opacity: slot.opacity }}
      transition={{ duration: TURN_DURATION, ease: EASE_OUT }}
      /* A visible side/back plaque inviting a click is the whole point of
         showing them — bringing one to front on click is what a reader
         expects from seeing part of it peek out. Not reachable by keyboard
         (no tabIndex): the tick rail below is the accessible equivalent
         control, and this stays a pointer-only bonus on top of it. */
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
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false); // hover/focus — a temporary pause
  const [paused, setPaused] = useState(false); // the visible toggle — sticks until pressed again

  const [activeIndex, setActiveIndex] = useState(0);

  /* Only the stage's own IntersectionObserver gates AUTOPLAY — the entrance
     reveal below still uses Motion's `whileInView` (once, for the arrival),
     a separate and shorter-lived concern. This one keeps running for as
     long as the section is mounted, same "hold your breath off-screen"
     contract as ServicesCarousel's onScreen/CallCenterScene gating. */
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

  /* Each WhyCardFace derives its own target slot from (index, activeIndex) —
     no coordinate to compute here, just which card is current. There is no
     "which direction" question either: unlike the old shared-rotation
     drum, every card tweens its OWN x/z/rotateY/scale/opacity independently,
     so jumping from card 4 to card 1 can't spin the "wrong way round". */
  const advanceTo = useCallback((index: number) => setActiveIndex(index), []);

  const advance = useCallback(() => {
    setActiveIndex((current) => (current + 1) % CARD_COUNT);
  }, []);

  /* A self-rescheduling timeout keyed on `activeIndex`, not a bare interval:
     any change to the active card — autoplay OR a manual tick/swipe/arrow —
     clears and restarts this effect, so a reader's own choice always gets
     its full dwell before the drum moves again on its own. */
  useEffect(() => {
    if (reduced || paused || held || !inView || !tabVisible) return;
    const id = window.setTimeout(advance, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [reduced, paused, held, inView, tabVisible, activeIndex, advance]);

  /* Same condition the effect above gates on, so the active tick's fill
     (below) never shows progress the timer isn't actually making — when
     this is false the timer has been cleared outright, not paused mid-way,
     so there is no partial progress to hold a still frame of either. */
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
    // A decisive horizontal swipe in either direction brings the next card
    // forward — both directions read as the same gesture rather than one of
    // them doing nothing, since the tick rail already covers "jump to a
    // specific card" and a swipe is really just "I'm engaging, move on".
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) advance();
  };

  return (
    <section id="why-us" ref={sectionRef} className={styles.whyUsSection}>
      {/* Order matters — none of these three set z-index, so DOM order alone
          decides paint order: the measured hairline field sits furthest
          back, the vignette shapes it into a lit stage, grain sits on top of
          both. Same lattice MetricsSection's own field uses two bands up —
          continuing that material into this section rather than inventing a
          second backdrop language. */}
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
          <motion.h2 variants={focusRiseVariants}>
            {t.heading[0]}
            <br />
            {t.heading[1]}
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
                      {/* The active tick doubles as a countdown: it fills over
                          exactly AUTO_ADVANCE_MS, so the reader can see how
                          long is left before the drum turns on its own —
                          same "fill as a track" language the carousel's own
                          nav dots use for scroll progress. Keyed on
                          activeIndex so every new turn (auto or manual)
                          restarts the fill from empty rather than resuming
                          mid-way through the last one's. */}
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

            {/* Off-screen for sighted readers (the drum and rail already show
                this), announced for screen readers on every turn — the ARIA
                carousel pattern's live region, since the three inactive
                plaques are aria-hidden and a rotation is otherwise silent. */}
            <span role="status" aria-live="polite" className="sr-only">
              {t.liveAnnouncement(activeIndex + 1, CARDS[activeIndex][lang].title)}
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
