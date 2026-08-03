"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import { SERVICES } from "@/components/services/data";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n/format";
import CapabilityTags from "./CapabilityTags";
import ServiceCta from "./ServiceCta";
import SlideBackdrop from "./SlideBackdrop";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* A drag only turns the page when distance × velocity clears this bar —
   short-but-fast flicks and long deliberate pulls both qualify, slow
   half-hearted drags snap back. */
const SWIPE_THRESHOLD = 9000;
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity;

/* ── Band length ─────────────────────────────────────────────────────────
   How much scrolling each page owns, in dvh. The track is one viewport (the
   pinned stage itself) plus one band per page, so the scroll budget works
   out to exactly BAND_DVH per turn.

   45 rather than the 100 a naive pin would give: at a full viewport per page
   the section takes three screen-heights of scrolling to cross and every
   turn feels like it has to be dragged out of the page. Under ~30 the turns
   start firing faster than the 0.6s page animation can finish, so gestures
   stack up. Tune here — the progress maths below is in fractions of the
   budget, so it follows automatically. */
const BAND_DVH = 45;
const TRACK_DVH = 100 + SERVICES.length * BAND_DVH;

/* One page's share of the scroll budget, as a fraction of progress. */
const BAND = 1 / SERVICES.length;
/* Dead band around each boundary. Without it, a scroll parked exactly on a
   threshold (or Lenis easing back and forth by a pixel) strobes between two
   pages, and each strobe restarts a 0.6s page turn. */
const HYSTERESIS = BAND * 0.12;

/* ── The handoff into the pin ────────────────────────────────────────────
   A sticky pin is a velocity STEP. Right up to the pin the whole sheet is
   travelling at exactly scroll speed; one frame later it is nailed to the
   top of the viewport at zero. Nothing decelerates — the page simply stops
   dead, and then keeps not moving for the ~45dvh of the first band, because
   until the next boundary the only thing left animating is a 28px dot. Both
   halves of that read as a fault rather than as a design: the stop reads as
   the page snagging, and the dead stretch after it reads as the page having
   frozen.

   The fix is not to make the pin softer — a sticky pin is exact by nature
   and that exactness is what makes the section feel engineered. It is to
   make sure the pin is never the only thing carrying motion at that moment:

   1 · The copy arrives with WEIGHT. It rides in low inside the sheet and is
       still travelling the last STAGE_TAIL_PX when the pin engages, so the
       gesture continues past the stop and eases out on its own terms. The
       eye reads a settle, not a snag.
   2 · The field behind it keeps travelling for the whole band, so scrolling
       inside the pin always moves something and the stretch between two page
       turns stops reading as frozen.
   3 · At the far end the copy lifts INTO the release, so the un-pin is an
       acceleration that has already started rather than another step.

   Everything here is a single transform on a single element per layer —
   compositor-only, and cheap enough to run alongside the page turns. */

/* How far below its resting place the copy sits when the sheet first
   appears, and how much of that travel is deliberately left UNSPENT at the
   moment the pin engages (resolved over STAGE_TAIL_BAND of pinned progress —
   roughly 5dvh of scrolling, which at these amplitudes reads as a settle
   rather than a crawl). */
const STAGE_LEAD_PX = 84;
const STAGE_TAIL_PX = 26;
const STAGE_TAIL_BAND = 0.035;

/* The mirror image at the other end: the copy starts lifting away over the
   last stretch of the pin, so the sheet is already in motion when it lets go.
   Eased IN, so peak velocity lands exactly on the release. */
const STAGE_RELEASE_PX = 30;
const STAGE_RELEASE_BAND = 0.07;

/* The field is the far layer: it enters from a shorter distance than the copy
   (near things travel more), then keeps drifting across the whole band — this
   is what carries the pin's long middle stretch. Both excursions stay well
   inside the 3rem of bleed the wrapper carries on each edge, so translating
   it can never uncover a seam. */
const FIELD_LEAD_PX = 26;
const FIELD_DRIFT_PX = 38;

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
/* ease-out-quint — the polynomial twin of --ease-out / EASE_OUT above. Used
   instead of the bezier because these run per scroll frame and a closed form
   costs nothing. */
