"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import { SERVICES } from "@/components/services/data";
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
  const reduced = useReducedMotion() ?? false;
  /* Index + direction live together so a single state update drives both
     which page renders and which way the turn animates. */
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  /* The living backdrops hold their breath while the tab is hidden
     (CSS pauses every cq-v2-* animation via data-ambient-active). */
  const tabVisible = useTabVisibility();
  const service = SERVICES[index];
  const sectionRef = useRef<HTMLElement>(null);
  /* Mirrors of state for the wheel listener (subscribed once). */
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  const wheelLockUntil = useRef(0);

  /* Scroll turns the pages. Once the carousel fills the viewport, wheel
     input becomes page-turn input: down advances, up goes back. At the
     edges (before the first page, after the last) the event is released so
     normal scrolling resumes — that's how the user returns to the hero.
     Capture phase + stopPropagation outprioritizes Lenis for consumed
     events, so the smooth-scroller never fights a page turn. A ~1s
     cooldown swallows trackpad momentum so one gesture = one page. */
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      if (section.getBoundingClientRect().top > 4) return;

      const dir = event.deltaY > 0 ? 1 : -1;
      const atEdge =
        (dir > 0 && indexRef.current === SERVICES.length - 1) ||
        (dir < 0 && indexRef.current === 0);
      if (atEdge) return;

      event.preventDefault();
      event.stopPropagation();

      const now = performance.now();
      if (now < wheelLockUntil.current || Math.abs(event.deltaY) < 8) return;
      wheelLockUntil.current = now + 950;
      setPage(([current]) => [current + dir, dir]);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () =>
      window.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

  const paginate = (dir: number) =>
    setPage(([current]) => [
      (current + dir + SERVICES.length) % SERVICES.length,
      dir,
    ]);

  const goTo = (next: number) =>
    setPage(([current]) => [next, next > current ? 1 : -1]);

  return (
    /* w-full (not w-screen) so the page's vertical scrollbar never causes
       horizontal overflow; h-dvh so the stage tracks the real mobile
       viewport instead of hiding the dots behind the browser chrome.
       .cq-carousel-sheet carries the curtain overlap over the hero, the
       rounded shoulders and the ambient field (globals.css). */
    <section
      ref={sectionRef}
      id="services"
      aria-roledescription="carousel"
      aria-label="Center Quest business lines"
      data-ambient-active={tabVisible && !reduced}
      style={{ "--svc": service.color, "--svc-glow": service.glow } as CSSProperties}
      className="cq-carousel-sheet relative isolate h-dvh w-full overflow-hidden text-foreground"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") paginate(1);
        if (event.key === "ArrowLeft") paginate(-1);
      }}
    >
      {/* Pages overlap absolutely inside the clipped stage, so the outgoing
          and incoming slides crossfade in place — no layout shift, no bars. */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.article
          key={service.id}
          aria-label={`${index + 1} of ${SERVICES.length}: ${service.label}`}
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
              Business line · 0{index + 1}
            </motion.p>
            <motion.h2
              variants={reduced ? undefined : stageItemVariants}
              className="mt-3 font-heading text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.03em]"
            >
              {service.label}
            </motion.h2>
            <motion.p
              variants={reduced ? undefined : stageItemVariants}
              className="mt-4 max-w-[38ch] text-balance font-heading text-[clamp(1.05rem,2vw,1.35rem)] font-medium leading-snug text-foreground/90"
            >
              {service.shortLabel}
            </motion.p>
            <motion.p
              variants={reduced ? undefined : stageItemVariants}
              className="mt-5 max-w-[52ch] text-pretty text-[.95rem] leading-relaxed text-[var(--text-secondary)] sm:text-base"
            >
              {service.strapline} {service.description}
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

      {/* Page indicator: tinted dot per service, current one stretched. */}
      <nav
        aria-label="Choose service"
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5"
      >
        {SERVICES.map((entry, dotIndex) => (
          <button
            key={entry.id}
            type="button"
            aria-label={entry.label}
            aria-current={dotIndex === index ? "true" : undefined}
            onClick={() => goTo(dotIndex)}
            className="rounded-full transition-all duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petroleo"
            style={{
              width: dotIndex === index ? "1.75rem" : "0.5rem",
              height: "0.5rem",
              backgroundColor:
                dotIndex === index
                  ? entry.color
                  : "color-mix(in srgb, var(--foreground) 18%, transparent)",
            }}
          />
        ))}
        <span className="ml-2 text-[0.68rem] font-semibold tabular-nums tracking-[0.16em] text-foreground/50">
          0{index + 1} / 0{SERVICES.length}
        </span>
      </nav>
    </section>
  );
}
