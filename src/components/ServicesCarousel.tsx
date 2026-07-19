"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  animate,
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

/* Capabilities are NOT pills — they're stations on a drawn line, the
   brand's constellation language at readout scale. On each page turn the
   rail draws itself from the centre outward, then the station nodes pop in
   sequence with a spring overshoot, labels riding along. No exit variants —
   the constellation rides the page out. */
const capListVariants: Variants = {
  enter: {},
  center: { transition: { delayChildren: 0.32, staggerChildren: 0.07 } },
};

const capVariants: Variants = {
  enter: { opacity: 0, scale: 0.4, y: 12 },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 22 },
  },
};

const capRailVariants: Variants = {
  enter: { opacity: 0, scaleX: 0 },
  center: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.24 },
  },
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

            <CapabilityConstellation service={service} reduced={reduced} />

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
          {/* Processing stacks riding their vertical conveyors in the side
              margins — the "layers" motif, work visibly moving through. */}
          <span className="cq-v2-stack left-[6%] top-[38%] -rotate-6 hidden md:block">
            <span className="cq-v2-stack-card" />
            <span className="cq-v2-stack-card" style={{ "--sd": "-3s" } as CSSProperties} />
            <span className="cq-v2-stack-card" style={{ "--sd": "-6s" } as CSSProperties} />
          </span>
          <span className="cq-v2-stack right-[6%] top-[56%] rotate-3 hidden md:block">
            <span className="cq-v2-stack-card" style={{ "--sd": "-1.5s" } as CSSProperties} />
            <span className="cq-v2-stack-card" style={{ "--sd": "-4.5s" } as CSSProperties} />
            <span className="cq-v2-stack-card" style={{ "--sd": "-7.5s" } as CSSProperties} />
          </span>
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

/* The capability constellation: stations on a drawn rail, plus an ambient
   SATELLITE that patrols the line station to station. The travel loop is
   JS-driven (Motion's animate) because the stop positions only exist at
   layout time: each hop re-measures the real node centres, so the route
   stays exact on any viewport and after resizes. Arriving at a station,
   the satellite tucks under the node (stations paint above it) and the
   node flares a brief crowning — the same gesture as a hover visit. */