const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

/* Book-page turn: the leaving page falls away (fade + settle to 0.95) while
   the incoming one drifts in from the travel direction and lands at rest.
   `custom` carries the direction so both sides of the turn agree. */
const pageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 110 : -110,
    opacity: 0,
    scale: 1.02,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -110 : 110,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.38, ease: EASE_OUT },
  }),
};

/* Inside the turning page the copy arrives as a cascade, not a block: the
   stage hands each line its cue (kicker → headline → lead → description →
   tags → CTA) while the page itself is still settling, so the slide reads
   as layers of one gesture. No `exit` keys — on the way out the children
   ride the page's own fade untouched.

   Transform + opacity ONLY, deliberately. This cascade used to animate
   `filter: blur(8px) → blur(0px)` on all six lines at once. A filter is not
   a compositor property: every frame of that 0.7s re-rasterises each line at
   a new blur radius, on the main thread, while the page itself is mid-turn
   and the backdrop is re-lighting — six simultaneous non-composited
   animations is what made the turn stutter. The travel is a touch longer and
   deeper to carry the same weight the blur was carrying, and now the whole
   cascade runs on the compositor. */
const stageVariants: Variants = {
  enter: {},
  center: { transition: { delayChildren: 0.14, staggerChildren: 0.07 } },
};
const stageItemVariants: Variants = {
  enter: { opacity: 0, y: 34 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: EASE_OUT },
  },
};

