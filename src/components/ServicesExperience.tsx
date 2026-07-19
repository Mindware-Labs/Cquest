"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type Variants,
} from "motion/react";

type ServiceId = "call-center" | "bpo" | "systems";

type Detail = {
  title: string;
  description: string;
  icon: "headset" | "trend" | "banknote" | "gauge" | "userplus" | "layers" | "database" | "messages" | "layout" | "chart" | "workflow" | "code";
};

type Service = {
  id: ServiceId;
  label: string;
  shortLabel: string;
  strapline: string;
  description: string;
  color: string;
  glow: string;
  href: string;
  details: Detail[];
};

const SERVICES: Service[] = [
  {
    id: "call-center",
    label: "Call Center",
    shortLabel: "Every customer moment, covered",
    strapline: "Inbound and outbound contact-center operations across every channel.",
    description:
      "Customer support, sales and follow-up designed around the moments that matter to your customers.",
    color: "#3f738d",
    glow: "#74c3d5",
    href: "/services/call-center",
    details: [
      { title: "Customer service", icon: "headset", description: "Inbound support across phone, email, chat and social media." },
      { title: "Sales", icon: "trend", description: "Outbound campaigns, telesales, lead generation and closing." },
      { title: "Collections", icon: "banknote", description: "Portfolio recovery and collections with professional protocols." },
      { title: "Surveys", icon: "gauge", description: "Satisfaction studies, market polls and NPS measurement." },
      { title: "Onboarding", icon: "userplus", description: "Welcome, activation and early follow-up for new customers." },
    ],
  },
  {
    id: "bpo",
    label: "BPO",
    shortLabel: "The work behind your operation",
    strapline: "Repeatable work, run accurately at volume.",
    description:
      "Back office, data processing and omnichannel support under clear SLAs.",
    color: "#176c79",
    glow: "#80bc00",
    href: "/services/bpo",
    details: [
      { title: "Back office", icon: "layers", description: "The repeatable work that keeps an operation moving." },
      { title: "Data processing", icon: "database", description: "Information handled accurately and consistently at scale." },
      { title: "Omnichannel support", icon: "messages", description: "Support coordinated across your operational channels." },
    ],
  },
  {
    id: "systems",
    label: "Systems Development",
    shortLabel: "Software shaped around how you work",
    strapline: "Custom systems for operations.",
    description:
      "CRMs, dashboards and operations automation built around how your business actually works.",
    color: "#4b98b1",
    glow: "#d6d1ca",
    href: "/services/systems",
    details: [
      { title: "CRMs", icon: "layout", description: "Custom systems for customer and operational relationships." },
      { title: "Dashboards", icon: "chart", description: "Operational visibility for better-informed decisions." },
      { title: "Operations automation", icon: "workflow", description: "Workflows designed around the way your operation runs." },
    ],
  },
];

// Radius must clear the central seal plus the crowned node's own scaled-up
// footprint (ring at 1.12x + its halo ring) with margin to spare — the
// previous minimum (6.4rem) was only enough for the quiet, unscaled nodes,
// so the active node visually sat behind/inside the seal at narrow widths.
const ORBIT = [
  { angle: -90, radius: "clamp(7.6rem, 13vw, 9.6rem)" },
  { angle: 30, radius: "clamp(7.6rem, 13vw, 9.6rem)" },
  { angle: 150, radius: "clamp(7.6rem, 13vw, 9.6rem)" },
];

const SERVICE_PANEL_ID = "cq-services";
const EASE_OUT = [0.22, 1, 0.36, 1] as const; // ease-out-quint
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const CAPABILITY_DWELL_MS = 3200;

/* Headline lines, split into words so each can rise out of its own mask. */
const HEADLINE: string[][] = [
  ["One", "operation."],
  ["Three", "ways", "to", "move", "forward."],
];

/* ── Entrance choreography ────────────────────────────────
   The stage assembles instead of fading in as one: guide rings draw first,
   the three nodes pop in sequence on ease-out-expo, and the seal lands last
   on a spring.
   All children key off the parent's hidden/show via variant propagation;
   delays are explicit (custom index) so the order is deterministic. */
const wordVariants: Variants = {
  hidden: { y: "112%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 0.75, ease: EASE_OUT, delay: 0.08 + i * 0.06 },
  }),
};

