"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useMagnetic } from "@/hooks/useMagnetic";
import ServiceIcon from "@/components/services/ServiceIcon";
import { SERVICES, type Service } from "@/components/services/data";

/* Next's Link with motion capabilities, so the CTA can share the hero's
   magnetic pointer-follow and spring press states. */
const MotionLink = motion.create(Link);

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

export default function ServicesCarousel() {
  const reduced = useReducedMotion() ?? false;
  /* Index + direction live together so a single state update drives both
     which page renders and which way the turn animates. */
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  const [tabVisible, setTabVisible] = useState(true);
  const service = SERVICES[index];
  const sectionRef = useRef<HTMLElement>(null);
  /* Mirrors of state for the wheel listener (subscribed once). */
  const indexRef = useRef(index);
  indexRef.current = index;
  const wheelLockUntil = useRef(0);

  /* The living backdrops hold their breath while the tab is hidden
     (CSS pauses every cq-v2-* animation via data-ambient-active). */
  useEffect(() => {
    const syncVisibility = () => setTabVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

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

          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center sm:px-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--svc)_62%,var(--foreground))]">
              Business line · 0{index + 1}
            </p>
            <h2 className="mt-3 font-heading text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
              {service.label}
            </h2>
            <p className="mt-4 max-w-[38ch] text-balance font-heading text-[clamp(1.05rem,2vw,1.35rem)] font-medium leading-snug text-foreground/90">
              {service.shortLabel}
            </p>
            <p className="mt-5 max-w-[52ch] text-pretty text-[.95rem] leading-relaxed text-[var(--text-secondary)] sm:text-base">
              {service.strapline} {service.description}
            </p>

            <CapabilityTags service={service} />

            <ServiceCta service={service} />
          </div>
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

/* Each slide's living scene, themed to its business line and painted in its
   service colour (all layers read --svc/--svc-glow from the section).
   Rendered INSIDE the motion.article so the whole scene crossfades and
   travels with the page turn. Layer classes live in globals.css. */
