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
    href: "/servicios/call-center",
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
    href: "/servicios/bpo",
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
    href: "/servicios/sistemas",
    details: [
      { title: "CRMs", icon: "layout", description: "Custom systems for customer and operational relationships." },
      { title: "Dashboards", icon: "chart", description: "Operational visibility for better-informed decisions." },
      { title: "Operations automation", icon: "workflow", description: "Workflows designed around the way your operation runs." },
    ],
  },
];

const ORBIT = [
  { angle: -90, radius: "clamp(6.4rem, 12vw, 8.6rem)" },
  { angle: 30, radius: "clamp(6.4rem, 12vw, 8.6rem)" },
  { angle: 150, radius: "clamp(6.4rem, 12vw, 8.6rem)" },
];

const SERVICE_PANEL_ID = "cq-services";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const CAPABILITY_DWELL_MS = 3200;

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
}: {
  service: Service;
  ambient: boolean;
  reduced: boolean;
}) {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Auto-rotating capability spotlight. setTimeout (not setInterval) so every
  // resume — after hover, tab switch or scroll-out — restarts a full dwell.
  useEffect(() => {
    if (reduced || !ambient || pinned) return;
    const timer = setTimeout(
      () => setActive((current) => (current + 1) % service.details.length),
      CAPABILITY_DWELL_MS,
    );
    return () => clearTimeout(timer);
  }, [active, ambient, pinned, reduced, service.details.length]);

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

      <h2 className="relative mt-7 font-heading text-[clamp(1.5rem,2.4vw,1.95rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-foreground" style={{ textWrap: "balance" }}>
        {service.shortLabel}
      </h2>

      <div className="cq-panel-summary relative mt-7">
        <p className="cq-panel-strapline max-w-[46ch] text-[.95rem] leading-relaxed text-foreground/90">{service.strapline}</p>
        <p className="cq-panel-description mt-2 max-w-[48ch] text-sm text-muted">{service.description}</p>
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
                    : { opacity: 0, y: -6, transition: { duration: 0.22, ease: "easeIn" } }
                }
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Typographic dissolution: title, then prose, rise into place. */}
                <div className="cq-flow-body">
                  <motion.h3
                    className="cq-flow-title"
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0.15 }
                        : { type: "spring", duration: 0.55, bounce: 0, delay: 0.08 }
                    }
                  >
                    {service.details[active].title}
                  </motion.h3>
                  <motion.p
                    className="cq-flow-desc"
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0.15 }
                        : { type: "spring", duration: 0.6, bounce: 0, delay: 0.14 }
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
                data-active={index === active ? "" : undefined}
                aria-label={`Show ${detail.title}`}
                aria-current={index === active}
                onClick={() => setActive(index)}
              >
                <ServiceIcon name={detail.icon} />
                <span aria-hidden className="cq-flow-anchor-tip">{detail.title}</span>
              </button>
            ))}
          </div>
          <Link href={service.href} className="cq-panel-cta shrink-0">
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
  const [tabVisible, setTabVisible] = useState(true);
  const [stageHover, setStageHover] = useState(false);
  // Armed after the first user selection so the crowning shockwave and logo
  // pulse never fire on page load, only on interaction.
  const [armed, setArmed] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

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
  const ambientY = useTransform(
    smoothProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["-7%", "7%"],
  );
  const gridOpacity = useTransform(
    smoothProgress,
    [0, 0.28, 0.72, 1],
    [0, 0.35, 0.35, 0],
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
    const target = !ambientActive ? 0 : stageHover ? 0.45 : 1;
    // Ease the speed toward its target so pauses and dilation feel organic,
    // never a hard gear change.
    orbitSpeed.current += (target - orbitSpeed.current) * Math.min(1, delta / 320);
    orbitAngle.set((orbitAngle.get() + (360 / 38000) * delta * orbitSpeed.current) % 360);
  });

  return (
    <section
      ref={sectionRef}
      id="servicios"
      data-ambient-active={ambientActive}
      className="cq-services relative isolate scroll-mt-6 overflow-hidden py-16 text-foreground sm:py-20 lg:py-24"
    >
      <motion.div aria-hidden style={{ y: ambientY }} className="pointer-events-none absolute -inset-y-[9%] -inset-x-[8%] overflow-hidden">
        <div className="cq-services-mesh absolute -inset-[12%]" />
        <div className="cq-orb left-[-12rem] top-[-13rem] h-[36rem] w-[36rem] bg-celeste/30" style={{ animation: "cq-float-a 22s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb bottom-[-15rem] right-[-10rem] h-[34rem] w-[34rem] bg-petroleo/16" style={{ animation: "cq-float-b 26s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb left-[42%] top-[32%] h-[24rem] w-[24rem] bg-verde/8" style={{ animation: "cq-float-c 20s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
      </motion.div>
      <motion.div aria-hidden style={{ opacity: gridOpacity }} className="cq-services-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12">
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.28 }}
          transition={{ duration: reduced ? 0 : 0.65, ease: EASE_OUT }}
          className="mx-auto max-w-[44rem] text-center"
        >
          <p className="text-sm font-semibold text-petroleo">Our services</p>
          <h1 className="mt-2 font-heading text-[clamp(1.9rem,4vw,3.3rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground text-balance">
            One operation.
            <br />
            Three ways to move forward.
          </h1>
          <p className="mx-auto mt-3 max-w-[56ch] text-pretty text-[.95rem] leading-6 text-muted sm:text-base">
            Explore the capability that best fits your next business move.
          </p>
        </motion.header>

        <div className="mt-8 grid items-center gap-7 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,.82fr)] lg:gap-10">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: reduced ? 0 : 0.7, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
            style={{ y: stageY, scale: stageScale }}
            className="relative mx-auto w-full max-w-[32rem]"
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setStageHover(true);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setStageHover(false);
            }}
          >
            <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
              <div aria-hidden className="absolute inset-[8%] rounded-full border border-petroleo/30" />
              <div aria-hidden className="absolute inset-[20%] rounded-full border border-celeste/45" />
              <div aria-hidden className="absolute inset-[35%] rounded-full border border-petroleo/20" />
              <><div aria-hidden className="cq-ring inset-[19%]" /><div aria-hidden className="cq-ring inset-[19%]" style={{ animationDelay: "-5.1s" }} /></>

              <motion.fieldset
                className="cq-service-orbit absolute inset-0 m-0 border-0 p-0"
                style={{ rotate: orbitAngle }}
                data-armed={armed || undefined}
                onChange={() => {
                  setArmed(true);
                  setPulseKey((key) => key + 1);
                }}
              >
                <legend className="sr-only">Center Quest business lines</legend>
                {SERVICES.map((service, index) => {
                  const orbit = ORBIT[index];
                  return (
                    <div
                      key={service.id}
                      className="absolute left-1/2 top-1/2"
                      style={{ transform: `rotate(${orbit.angle}deg) translateY(calc(${orbit.radius} * -1)) rotate(${-orbit.angle}deg)` }}
                    >
                      <motion.div className="cq-service-orbit-counter" style={{ rotate: counterAngle }}>
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

              <div className="absolute left-1/2 top-1/2 flex h-[6.4rem] w-[6.4rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-3.5 shadow-[0_12px_34px_-16px_rgba(15,57,73,.5),0_2px_6px_-3px_rgba(15,57,73,.16)] ring-1 ring-inset ring-petroleo/10 sm:h-[8rem] sm:w-[8rem] sm:p-4">
                {/* Keyed remount pulses the seal each time a selection lands. */}
                <motion.div
                  key={pulseKey}
                  animate={pulseKey > 0 && !reduced ? { scale: [1, 1.035, 1] } : undefined}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="flex items-center justify-center"
                >
                  <Image src="/logo.png" alt="Center Quest" width={206} height={152} priority className="h-auto w-[4.9rem] sm:w-[5.9rem]" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: reduced ? 0 : 0.6, ease: EASE_OUT, delay: reduced ? 0 : 0.16 }}
            style={{ y: panelY }}
            className="cq-service-panels min-h-[17rem]"
          >
            {SERVICES.map((service) => (
              <ServicePanel key={service.id} service={service} ambient={ambientActive} reduced={reduced} />
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