const guideRingVariants: Variants = {
  hidden: { opacity: 0, scale: 0.78, filter: "blur(6px)" },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_OUT, delay: 0.12 + i * 0.11 },
  }),
};

const nodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.45 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.42 + i * 0.13 },
  }),
};

const sealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 26, delay: 0.72 },
  },
};

function ServiceIcon({ name }: { name: Detail["icon"] }) {
  const props = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths = {
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="2.5" y="13.5" width="4" height="6.5" rx="2" /><rect x="17.5" y="13.5" width="4" height="6.5" rx="2" /><path d="M19.5 20a3 3 0 0 1-3 3h-3" /></>,
    trend: <><path d="M22 7 13.5 15.5 8.5 10.5 2 17" /><path d="M16 7h6v6" /></>,
    banknote: <><rect x="2.5" y="6.5" width="19" height="11" rx="2.5" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>,
    gauge: <><path d="M4.5 16.5a7.5 7.5 0 0 1 15 0" /><path d="M12 16.5 15.5 11.5" /><circle cx="12" cy="16.5" r="1.3" /></>,
    userplus: <><circle cx="9.5" cy="8" r="3.5" /><path d="M3.5 20a6 6 0 0 1 12 0" /><path d="M18.5 8.5v5M16 11h5" /></>,
    layers: <><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    database: <><ellipse cx="12" cy="6" rx="7.5" ry="3" /><path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" /><path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" /></>,
    messages: <><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></>,
    layout: <><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M3 9h18M9 21V9" /></>,
    chart: <><path d="M3 21h18" /><rect x="5" y="11" width="3.4" height="7" rx="1" /><rect x="10.3" y="7" width="3.4" height="11" rx="1" /><rect x="15.6" y="13" width="3.4" height="5" rx="1" /></>,
    workflow: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /><path d="M7 11v2.5A2.5 2.5 0 0 0 9.5 16H13" /></>,
    code: <><path d="m8 6-6 6 6 6" /><path d="m16 6 6 6-6 6" /><path d="m14.5 4-5 16" /></>,
  };

  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0" {...props}>
      {paths[name]}
    </svg>
  );
}