function SlideBackdrop({ service }: { service: Service }) {
  return (
    <div aria-hidden className="cq-v2-layer">
      {/* Base ambient tint shared by every scene. */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(70% 55% at 50% 18%, color-mix(in srgb, var(--svc) 16%, transparent), transparent 70%),
            radial-gradient(60% 50% at 50% 108%, color-mix(in srgb, var(--svc-glow) 14%, transparent), transparent 72%)
          `,
        }}
      />

      {service.id === "call-center" && <CallCenterScene />}

      {service.id === "bpo" && (
        <>
          {/* Volume, ordered: the marching lattice frames the field (its
              mask keeps the whole reading column dot-free). */}
          <div className="cq-v2-lattice" />
          {/* Data streams confined to safe bands at the very top and
              bottom — throughput made visible, never across the text. */}
          <span className="cq-v2-stream top-[7%]" />
          <span
            className="cq-v2-stream top-[13%]"
            style={{ animationDelay: "-7s", animationDuration: "15s" }}
          />
          <span
            className="cq-v2-stream top-[84%]"
            style={{ animationDelay: "-3s", animationDuration: "10s" }}
          />
          <span
            className="cq-v2-stream top-[89%]"
            style={{ animationDelay: "-9s", animationDuration: "13s" }}
          />
          <span
            className="cq-v2-orb left-[-10rem] bottom-[-10rem] h-[30rem] w-[30rem]"
            style={{
              backgroundColor: "color-mix(in srgb, var(--svc) 26%, transparent)",
              animation: "cq-float-c 23s cubic-bezier(0.45, 0, 0.55, 1) infinite",
            }}
          />
          <span
            className="cq-v2-orb right-[-8rem] top-[-9rem] h-[26rem] w-[26rem]"
            style={{
              backgroundColor: "color-mix(in srgb, var(--svc-glow) 18%, transparent)",
              animation: "cq-float-a 26s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse",
            }}
          />
        </>
      )}

      {service.id === "systems" && <SystemsScene />}
    </div>
  );
}

/* Capabilities as quiet tags. Deliberately STATIC — the living backdrop
   already carries this slide's motion, so the tags spend no boldness of
   their own: they borrow the hero CTA's rectangular language (2px radius,
   hairline, a 1px light catch along the top) at readout scale, tinted by
   the service colour, and simply ride the page turn with the rest of the
   copy. Each tag keeps its capability description as a native tooltip. */
function CapabilityTags({ service }: { service: Service }) {
  return (
    <ul className="mt-9 flex max-w-xl flex-wrap items-center justify-center gap-2 sm:gap-2.5">
      {service.details.map((detail) => (
        <li key={detail.title} title={detail.description} className="cq-cap">
          <ServiceIcon name={detail.icon} />
          <span>{detail.title}</span>
        </li>
      ))}
    </ul>
  );
}

/* Call Center's connection map. Six flight-routes radiate from the glow
   behind the message; on a shared 14s clock a light streak (the call)
   departs the halo, rides its route and lands on a customer point that
   blooms exactly on arrival. Each route's --cd phase-shifts BOTH its
   streak and its landing ping, and the ping keyframes hold until the
   streak's 14%-of-cycle arrival — the sync is a CSS constant shared by
   construction, so no JS measurement is needed (the radar predecessor
   had to measure angles at runtime). The SVG viewBox and the square
   .cq-v2-net stage share the same 0–100 space, which lets each route's
   endpoint coords double as its ping's left/top percentages. Routes bow
   OUTWARD (around the reading column) and the SVG's radial mask fades
   them toward the origin, so every call visibly materializes leaving the
   glow and lands in the margins. Delays are slightly irregular on
   purpose — departures read as traffic, not a metronome. */
const CALL_ROUTES = [
  { d: "M50 50 Q 26 46 14 22", x: 14, y: 22, delay: "0s" },
  { d: "M50 50 Q 76 42 86 18", x: 86, y: 18, delay: "-2.2s" },
  { d: "M50 50 Q 28 62 7 58", x: 7, y: 58, delay: "-4.7s" },
  { d: "M50 50 Q 72 64 93 62", x: 93, y: 62, delay: "-7s" },
  { d: "M50 50 Q 36 72 28 84", x: 28, y: 84, delay: "-9.3s" },
  { d: "M50 50 Q 66 74 72 88", x: 72, y: 88, delay: "-11.8s" },
] as const;

function CallCenterScene() {
  return (
    <div className="absolute inset-0">
      {/* The exchange's heart: a bloom breathing on the half clock (7s),
          the origin every streak visibly departs from. */}
      <span className="cq-v2-halo" />
      {/* Emission rings leaving the heart every 3.5 seconds. */}
      <span className="cq-v2-ring" />
      <span className="cq-v2-ring" style={{ animationDelay: "-3.5s" }} />
      {/* The map: crawling meridians, the standing route network, the
          calls in flight, and their landing points. */}
      <div className="cq-v2-net">
        <svg viewBox="0 0 100 100" aria-hidden>
          <circle className="cq-v2-graticule" cx="50" cy="50" r="36" strokeDasharray="2 4.5" />
          <circle
            className="cq-v2-graticule"
            cx="50"
            cy="50"
            r="44"
            strokeDasharray="0.5 3.4"
            style={{ animationDirection: "reverse", animationDuration: "200s" }}
          />
          {CALL_ROUTES.map((route) => (
            <g key={route.d} style={{ "--cd": route.delay } as CSSProperties}>
              <path className="cq-v2-route" d={route.d} pathLength={1} />
              <path className="cq-v2-comet cq-v2-comet-glow" d={route.d} pathLength={1} />
              <path className="cq-v2-comet" d={route.d} pathLength={1} />
            </g>
          ))}
        </svg>
        {CALL_ROUTES.map((route) => (
          <span
            key={route.d}
            className="cq-v2-ping"
            style={
              { left: `${route.x}%`, top: `${route.y}%`, "--cd": route.delay } as CSSProperties
            }
          />
        ))}
      </div>
      <span
        className="cq-v2-orb left-[-9rem] top-[-8rem] h-[30rem] w-[30rem]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--svc) 30%, transparent)",
          animation: "cq-float-a 21s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        }}
      />
      <span
        className="cq-v2-orb bottom-[-11rem] right-[-8rem] h-[28rem] w-[28rem]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--svc-glow) 26%, transparent)",
          animation: "cq-float-b 25s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        }}
      />
    </div>
  );
}

/* Mirror of the scan beam's CSS geometry (globals.css .cq-v2-scan): one
   pass per SCAN_PERIOD, starting at -24rem, travelling to 100vw + 8rem,
   with the bright line sitting at 55% of the beam's 20rem width. */
const SCAN_PERIOD = 13;
const SCAN_START_REM = -24;
const SCAN_OVERSHOOT_REM = 8;
const SCAN_BRIGHT_LINE_REM = 0.55 * 20;
/* The blueprint grid's cell size (matches .cq-v2-grid background-size). */
const GRID_CELL_REM = 3.4;

/* Systems' indexing field. Like the radar→ping sync on Call Center, the
   effect below does two live measurements per node: it SNAPS the node onto
   the nearest true grid intersection (the grid is centre-anchored, so
   lines sit at centre ± half a cell ± k cells), then — because the beam
   moves linearly — solves for the moment the bright line crosses that
   snapped x and phase-shifts the node's 13s flare to land exactly there.
   data-x/data-y hold the layout intent in %, so resizes re-solve cleanly. */
function SystemsScene() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const sync = () => {
      const box = layer.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const rem =
        Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const cell = GRID_CELL_REM * rem;
      const halfCell = cell / 2;
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      const beamBrightStart = (SCAN_START_REM + SCAN_BRIGHT_LINE_REM) * rem;
      /* The CSS keyframe travels to 100vw + 8rem: 100vw is the FULL
         viewport (scrollbar included) = window.innerWidth, not the layer's
         clientWidth — using the latter would drift the sync by the
         scrollbar's width. */
      const beamTravel =
        window.innerWidth + (SCAN_OVERSHOOT_REM - SCAN_START_REM) * rem;

      layer.querySelectorAll<HTMLElement>(".cq-v2-node").forEach((node) => {
        const targetX = (Number.parseFloat(node.dataset.x ?? "50") / 100) * box.width;
        const targetY = (Number.parseFloat(node.dataset.y ?? "50") / 100) * box.height;
        const gridBaseX = centerX - halfCell;
        const gridBaseY = centerY - halfCell;
        const x = gridBaseX + Math.round((targetX - gridBaseX) / cell) * cell;
        const y = gridBaseY + Math.round((targetY - gridBaseY) / cell) * cell;
        node.style.left = `${x.toFixed(1)}px`;
        node.style.top = `${y.toFixed(1)}px`;
        const crossing = (SCAN_PERIOD * (x - beamBrightStart)) / beamTravel;
        node.style.setProperty("--nd", `${(crossing - SCAN_PERIOD).toFixed(2)}s`);
      });
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <div ref={layerRef} className="absolute inset-0">
      {/* Blueprint grid framing the field; its mask keeps the reading
          column clear. */}
      <div className="cq-v2-grid" />
      {/* The indexing beam (linear, so the node sync can predict it). */}
      <span className="cq-v2-scan" />
      {/* Grid nodes in the safe margins — snapped onto intersections and
          flaring exactly as the beam's bright line reaches them. */}
      <span className="cq-v2-node" data-x="12" data-y="22" />
      <span className="cq-v2-node" data-x="22" data-y="80" />
      <span className="cq-v2-node" data-x="38" data-y="12" />
      <span className="cq-v2-node" data-x="66" data-y="88" />
      <span className="cq-v2-node" data-x="84" data-y="18" />
      <span className="cq-v2-node" data-x="90" data-y="66" />
      <span
        className="cq-v2-orb left-[-9rem] top-[30%] h-[28rem] w-[28rem]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--svc) 26%, transparent)",
          animation: "cq-float-b 24s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        }}
      />
      <span
        className="cq-v2-orb right-[-10rem] bottom-[-9rem] h-[30rem] w-[30rem]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--svc-glow) 22%, transparent)",
          animation: "cq-float-c 27s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse",
        }}
      />
    </div>
  );
}

/* The hero's primary-CTA language on the slide's action: rectangular 2px
   radius, celeste field, white wipe on hover, chevron nudge, magnetic
   pointer-follow with critically-damped springs. */
function ServiceCta({ service }: { service: Service }) {
  const { ref, style, onMouseEnter, onMouseMove, onMouseLeave } =
    useMagnetic<HTMLAnchorElement>(0.2, 3);

  return (
    <MotionLink
      ref={ref}
      href={service.href}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="cq-rect-cta group relative mt-9 inline-flex touch-manipulation items-center gap-3 overflow-hidden bg-celeste py-3 pl-6 pr-[1.375rem] text-foreground shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--brand-celeste)_40%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_20px_40px_-10px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
      />
      <span className="relative z-10">Explore {service.label}</span>
      <span className="relative z-10 flex h-4 w-4 items-center justify-center text-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
        <Chevron />
      </span>
    </MotionLink>
  );
}

/* Same glyph the hero's CTAs use. */
function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-px"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}
