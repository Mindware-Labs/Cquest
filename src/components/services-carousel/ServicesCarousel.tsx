"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
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

/* Each slide owns one viewport-height of scrolling inside the pinned track. */
const BAND = 1 / SERVICES.length;
/* Dead band around each boundary. Without it, a scroll parked exactly on a
   threshold (or Lenis easing back and forth by a pixel) strobes between two
   pages, and each strobe restarts a 0.6s page turn. */
const HYSTERESIS = BAND * 0.12;

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
   ride the page's own fade untouched. */
const stageVariants: Variants = {
  enter: {},
  center: { transition: { delayChildren: 0.14, staggerChildren: 0.07 } },
};
const stageItemVariants: Variants = {
  enter: { opacity: 0, y: 26, filter: "blur(8px)" },
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT },
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

  /* ── The pin ─────────────────────────────────────────────────────────
     The section is SERVICES.length × 100dvh tall and its stage is
     `position: sticky; top: 0`, so reaching the section parks the stage on
     screen and the remaining height becomes the scroll budget for turning
     pages. Progress runs 0 → 1 across exactly that budget.

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

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setPage((previous) => {
      const current = previous[0];
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
      return next === current ? previous : [next, next > current ? 1 : -1];
    });
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
          height: `${SERVICES.length * 100}dvh`,
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
        /* Stays on the sheet, not the track: styles/carousel.css hangs every
           `cq-v2-*` pause rule off `.cq-carousel-sheet[data-ambient-active]`. */
        data-ambient-active={tabVisible && !reduced}
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
                re-lights and re-themes the field as part of the same gesture. */}
            <SlideBackdrop service={service} />

            <motion.div
              variants={reduced ? undefined : stageVariants}
              className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center sm:px-10"
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