function ServicePanel({
  service,
  ambient,
  reduced,
  selected,
}: {
  service: Service;
  ambient: boolean;
  reduced: boolean;
  selected: boolean;
}) {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  // Agency: once the reader picks a capability by hand, the carousel stops
  // wrestling for the wheel — auto-rotation stays off until this service is
  // freshly re-selected. The interface never takes back control it ceded.
  const [userDriven, setUserDriven] = useState(false);

  // Whichever capability was showing last time this service was picked, a
  // fresh selection always opens on the first one — never wherever the
  // ambient rotation (or a prior visit) had left it. Reset during render
  // (React's documented pattern for state-on-prop-change) instead of an
  // effect, so it lands before paint with no extra render pass.
  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    if (selected) {
      setActive(0);
      setUserDriven(false);
    }
  }

  // True while the auto-rotation timer is actually counting down — drives the
  // dwell arc so the reader can see when the next capability will land.
  const dwellRunning = ambient && !pinned && !reduced && !userDriven;

  // Auto-rotating capability spotlight. setTimeout (not setInterval) so every
  // resume — after hover, tab switch or scroll-out — restarts a full dwell.
  useEffect(() => {
    if (reduced || !ambient || pinned || userDriven) return;
    const timer = setTimeout(
      () => setActive((current) => (current + 1) % service.details.length),
      CAPABILITY_DWELL_MS,
    );
    return () => clearTimeout(timer);
  }, [active, ambient, pinned, reduced, userDriven, service.details.length]);

  return (
    <section
      id={`${SERVICE_PANEL_ID}-${service.id}-panel`}
      data-panel={service.id}
      aria-labelledby={`${SERVICE_PANEL_ID}-${service.id}-label`}
      className="cq-service-panel"
      style={{ "--svc": service.color, "--svc-glow": service.glow } as CSSProperties}
    >
      <span aria-hidden className="cq-panel-spine" />

      <div className="cq-panel-identity relative flex items-center gap-3">
        <span className="cq-panel-chip flex h-11 w-11 shrink-0 items-center justify-center">
          <ServiceIcon name={service.id === "call-center" ? "headset" : service.id === "bpo" ? "layers" : "code"} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="cq-panel-eyebrow">Business line</p>
          <p className="cq-panel-label mt-0.5 text-[.95rem] font-semibold text-foreground">{service.label}</p>
        </div>
      </div>

      <span aria-hidden className="cq-panel-label-rule relative mt-6 block" />

      {/* The headline rises out of its own line mask on panel arrival — the
          same typographic gesture as the section's main headline. */}
      <h2 className="cq-panel-headline relative mt-7 font-heading text-[clamp(1.5rem,2.4vw,1.95rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-foreground" style={{ textWrap: "balance" }}>
        <span className="cq-panel-headline-inner">{service.shortLabel}</span>
      </h2>

      <div className="cq-panel-summary relative mt-7">
        <p className="cq-panel-strapline max-w-[46ch] text-[.95rem] leading-relaxed text-foreground/90">{service.strapline}</p>
        <p className="cq-panel-description mt-2 max-w-[48ch] text-sm">{service.description}</p>
      </div>

      <div
        className="cq-flow relative"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setPinned(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setPinned(false);
        }}
      >
        <div
          className="cq-flow-stage"
          role="group"
          aria-roledescription="carousel"
          aria-label={`${service.label} capabilities`}
        >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={service.details[active].title}
                className="cq-flow-entry"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={
                  reduced
                    ? { opacity: 0, transition: { duration: 0.12 } }
                    : { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.25, ease: "easeIn" } }
                }
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Typographic dissolution: the title rises out of a line mask,
                    then the prose condenses into focus beneath it. */}
                <div className="cq-flow-body">
                  <h3 className="cq-flow-title">
                    <motion.span
                      className="cq-flow-title-inner"
                      initial={reduced ? false : { y: "115%" }}
                      animate={{ y: "0%" }}
                      transition={
                        reduced
                          ? { duration: 0.15 }
                          : { duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.05 }
                      }
                    >
                      {service.details[active].title}
                    </motion.span>
                  </h3>
                  <motion.p
                    className="cq-flow-desc"
                    initial={reduced ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={
                      reduced
                        ? { duration: 0.15 }
                        : { duration: 0.5, ease: EASE_OUT_QUART, delay: 0.14 }
                    }
                  >
                    {service.details[active].description}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>
        </div>

        {/* Closing line: anchor glyphs left, a fine hairline CTA right — the
            panel ends where the reading does, with the way deeper in. */}
        <div className="cq-flow-foot">
          <div className="cq-flow-anchors">
            {service.details.map((detail, index) => (
              <button
                key={detail.title}
                type="button"
                className="cq-flow-anchor"
                style={{ "--ai": index } as CSSProperties}
                data-active={index === active ? "" : undefined}
                aria-label={`Show ${detail.title}`}
                aria-current={index === active}
                onClick={() => {
                  setUserDriven(true);
                  setActive(index);
                }}
              >
                {/* Dwell arc: a hairline that draws a full turn over the dwell,
                    announcing when the spotlight will move on. Unmounts while
                    hovered/paused; every remount restarts a full dwell, exactly
                    mirroring the timer above. */}
                {index === active && dwellRunning && (
                  <motion.svg
                    key={`dwell-${active}`}
                    aria-hidden
                    className="cq-flow-anchor-dwell"
                    viewBox="0 0 40 40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <motion.circle
                      cx="20"
                      cy="20"
                      r="18.25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      transform="rotate(-90 20 20)"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: CAPABILITY_DWELL_MS / 1000, ease: "linear" }}
                    />
                  </motion.svg>
                )}
                <ServiceIcon name={detail.icon} />
                <span aria-hidden className="cq-flow-anchor-tip">{detail.title}</span>
              </button>
            ))}
          </div>
          <Link
            href={service.href}
            className="cq-panel-cta shrink-0"
            onPointerMove={(event) => {
              // Magnetic lean: the pill drifts a few px toward the cursor.
              if (reduced || event.pointerType !== "mouse") return;
              const bounds = event.currentTarget.getBoundingClientRect();
              const dx = (event.clientX - bounds.left - bounds.width / 2) * 0.14;
              const dy = (event.clientY - bounds.top - bounds.height / 2) * 0.26;
              event.currentTarget.style.setProperty("--ctax", `${Math.max(-4, Math.min(4, dx)).toFixed(1)}px`);
              event.currentTarget.style.setProperty("--ctay", `${Math.max(-3, Math.min(3, dy)).toFixed(1)}px`);
            }}
            onPointerLeave={(event) => {
              event.currentTarget.style.setProperty("--ctax", "0px");
              event.currentTarget.style.setProperty("--ctay", "0px");
            }}
          >
            <span aria-hidden className="cq-panel-cta-sheen" />
            <span>
              Explore
              <span className="hidden sm:inline">&nbsp;{service.label}</span>
            </span>
            <span aria-hidden className="cq-panel-cta-orb">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ServicesExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(sectionRef, { amount: 0.08 });
  /* First reveal: the panel column holds at --show:0 (CSS gate on
     data-revealed) until it actually scrolls into view, then the active
     panel runs the SAME assembly cascade a selection gets. This replaces
     the old container-level blur entrance, which sat on top of the panels
     and swallowed the cascade if the user switched spheres right after
     arriving — the "first switch doesn't animate" bug. */
  const panelsRef = useRef<HTMLDivElement>(null);
  const panelsRevealed = useInView(panelsRef, { once: true, amount: 0.2 });
  const [tabVisible, setTabVisible] = useState(true);
  const [stageHover, setStageHover] = useState(false);
  // Armed after the first user selection so the crowning shockwave and logo
  // pulse never fire on page load, only on interaction.
  const [armed, setArmed] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [selectedService, setSelectedService] = useState<ServiceId>("call-center");
  const activeColor = SERVICES.find((entry) => entry.id === selectedService)?.color ?? SERVICES[0].color;

  /* Selection comet: when the choice moves to another sphere, a spark leaves
     the old node and rides the orbit's arc to the new one — the crown visibly
     travels instead of teleporting. Node positions are measured from the DOM
     at launch time so the flight starts wherever the orbit has rotated to. */
  const stageRef = useRef<HTMLDivElement>(null);
  const cometKey = useRef(0);
  const lastService = useRef<ServiceId>("call-center");
  const [comet, setComet] = useState<{ key: number; xs: number[]; ys: number[]; color: string } | null>(null);

  const launchComet = (next: ServiceId) => {
    const prev = lastService.current;
    lastService.current = next;
    const stage = stageRef.current;
    if (reduced || prev === next || !stage) return;
    const box = stage.getBoundingClientRect();
    const fromRing = stage.querySelector(`[data-service-label="${prev}"] .cq-service-ring`);
    const toRing = stage.querySelector(`[data-service-label="${next}"] .cq-service-ring`);
    if (!fromRing || !toRing) return;
    const fb = fromRing.getBoundingClientRect();
    const tb = toRing.getBoundingClientRect();
    const cx = box.width / 2;
    const cy = box.height / 2;
    const fx = fb.left + fb.width / 2 - box.left;
    const fy = fb.top + fb.height / 2 - box.top;
    const tx = tb.left + tb.width / 2 - box.left;
    const ty = tb.top + tb.height / 2 - box.top;
    // Shortest arc between the two node angles, at their shared orbit radius.
    const a0 = Math.atan2(fy - cy, fx - cx);
    let a1 = Math.atan2(ty - cy, tx - cx);
    if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI;
    if (a0 - a1 > Math.PI) a1 += 2 * Math.PI;
    const radius = (Math.hypot(fx - cx, fy - cy) + Math.hypot(tx - cx, ty - cy)) / 2;
    // Ease is baked into the samples (linear between keyframes plays it back),
    // so the spark accelerates out of the old node and brakes into the new.
    const STEPS = 10;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let step = 0; step <= STEPS; step++) {
      const t = step / STEPS;
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const angle = a0 + (a1 - a0) * eased;
      xs.push(cx + Math.cos(angle) * radius);
      ys.push(cy + Math.sin(angle) * radius);
    }
    cometKey.current += 1;
    const color = SERVICES.find((entry) => entry.id === next)?.color ?? SERVICES[0].color;
    setComet({ key: cometKey.current, xs, ys, color });
  };

  /* Orbit driven in JS instead of CSS keyframes so its speed can be eased:
     the constellation dilates to ~45% while the pointer explores the stage,
     and winds down to a stop when the section is off-screen. */
  const orbitAngle = useMotionValue(0);
  const counterAngle = useTransform(orbitAngle, (v) => -v);
  const orbitSpeed = useRef(1);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 28,
    restDelta: 0.001,
  });
  // Scroll velocity stirs the constellation: a flick of the wheel briefly
  // quickens the orbit, then it settles back — the stage feels inhabited.
  const scrollVelocity = useVelocity(scrollYProgress);
  const ambientY = useTransform(
    smoothProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["-7%", "7%"],
  );
  const gridOpacity = useTransform(
    smoothProgress,
    [0, 0.28, 0.72, 1],
    [0, 0.5, 0.5, 0],
  );
  const stageY = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    reduced ? [0, 0, 0] : [30, 0, -26],
  );
  const stageScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    reduced ? [1, 1, 1] : [0.94, 1, 0.975],
  );
  const panelY = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    reduced ? [0, 0, 0] : [44, 0, -16],
  );

  useEffect(() => {
    const syncVisibility = () => setTabVisible(!document.hidden);

    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const ambientActive = !reduced && inView && tabVisible;

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const stir = ambientActive ? Math.min(Math.abs(scrollVelocity.get()) * 1.3, 1.1) : 0;
    const target = (!ambientActive ? 0 : stageHover ? 0.45 : 1) + stir;
    // Ease the speed toward its target so pauses, dilation and scroll stirs
    // feel organic, never a hard gear change.
    orbitSpeed.current += (target - orbitSpeed.current) * Math.min(1, delta / 320);
    orbitAngle.set((orbitAngle.get() + (360 / 38000) * delta * orbitSpeed.current) % 360);
  });

  return (
    <section
      ref={sectionRef}
      id="services"
      data-ambient-active={ambientActive}
      data-revealed={panelsRevealed ? "" : undefined}
      /* --svc-active lives on the section (not just the grid columns) so the
         ambient layers behind everything — service orb, central tint — can
         re-light themselves in the selected service's colour. */
      style={{ "--svc-active": activeColor } as CSSProperties}
      className="cq-services relative isolate overflow-hidden py-16 text-foreground sm:py-20 lg:py-24"
    >
      <motion.div aria-hidden style={{ y: ambientY }} className="pointer-events-none absolute -inset-y-[9%] -inset-x-[8%] overflow-hidden">
        <div className="cq-services-mesh absolute -inset-[12%]" />
        <div className="cq-orb left-[-12rem] top-[-13rem] h-[36rem] w-[36rem] bg-celeste/35" style={{ animation: "cq-float-a 22s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb bottom-[-15rem] right-[-10rem] h-[34rem] w-[34rem] bg-petroleo/20" style={{ animation: "cq-float-b 26s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb left-[42%] top-[32%] h-[24rem] w-[24rem] bg-verde/12" style={{ animation: "cq-float-c 20s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        {/* The selection's own light: an orb over the panel column that
            cross-blends to whichever service is active. */}
        <div className="cq-orb cq-orb-svc right-[4%] top-[16%] h-[28rem] w-[28rem]" style={{ animation: "cq-float-b 24s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse" }} />
        {/* Whisper wash of the active service colour over the section's heart. */}
        <div className="cq-services-tint absolute inset-0" />
      </motion.div>
      <motion.div aria-hidden style={{ opacity: gridOpacity }} className="cq-services-grid pointer-events-none absolute inset-0" />
      {/* Photographic grain: removes the digital sterility of the gradients. */}
      <div aria-hidden className="cq-noise pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12">
        <motion.header
          initial={reduced ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.28 }}
          className="mx-auto max-w-[44rem] text-center"
        >
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
            }}
            className="text-sm font-semibold text-petroleo"
          >
            Our services
          </motion.p>
          {/* Each word rises out of its own mask, cascading across both lines. */}
          {/* h2, not h1 — the hero owns the page's single h1. */}
          <h2 className="mt-2 font-heading text-[clamp(1.9rem,4vw,3.3rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground">
            {HEADLINE.map((line, lineIndex) => (
              <span key={lineIndex} className="block">
                {line.map((word, wordIndex) => (
                  <span key={`${word}-${wordIndex}`} className="cq-word">
                    <motion.span
                      className="cq-word-inner"
                      custom={(lineIndex === 0 ? 0 : HEADLINE[0].length) + wordIndex}
                      variants={wordVariants}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h2>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.6, ease: EASE_OUT, delay: 0.5 },
              },
            }}
            className="mx-auto mt-3 max-w-[56ch] text-pretty text-[.95rem] leading-6 text-[var(--text-secondary)] sm:text-base"
          >
            Explore the capability that best fits your next business move.
          </motion.p>
        </motion.header>

        <div className="cq-services-grid-cols relative mt-8 grid items-center gap-7 lg:mt-9 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,1fr)] lg:gap-10">
          {/* Bridge: a soft glow in the shared accent colour, seated in the gap
              between the diagram and the panel, so the two halves read as one
              linked system instead of two things that happen to sit side by
              side — echoes whichever service is currently selected. */}
          <span aria-hidden className="cq-services-bridge hidden lg:block" />
          <motion.div
            variants={{
              hidden: { opacity: 0, filter: "blur(10px)" },
              show: {
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: 0.85, ease: EASE_OUT },
              },
            }}
            initial={reduced ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.16 }}
            style={{ y: stageY, scale: stageScale }}
            className="relative mx-auto w-full max-w-[29rem]"
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setStageHover(true);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setStageHover(false);
            }}
          >
            <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[24rem]">
              {/* Assembly: the guide rings draw outward-in before the nodes land. */}
              <motion.div aria-hidden custom={0} variants={guideRingVariants} className="absolute inset-[8%] rounded-full border border-[1.5px] border-petroleo/60" />
              <motion.div aria-hidden custom={1} variants={guideRingVariants} className="absolute inset-[20%] rounded-full border border-[1.5px] border-celeste/80" />
              <motion.div aria-hidden custom={2} variants={guideRingVariants} className="absolute inset-[35%] rounded-full border border-[1.5px] border-petroleo/50" />
              <><div aria-hidden className="cq-ring inset-[19%]" /><div aria-hidden className="cq-ring inset-[19%]" style={{ animationDelay: "-5.1s" }} /></>

              <motion.fieldset
                className="cq-service-orbit absolute inset-0 z-10 m-0 border-0 p-0"
                style={{ rotate: orbitAngle }}
                data-armed={armed || undefined}
                onChange={(event) => {
                  setArmed(true);
                  setPulseKey((key) => key + 1);
                  // The change bubbles from whichever radio was picked.
                  if (event.target instanceof HTMLInputElement) {
                    const next = event.target.value as ServiceId;
                    setSelectedService(next);
                    launchComet(next);
                  }
                }}
              >
                <legend className="sr-only">Center Quest business lines</legend>
                {SERVICES.map((service, index) => {
                  const orbit = ORBIT[index];
                  return (
                    <div
                      key={service.id}
                      className="absolute left-1/2 top-1/2"
                      /* transformOrigin pins the pivot to this exact anchor point
                         (the container's true center) regardless of the child
                         label's own rendered size — without it, the pivot
                         defaults to the wrapper's own content box center, which
                         differs per node ("BPO" vs "Call Center" text width,
                         plus the selected node's larger scale), throwing the
                         three nodes off a shared radius asymmetrically. */
                      style={{
                        transform: `rotate(${orbit.angle}deg) translateY(calc(${orbit.radius} * -1)) rotate(${-orbit.angle}deg)`,
                        transformOrigin: "0 0",
                      }}
                    >
                      <motion.div
                        className="cq-service-orbit-counter"
                        /* Same fix as the parent wrapper: without a pinned
                           transformOrigin, Framer Motion pivots this div's
                           counter-rotation and entrance scale around its OWN
                           content-box center, which grows with the label
                           (icon + name, bigger still for the crowned/scaled
                           node) — as the outer orbit keeps rotating, that
                           mismatched pivot makes the node visibly drift off
                           its radius over time, occasionally right behind
                           the seal. Pinning both to the same anchor point
                           keeps every node on its true circle always. */
                        style={{ rotate: counterAngle, transformOrigin: "0 0" }}
                        custom={index}
                        variants={nodeVariants}
                      >
                        <input
                          id={`${SERVICE_PANEL_ID}-${service.id}-control`}
                          className="cq-service-control sr-only"
                          type="radio"
                          name="center-quest-service"
                          value={service.id}
                          defaultChecked={service.id === "call-center"}
                          data-service-control={service.id}
                          aria-label={service.label}
                        />
                        <label
                          id={`${SERVICE_PANEL_ID}-${service.id}-label`}
                          htmlFor={`${SERVICE_PANEL_ID}-${service.id}-control`}
                          data-service-label={service.id}
                          style={{ "--svc": service.color, "--oi": index } as CSSProperties}
                          className="cq-service-node group relative flex -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation flex-col items-center gap-2 text-center"
                          onPointerMove={(event) => {
                            if (reduced || event.pointerType !== "mouse") return;
                            const bounds = event.currentTarget.getBoundingClientRect();
                            const dx = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
                            const dy = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
                            event.currentTarget.style.setProperty("--mx", `${dx.toFixed(1)}px`);
                            event.currentTarget.style.setProperty("--my", `${dy.toFixed(1)}px`);
                          }}
                          onPointerLeave={(event) => {
                            event.currentTarget.style.setProperty("--mx", "0px");
                            event.currentTarget.style.setProperty("--my", "0px");
                          }}
                        >
                          <span aria-hidden className="cq-service-ring">
                            <ServiceIcon name={service.id === "call-center" ? "headset" : service.id === "bpo" ? "layers" : "code"} />
                          </span>
                          <span className="cq-service-name">{service.id === "systems" ? "Systems" : service.label}</span>
                        </label>
                      </motion.div>
                    </div>
                  );
                })}
              </motion.fieldset>

              <div className="absolute left-1/2 top-1/2 z-20 flex h-[5.6rem] w-[5.6rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 backdrop-blur-md p-3 shadow-[0_12px_34px_-16px_rgba(15,57,73,.6),0_2px_6px_-3px_rgba(15,57,73,.2),0_0_0_1.5px_rgba(63,115,141,0.2),0_0_20px_2px_rgba(116,195,213,0.25)] ring-1 ring-inset ring-petroleo/30 sm:h-[7rem] sm:w-[7rem] sm:p-3.5">
                {/* The seal lands last in the assembly sequence… */}
                <motion.div variants={sealVariants} className="flex items-center justify-center">
                  {/* …and this keyed remount pulses it each time a selection lands. */}
                  <motion.div
                    key={pulseKey}
                    animate={pulseKey > 0 && !reduced ? { scale: [1, 1.05, 1] } : undefined}
                    transition={{ duration: 0.55, ease: EASE_OUT }}
                    className="flex items-center justify-center"
                  >
                    <Image src="/logo.png" alt="Center Quest" width={206} height={152} priority className="h-auto w-[4.3rem] sm:w-[5.2rem]" />
                  </motion.div>
                </motion.div>
              </div>

              {/* The selection comet, flying the arc between spheres. */}
              {comet && (
                <motion.span
                  key={comet.key}
                  aria-hidden
                  className="cq-comet z-[15]"
                  style={{ "--comet": comet.color } as CSSProperties}
                  initial={{ x: comet.xs[0], y: comet.ys[0], opacity: 0, scale: 0.4 }}
                  animate={{
                    x: comet.xs,
                    y: comet.ys,
                    opacity: [0, 1, 1, 1, 0],
                    scale: [0.4, 1, 1, 1, 0.5],
                  }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  onAnimationComplete={() => setComet(null)}
                />
              )}
            </div>
          </motion.div>

          {/* No container-level entrance here: the first reveal is the
              panels' own assembly cascade (gated on data-revealed above), so
              nothing ever sits on top of it and swallows the choreography. */}
          <motion.div
            ref={panelsRef}
            style={{ y: panelY }}
            className="cq-service-panels min-h-[17rem] py-4 lg:py-10"
          >
            {SERVICES.map((service) => (
              <ServicePanel
                key={service.id}
                service={service}
                ambient={ambientActive}
                reduced={reduced}
                selected={service.id === selectedService}
              />
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