export default function ServicesCarousel() {
  const { dict, lang } = useI18n();
  const reduced = useReducedMotion() ?? false;
  /* Index + direction live together so a single state update drives both
     which page renders and which way the turn animates. */
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  /* The living backdrops hold their breath while the tab is hidden
     (CSS pauses every cq-v2-* animation via data-ambient-active). */
  const tabVisible = useTabVisibility();
  const service = SERVICES[index];
  const sectionRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  /* Separate, later gate for the one layer that is genuinely expensive —
     see the observer below. */
  const [sceneReady, setSceneReady] = useState(false);

  /* ── Battery/FPS etiquette, part two ──────────────────────────────────
     Tab visibility was only ever half the story. A slide's backdrop is
     twenty-odd independently animating layers — orbs, rings, comets, pings,
     the marching lattice, the scan beam and its nodes — and every one of
     them kept running while the reader was still in the hero above,
     competing for the same compositor and the same main thread as the
     hero's own canvas and mascot. That is a large slice of frame budget
     spent on something nobody can see, and it is why the hero felt heavy.

     The SHEET is the target, not the track. The track is 2.35 viewports
     tall and begins immediately under the hero, so it is technically in
     view almost from the top of the page — observing it would answer
     "yes" exactly when the answer needs to be "no".

     Even on the sheet, a plain observer flips on at the first pixel of
     scroll: the sheet's top edge sits exactly on the fold. That is the
     worst possible moment, because it means the entire descent out of the
     hero is paid for twice — the mascot, the reactive grid and three
     parallax planes above, twenty animated layers below. The -55% bottom
     margin holds the field asleep until the sheet has climbed past the
     lower half of the viewport, which still leaves it most of a viewport
     of scrolling to warm up before it pins. The loops all run on negative
     delays, so they resume mid-phase and the start is never visible.

     This threshold governs the CHEAP layers only — orbs, bloom, rings,
     lattice, beam: transform and opacity on a handful of elements, which
     the descent can afford. It deliberately stays early, because these are
     also the layers whose paused state is VISIBLE (a frozen emission ring
     is a static circle sitting on a sheet the reader can already see), so
     withholding them longer would trade a frame cost for an artefact. */
  useEffect(() => {
    const node = sheetRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setOnScreen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "0px 0px -55% 0px", threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  /* ── …and the one layer that is not cheap ─────────────────────────────
     CallCenterScene's connection map is the only thing on this surface that
     costs main-thread time: `stroke-dashoffset` is not a compositor
     property, so its twelve comet paths repaint a ~960px stage on every
     frame they run. It is also, being slide one, the scene that would be
     doing that for the whole descent out of the hero — which is precisely
     where the section felt heavy.

     -78% is chosen against the hero's own observer rather than by feel. The
     hero retires its ambience at `-25%` top margin, i.e. once roughly 75dvh
     have been scrolled; this arms the map at 100 − 22 = 78dvh. The two
     windows no longer overlap AT ALL: for the entire descent exactly one of
     the two stages is doing main-thread work. It still lands a fifth of a
     viewport before the pin, so the cost is paid during a calm stretch
     rather than on the braking frames.

     A mount gate, not a pause. See CallCenterScene for why pausing this
     particular subtree is worse than not having it. */
  useEffect(() => {
    const node = sheetRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setSceneReady(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setSceneReady(entry.isIntersecting),
      { rootMargin: "0px 0px -78% 0px", threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  /* ── The pin ─────────────────────────────────────────────────────────
     The section is TRACK_DVH tall and its stage is `position: sticky;
     top: 0`, so reaching the section parks the stage on screen and the
     height beyond that one pinned viewport becomes the scroll budget for
     turning pages. Progress runs 0 → 1 across exactly that budget.

     This replaces a wheel listener that used to preventDefault its way
     through the section. That approach could not hold: Lenis runs its own
     rAF loop and does not always yield to a cancelled wheel event, its
     one-gesture-per-page cooldown swallowed input while the page kept
     moving underneath, and touch, keyboard and scrollbar dragging bypassed
     the handler entirely — which is exactly the "it keeps scrolling without
     turning pages" behaviour. A sticky pin is native layout: every input
     method drives it, and scrolling back up re-traverses the pages for
     free, because the index is a pure function of scroll position rather
     than a counter that has to be kept in sync with one. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* The APPROACH, which the pinned progress above cannot see: 0 when the
     track's top edge is still a full viewport away, 1 at the exact frame the
     pin engages. `scrollYProgress` is pinned to 0 across all of it, so
     everything that has to happen on the way in reads from here instead. */
  const { scrollYProgress: approach } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  /* Mirrors `index` for the scroll handler. The handler runs on EVERY scroll
     frame across 235dvh, and on all but three of those frames the answer is
     "same page as last frame" — reading the index from a ref lets it return
     before touching React at all. Going through setPage's updater to discover
     that meant invoking a state updater sixty times a second for the length
     of the section, on the main thread, next to the page turns. */
  const indexRef = useRef(0);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const current = indexRef.current;
    let next = current;
    /* Walk toward the band the scroll is actually in, rather than
       snapping straight to floor(progress × N) — a fast flick that skips
       a band still resolves in one step, but the direction stays honest. */
    while (next < SERVICES.length - 1 && progress >= (next + 1) * BAND + HYSTERESIS) {
      next += 1;
    }
    while (next > 0 && progress < next * BAND - HYSTERESIS) {
      next -= 1;
    }
    if (next === current) return;
    indexRef.current = next;
    setPage([next, next > current ? 1 : -1]);
  });

  /* How far through the current page's band the reader is, 0 → 1. Feeds the
     active dot so scrolling *within* a band still shows visible progress —
     otherwise two thirds of every band is scrolling with nothing moving,
     which reads as the page having frozen. */
  const bandFill = useTransform(
    scrollYProgress,
    [index * BAND, (index + 1) * BAND],
    [0, 1],
    { clamp: true },
  );

  /* ── 1 · The copy's weight ────────────────────────────────────────────
     Rides in low, and is deliberately still short of its mark by
     STAGE_TAIL_PX at the frame the pin engages — that remainder is spent
     against the pinned progress, so the arrival visibly continues THROUGH
     the stop instead of being cut off by it. At the far end it lifts back
     out, eased in, so the release is met with motion already under way. */
  const stageY = useTransform([approach, scrollYProgress], (values: number[]) => {
    const [entering = 0, pinned = 0] = values;
    if (entering < 1) {
      return STAGE_LEAD_PX - (STAGE_LEAD_PX - STAGE_TAIL_PX) * easeOutQuint(entering);
    }
    const settling = STAGE_TAIL_PX * (1 - easeOutQuint(clamp01(pinned / STAGE_TAIL_BAND)));
    const leaving = clamp01((pinned - (1 - STAGE_RELEASE_BAND)) / STAGE_RELEASE_BAND);
    return settling - STAGE_RELEASE_PX * leaving * leaving;
  });

  /* ── 2 · The field's long travel ──────────────────────────────────────
     Enters from a shorter distance than the copy (it is the far layer), then
     keeps drifting for the ENTIRE band. This is the piece that answers the
     "it froze" reading of the pin: between two page turns there are ~45dvh
     where nothing used to move but a dot, and now the whole field is still
     visibly under way. Reads off `bandFill` rather than the raw progress so
     it resets on the same frame the page turns — the reset is spent behind
     the crossfade instead of on screen. */
  const fieldY = useTransform([approach, bandFill], (values: number[]) => {
    const [entering = 0, filled = 0] = values;
    if (entering < 1) return FIELD_LEAD_PX * (1 - easeOutQuint(entering));
    return -FIELD_DRIFT_PX * filled;
  });

  /* Direct navigation moves the *scroll*, never the index — scroll position
     is the single source of truth, so setting the index behind its back
     would just get overwritten on the next frame. Routed through Lenis when
     it's running so the travel uses the same easing pipeline as everything
     else instead of fighting it with a native smooth scroll. */
  const scrollToIndex = useCallback((next: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const budget = Math.max(1, section.offsetHeight - window.innerHeight);
    /* Aim at the middle of the band, not its edge, so the landing is not
       parked on a threshold where a stray pixel flips the page. */
    const target = top + ((next + 0.5) * BAND) * budget;
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(target, { duration: 0.85 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  /* No wraparound any more: inside a pinned track "past the last page" is
     the page below, and "before the first" is the hero. */
  const paginate = (dir: number) => {
    const next = Math.min(SERVICES.length - 1, Math.max(0, index + dir));
    if (next !== index) scrollToIndex(next);
  };

  return (
    /* The outer element is the scroll track — it must never carry
       `overflow: hidden`, which would turn it into a scroll container and
       silently kill the sticky pin inside it. All clipping lives on the
       stage. */
    <section
      ref={sectionRef}
      id="services"
      aria-roledescription="carousel"
      aria-label={dict.carousel.ariaLabel}
      style={
        {
          "--svc": service.color,
          "--svc-glow": service.glow,
          height: `${TRACK_DVH}dvh`,
        } as CSSProperties
      }
      className="cq-carousel-track relative w-full"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") paginate(1);
        if (event.key === "ArrowLeft") paginate(-1);
      }}
    >
      {/* w-full (not w-screen) so the page's vertical scrollbar never causes
          horizontal overflow; h-dvh so the stage tracks the real mobile
          viewport instead of hiding the dots behind the browser chrome.
          .cq-carousel-sheet carries the rounded shoulders, rim light and
          ambient field (styles/carousel.css). */}
      <div
        ref={sheetRef}
        /* Stays on the sheet, not the track: styles/carousel.css hangs every
           `cq-v2-*` pause rule off `.cq-carousel-sheet[data-ambient-active]`. */
        data-ambient-active={tabVisible && onScreen && !reduced}
        className="cq-carousel-sheet sticky top-0 isolate h-dvh w-full overflow-hidden text-foreground"
      >
        {/* Pages overlap absolutely inside the clipped stage, so the outgoing
            and incoming slides crossfade in place — no layout shift, no bars. */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.article
            key={service.id}
            aria-label={format(dict.carousel.slideAriaLabel, { index: index + 1, total: SERVICES.length, label: service.label[lang] })}
            custom={direction}
            variants={reduced ? undefined : pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              const power = swipePower(info.offset.x, info.velocity.x);
              if (power < -SWIPE_THRESHOLD) paginate(1);
              else if (power > SWIPE_THRESHOLD) paginate(-1);
            }}
            className="absolute inset-0 flex cursor-grab touch-pan-y items-center justify-center active:cursor-grabbing"
          >
            {/* The whole living scene travels WITH its page, so a turn
                re-lights and re-themes the field as part of the same gesture.

                The 3rem of bleed above and below is what makes the field
                drift-able: the wrapper is taller than the stage it fills, so
                translating it can never uncover a seam at either edge. Only
                the vertical axis is grown — SystemsScene solves its beam sync
                against `window.innerWidth`, so the horizontal box has to stay
                exactly the stage's. A pure translate leaves that measurement
                untouched; a scale would not, which is why the bleed is layout
                rather than transform. */}
            <motion.div
              aria-hidden
              style={reduced ? undefined : { y: fieldY }}
              className="pointer-events-none absolute inset-x-0 -inset-y-12"
            >
              <SlideBackdrop service={service} active={sceneReady} />
            </motion.div>

            {/* Carries BOTH the settle and the cascade. `stageVariants`
                declares no properties of its own — only the stagger timing it
                hands its children — so the scroll-bound `y` and the variant
                tree can share one element without ever contending for the
                transform channel. */}
            <motion.div
              style={reduced ? undefined : { y: stageY }}
              variants={reduced ? undefined : stageVariants}
              className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center sm:px-10"
            >
              <motion.p
                variants={reduced ? undefined : stageItemVariants}
                className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--svc)_62%,var(--foreground))]"
              >
                {dict.carousel.businessLinePrefix} · 0{index + 1}
              </motion.p>
              <motion.h2
                variants={reduced ? undefined : stageItemVariants}
                className="mt-3 font-heading text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.03em]"
              >
                {service.label[lang]}
              </motion.h2>
              <motion.p
                variants={reduced ? undefined : stageItemVariants}
                className="mt-4 max-w-[38ch] text-balance font-heading text-[clamp(1.05rem,2vw,1.35rem)] font-medium leading-snug text-foreground/90"
              >
                {service.shortLabel[lang]}
              </motion.p>
              <motion.p
                variants={reduced ? undefined : stageItemVariants}
                className="mt-5 max-w-[52ch] text-pretty text-[.95rem] leading-relaxed text-[var(--text-secondary)] sm:text-base"
              >
                {service.strapline[lang]} {service.description[lang]}
              </motion.p>

              <CapabilityTags service={service} reduced={reduced} />

              {/* The CTA rides its own cascade slot on a wrapper — the link
                  itself keeps its transform channels for the magnetic
                  pointer-follow and press springs. */}
              <motion.div variants={reduced ? undefined : stageItemVariants}>
                <ServiceCta service={service} />
              </motion.div>
            </motion.div>
          </motion.article>
        </AnimatePresence>

        {/* Photographic grain over the whole stage — one static paint that
            takes the digital sheen off every backdrop scene at once. */}
        <div aria-hidden className="cq-noise pointer-events-none absolute inset-0" />

        {/* Page indicator: tinted dot per service. The current one stretches
            into a track that fills as its band is read. */}
        <nav
          aria-label={dict.carousel.chooseServiceAriaLabel}
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5"
        >
          {SERVICES.map((entry, dotIndex) => {
            const isCurrent = dotIndex === index;
            return (
              <button
                key={entry.id}
                type="button"
                aria-label={entry.label[lang]}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => scrollToIndex(dotIndex)}
                className="relative h-2 overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petroleo"
                style={{
                  width: isCurrent ? "1.75rem" : "0.5rem",
                  backgroundColor: isCurrent
                    ? "color-mix(in srgb, var(--foreground) 12%, transparent)"
                    : "color-mix(in srgb, var(--foreground) 18%, transparent)",
                }}
              >
                {isCurrent ? (
                  <motion.span
                    aria-hidden
                    style={{ scaleX: bandFill, backgroundColor: entry.color }}
                    className="absolute inset-0 origin-left rounded-full"
                  />
                ) : null}
              </button>
            );
          })}
          <span className="ml-2 text-[0.68rem] font-semibold tabular-nums tracking-[0.16em] text-foreground/50">
            0{index + 1} / 0{SERVICES.length}
          </span>
        </nav>
      </div>
    </section>
  );
}