function CapabilityConstellation({
  service,
  reduced,
}: {
  service: Service;
  reduced: boolean;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const satRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    const list = listRef.current;
    const sat = satRef.current;
    if (!list || !sat) return;

    let cancelled = false;
    let controls: ReturnType<typeof animate> | undefined;
    const timeouts = new Set<number>();

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timeouts.delete(id);
          resolve();
        }, ms);
        timeouts.add(id);
      });

    /* Node centres in the list's coordinate space, re-read every hop so
       resizes and font settling never derail the route. */
    const measure = () => {
      const listBox = list.getBoundingClientRect();
      const items = Array.from(list.querySelectorAll<HTMLElement>(".cq-cap"));
      return items.map((item) => {
        const node = item.querySelector<HTMLElement>(".cq-cap-node");
        const box = (node ?? item).getBoundingClientRect();
        return { item, x: box.left + box.width / 2 - listBox.left };
      });
    };

    const crown = (item: HTMLElement) => {
      item.classList.add("cq-cap-visited");
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        item.classList.remove("cq-cap-visited");
      }, 750);
      timeouts.add(id);
    };

    const run = async () => {
      /* Let the entrance choreography land before the patrol begins. */
      await sleep(1600);
      if (cancelled) return;

      let stops = measure();
      if (stops.length < 2) return;

      /* Materialize at the first station — position set through Motion so
         the next hop animates from here instead of jumping from x: 0. */
      controls = animate(sat, { x: stops[0].x - 3 }, { duration: 0 });
      await controls;
      controls = animate(sat, { opacity: 1 }, { duration: 0.4 });
      await controls;
      crown(stops[0].item);
      await sleep(900);

      let index = 0;
      let dir = 1;
      while (!cancelled) {
        stops = measure();
        const next = index + dir;
        if (next < 0 || next >= stops.length) {
          dir = -dir;
          continue;
        }
        controls = animate(
          sat,
          { x: stops[next].x - 3 },
          { duration: 1.05, ease: [0.45, 0, 0.55, 1] },
        );
        await controls;
        if (cancelled) return;
        index = next;
        crown(stops[index].item);
        await sleep(900);
      }
    };

    void run();

    return () => {
      cancelled = true;
      controls?.stop();
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [reduced, service.id]);

  return (
    <motion.ul
      ref={listRef}
      variants={reduced ? undefined : capListVariants}
      className="relative mt-9 flex flex-nowrap items-start justify-center gap-4 sm:gap-8"
    >
      {/* The rail: a hairline in the service colour, drawn from the
          centre outward on arrival — the line the stations sit on. */}
      <motion.span
        aria-hidden
        variants={reduced ? undefined : capRailVariants}
        className="cq-cap-rail"
      />
      {/* The patrol satellite — rides the rail, docks under each station. */}
      <span ref={satRef} aria-hidden className="cq-cap-sat" />
      {service.details.map((detail) => (
        <motion.li
          key={detail.title}
          variants={reduced ? undefined : capVariants}
          whileHover={reduced ? undefined : { y: -4 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          title={detail.description}
          className="cq-cap relative flex w-16 cursor-default flex-col items-center gap-2.5 sm:w-24"
        >
          <span className="cq-cap-node">
            {/* Broken orbit + satellite, waking on hover. */}
            <span aria-hidden className="cq-cap-orbit" />
            <ServiceIcon name={detail.icon} />
          </span>
          <span className="cq-cap-label">{detail.title}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}

/* Mirror of the radar's CSS timing (globals.css): one revolution per
   RADAR_PERIOD, with the bright sweep arm sitting at ARM_OFFSET degrees of
   the conic at local time 0. The ping animations run on the same period. */
const RADAR_PERIOD = 16;
const RADAR_ARM_OFFSET = 78;

/* Call Center's signal field. The pings don't fire on a canned stagger:
   an effect measures each ping's TRUE angle from the radar's centre in the
   live viewport (so the sync holds on any aspect ratio) and phase-shifts
   its 16s cycle via --pd, landing the bloom exactly as the sweep arm
   crosses it. Radar and pings mount in the same commit, so their CSS
   animation clocks start together — and the hidden-tab pause freezes and
   resumes them together, keeping the phase lock. */
function CallCenterScene() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const sync = () => {
      const box = layer.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      /* The radar (and every centred instrument) sits at 50% / 44%. */
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height * 0.44;

      layer.querySelectorAll<HTMLElement>(".cq-v2-ping").forEach((ping) => {
        const dot = ping.getBoundingClientRect();
        const dx = dot.left + dot.width / 2 - centerX;
        const dy = dot.top + dot.height / 2 - centerY;
        /* Angle from 12 o'clock, clockwise — the same frame the rotating
           conic gradient sweeps in. */
        const theta = (Math.atan2(dx, -dy) * 180) / Math.PI;
        const travel = (((theta - RADAR_ARM_OFFSET) % 360) + 360) % 360;
        const crossing = (RADAR_PERIOD * travel) / 360;
        /* Negative delay: the cycle is already mid-flight, and its local
           time 0 (bloom start) lands at the arm's crossing moment. */
        ping.style.setProperty("--pd", `${(crossing - RADAR_PERIOD).toFixed(2)}s`);
      });
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <div ref={layerRef} className="absolute inset-0">
      {/* The call's heart: a bloom breathing on the same clock the rings
          emit on. */}
      <span className="cq-v2-halo" />
      {/* Radar sweep turning over the whole field. */}
      <span className="cq-v2-radar" />
      {/* Four signal rings, evenly staggered mid-cycle on arrival. */}
      <span className="cq-v2-ring" />
      <span className="cq-v2-ring" style={{ animationDelay: "-1.875s" }} />
      <span className="cq-v2-ring" style={{ animationDelay: "-3.75s" }} />
      <span className="cq-v2-ring" style={{ animationDelay: "-5.625s" }} />
      {/* Counter-rotating orbit arcs with satellites on their tips. */}
      <span className="cq-v2-arc w-[min(44rem,80vw)]" />
      <span
        className="cq-v2-arc w-[min(34rem,64vw)]"
        style={{
          animationName: "cq-v2-arc-spin-ccw",
          animationDuration: "34s",
          borderColor: "color-mix(in srgb, var(--svc-glow) 55%, transparent)",
        }}
      />
      {/* Call pings scattered across the map; each fires as the radar arm
          reaches its measured angle (--pd is set by the effect above). */}
      <span className="cq-v2-ping left-[16%] top-[28%]" />
      <span className="cq-v2-ping right-[18%] top-[24%]" />
      <span className="cq-v2-ping left-[24%] bottom-[22%]" />
      <span className="cq-v2-ping right-[26%] bottom-[28%]" />
      <span className="cq-v2-ping left-[38%] top-[14%]" />
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
      {/* The deliverables, ambient: a live dashboard and a code window
          floating in the side margins. */}
      <span
        className="cq-v2-panel left-[5%] top-[30%] hidden md:block"
        style={{ "--tilt": "-5deg" } as CSSProperties}
      >
        <span className="flex items-center gap-1">
          <span className="cq-v2-panel-dot" />
          <span className="cq-v2-panel-dot" />
          <span className="cq-v2-panel-dot" />
        </span>
        <span className="mt-2 flex h-9 items-end gap-1.5">
          <span className="cq-v2-bar h-6" />
          <span className="cq-v2-bar h-9" style={{ "--bd": "-1.1s" } as CSSProperties} />
          <span className="cq-v2-bar h-5" style={{ "--bd": "-2.2s" } as CSSProperties} />
          <span className="cq-v2-bar h-7" style={{ "--bd": "-0.6s" } as CSSProperties} />
        </span>
      </span>
      <span
        className="cq-v2-panel right-[5%] top-[54%] hidden md:block"
        style={{ "--tilt": "4deg", "--pb": "-4.5s" } as CSSProperties}
      >
        <span className="flex items-center gap-1">
          <span className="cq-v2-panel-dot" />
          <span className="cq-v2-panel-dot" />
          <span className="cq-v2-panel-dot" />
        </span>
        <span className="mt-2.5 block space-y-2">
          <span className="cq-v2-code-row block w-3/4" />
          <span className="cq-v2-code-row ml-3 block w-1/2 opacity-70" />
          <span className="cq-v2-code-row ml-3 block w-3/5 opacity-80" />
          <span className="flex items-center gap-1.5">
            <span className="cq-v2-code-row block w-1/3" />
            <span className="cq-v2-cursor" />
          </span>
        </span>
      </span>
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
