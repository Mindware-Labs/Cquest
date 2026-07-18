"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

type ServiceId = "call-center" | "bpo" | "systems";

type Detail = {
  title: string;
  description: string;
  icon: "headset" | "chart" | "shield" | "pulse" | "spark" | "layers" | "database" | "messages" | "layout" | "workflow" | "code";
};

type Service = {
  id: ServiceId;
  label: string;
  shortLabel: string;
  strapline: string;
  description: string;
  color: string;
  glow: string;
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
    details: [
      { title: "Customer service", icon: "headset", description: "Inbound support across phone, email, chat and social media." },
      { title: "Sales", icon: "chart", description: "Outbound campaigns, telesales, lead generation and closing." },
      { title: "Collections", icon: "shield", description: "Portfolio recovery and collections with professional protocols." },
      { title: "Surveys", icon: "pulse", description: "Satisfaction studies, market polls and NPS measurement." },
      { title: "Onboarding", icon: "spark", description: "Welcome, activation and early follow-up for new customers." },
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
    details: [
      { title: "CRMs", icon: "layout", description: "Custom systems for customer and operational relationships." },
      { title: "Dashboards", icon: "chart", description: "Operational visibility for better-informed decisions." },
      { title: "Operations automation", icon: "workflow", description: "Workflows designed around the way your operation runs." },
    ],
  },
];

const ORBIT = [
  { angle: -90, radius: "clamp(5.6rem, 12vw, 8.6rem)" },
  { angle: 30, radius: "clamp(5.6rem, 12vw, 8.6rem)" },
  { angle: 150, radius: "clamp(5.6rem, 12vw, 8.6rem)" },
];

const SERVICE_PANEL_ID = "cq-services";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function ServiceIcon({ name }: { name: Detail["icon"] }) {
  const props = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths = {
    headset: <><path d="M4.8 13.8H3.5a1.5 1.5 0 0 1-1.5-1.5V9a5.8 5.8 0 0 1 11.6 0v3.3a1.5 1.5 0 0 1-1.5 1.5h-1.3" /><path d="M4.8 11.2h1.6v3H4.8zM11.2 11.2h-1.6v3h1.6zM9.6 15.7H7.3" /></>,
    chart: <><path d="M3 13.5V9.8M8 13.5V6.5M13 13.5V3.5" /><path d="M2 13.5h12" /></>,
    shield: <><path d="M8 1.8 13 4v3.7c0 3.3-2 5.5-5 6.5-3-1-5-3.2-5-6.5V4z" /><path d="m5.7 8 1.5 1.5 3.1-3.2" /></>,
    pulse: <><path d="M2 8h2.4l1.3-3.2L8.1 12l1.8-5 1.1 1H14" /><path d="M2 2.5v11M14 2.5v11" /></>,
    spark: <><path d="m8 1.5.9 4.1L13 6.5l-4.1.9L8 11.5l-.9-4.1L3 6.5l4.1-.9z" /><path d="m12.7 11.2.4 1.8 1.9.4-1.9.4-.4 1.9-.4-1.9-1.8-.4 1.8-.4z" /></>,
    layers: <><path d="m8 2 6 3.2L8 8.5 2 5.2z" /><path d="m2 8.2 6 3.3 6-3.3M2 11.2l6 3.3 6-3.3" /></>,
    database: <><ellipse cx="8" cy="3.7" rx="5.5" ry="2.2" /><path d="M2.5 3.7v4.1C2.5 9 5 10 8 10s5.5-1 5.5-2.2V3.7M2.5 7.8v4.1C2.5 13.1 5 14 8 14s5.5-.9 5.5-2.1V7.8" /></>,
    messages: <><path d="M2 3.5h9.5v7H6l-3.2 2.3v-2.3H2z" /><path d="M6.5 12.5h.8l2.8 2v-2h2.4V7.2" /></>,
    layout: <><rect x="2" y="2.5" width="12" height="11" rx="1" /><path d="M2 6h12M5.5 6v7.5" /></>,
    workflow: <><rect x="2" y="2" width="4" height="3.6" rx=".6" /><rect x="10" y="10.4" width="4" height="3.6" rx=".6" /><path d="M6 3.8h2.3A1.7 1.7 0 0 1 10 5.5v4.9M10 12.2H7.7A1.7 1.7 0 0 1 6 10.5V5.6" /></>,
    code: <><path d="m5.8 3-3.5 5 3.5 5M10.2 3l3.5 5-3.5 5M9 2.3 7 13.7" /></>,
  };

  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-5 w-5 shrink-0" {...props}>
      {paths[name]}
    </svg>
  );
}

function ServicePanel({ service }: { service: Service }) {
  return (
    <section
      id={`${SERVICE_PANEL_ID}-${service.id}-panel`}
      data-panel={service.id}
      aria-labelledby={`${SERVICE_PANEL_ID}-${service.id}-label`}
      className="cq-service-panel"
      style={{ "--svc": service.color, "--svc-glow": service.glow } as CSSProperties}
    >
      <span aria-hidden className="cq-panel-orb" />

      <div className="relative flex items-center gap-3.5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ring-1 ring-inset ring-white/25"
          style={{
            backgroundImage: `linear-gradient(140deg, color-mix(in srgb, ${service.color} 72%, white), ${service.color})`,
            boxShadow: `0 6px 14px -5px color-mix(in srgb, ${service.color} 55%, transparent)`,
          }}
        >
          <ServiceIcon name={service.id === "call-center" ? "headset" : service.id === "bpo" ? "layers" : "code"} />
        </span>
        <p className="text-sm font-semibold tracking-tight" style={{ color: `color-mix(in srgb, ${service.color} 70%, var(--foreground))` }}>{service.label}</p>
      </div>

      <h2 className="relative mt-4 font-heading text-[clamp(1.5rem,2.7vw,2.05rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-foreground" style={{ textWrap: "balance" }}>
        {service.shortLabel}
      </h2>
      <p className="relative mt-3 max-w-[50ch] text-[.95rem] leading-6 text-foreground/85">{service.strapline}</p>
      <p className="relative mt-2 max-w-[54ch] text-[.85rem] leading-6 text-muted">{service.description}</p>

      <ul className="cq-detail-grid relative mt-6">
        {service.details.map((detail) => (
          <li key={detail.title} className="cq-detail">
            <span className="cq-detail-icon mt-px shrink-0"><ServiceIcon name={detail.icon} /></span>
            <span>
              <span className="block text-[.9rem] font-semibold leading-tight text-foreground">{detail.title}</span>
              <span className="mt-1 block text-[.8125rem] leading-5 text-muted">{detail.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ServicesExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(sectionRef, { amount: 0.08 });
  const [tabVisible, setTabVisible] = useState(true);
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
    [0, 0.7, 0.7, 0],
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

  return (
    <section
      ref={sectionRef}
      id="servicios"
      data-ambient-active={ambientActive}
      className="cq-services relative isolate scroll-mt-6 overflow-hidden bg-[#fafdff] py-16 text-foreground sm:py-20 lg:py-24"
    >
      <motion.div aria-hidden style={{ y: ambientY }} className="pointer-events-none absolute -inset-y-[9%] inset-x-0 overflow-hidden">
        <div className="cq-services-mesh absolute -inset-[12%]" />
        <div className="cq-orb left-[-12rem] top-[-13rem] h-[35rem] w-[35rem] bg-celeste/28" style={{ animation: "cq-float-a 22s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb bottom-[-15rem] right-[-10rem] h-[34rem] w-[34rem] bg-petroleo/18" style={{ animation: "cq-float-b 26s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb left-[40%] top-[30%] h-[25rem] w-[25rem] bg-verde/10" style={{ animation: "cq-float-c 20s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
      </motion.div>
      <motion.div aria-hidden style={{ opacity: gridOpacity }} className="cq-services-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12">
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.28 }}
          transition={{ duration: reduced ? 0 : 0.8, ease: EASE_OUT }}
          className="mx-auto max-w-[44rem] text-center"
        >
          <p className="text-sm font-semibold text-petroleo">Our services</p>
          <h1 className="mt-2 font-heading text-[clamp(1.9rem,4vw,3.3rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground" style={{ textWrap: "balance" }}>
            One operation. Three ways to move forward.
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
            transition={{ duration: reduced ? 0 : 0.9, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
            style={{ y: stageY, scale: stageScale }}
            className="relative mx-auto w-full max-w-[32rem]"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
              <div aria-hidden className="absolute inset-[8%] rounded-full border border-petroleo/15" />
              <div aria-hidden className="absolute inset-[20%] rounded-full border border-petroleo/10" />
              <div aria-hidden className="absolute inset-[35%] rounded-full border border-petroleo/10" />
              <><div aria-hidden className="cq-ring inset-[19%]" /><div aria-hidden className="cq-ring inset-[19%]" style={{ animationDelay: "-5.1s" }} /></>

              <fieldset className="cq-service-orbit absolute inset-0 m-0 border-0 p-0">
                <legend className="sr-only">Center Quest business lines</legend>
                {SERVICES.map((service, index) => {
                  const orbit = ORBIT[index];
                  return (
                    <div
                      key={service.id}
                      className="absolute left-1/2 top-1/2"
                      style={{ transform: `rotate(${orbit.angle}deg) translateY(calc(${orbit.radius} * -1)) rotate(${-orbit.angle}deg)` }}
                    >
                      <div className="cq-service-orbit-counter">
                        <input
                          id={`${SERVICE_PANEL_ID}-${service.id}-control`}
                          className="cq-service-control sr-only"
                          type="radio"
                          name="center-quest-service"
                          value={service.id}
                          defaultChecked={service.id === "call-center"}
                          data-service-control={service.id}
                        />
                        <label
                          id={`${SERVICE_PANEL_ID}-${service.id}-label`}
                          htmlFor={`${SERVICE_PANEL_ID}-${service.id}-control`}
                          data-service-label={service.id}
                          className="cq-service-node group relative block -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation rounded-full text-left"
                        >
                          <span
                            className="cq-service-sphere flex h-[3.9rem] w-[3.9rem] items-center justify-center rounded-full px-1.5 text-center text-[.58rem] font-semibold leading-[1.05] text-white transition-[filter,transform] duration-200 sm:h-[5rem] sm:w-[5rem] sm:px-2.5 sm:text-[.72rem]"
                            style={{ background: `radial-gradient(circle at 31% 25%, rgba(255,255,255,.9) 0 4%, color-mix(in srgb, ${service.glow} 86%, white) 13%, ${service.color} 73%)`, boxShadow: "0 6px 16px -11px rgba(13,30,41,.42)" }}
                          >
                            <span className="drop-shadow-[0_1px_1px_rgba(13,30,41,.25)]">{service.label}</span>
                          </span>
                          <span aria-hidden className="cq-service-active-ring absolute inset-[-.3rem] rounded-full border border-white/70 opacity-0 transition-opacity duration-200" />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </fieldset>

              <div className="absolute left-1/2 top-1/2 flex h-[6.4rem] w-[6.4rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-3.5 shadow-[0_8px_24px_-14px_rgba(15,57,73,.42)] sm:h-[8rem] sm:w-[8rem] sm:p-4">
                <Image src="/logo.png" alt="Center Quest" width={206} height={152} priority className="h-auto w-[4.9rem] sm:w-[5.9rem]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.16 }}
            transition={{ duration: reduced ? 0 : 0.72, ease: EASE_OUT, delay: reduced ? 0 : 0.2 }}
            style={{ y: panelY }}
            className="cq-service-panels min-h-[19rem] rounded-2xl p-5 backdrop-blur-sm sm:p-7 lg:p-8"
          >
            {SERVICES.map((service) => <ServicePanel key={service.id} service={service} />)}
          </motion.div>
        </div>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduced ? 0 : 0.55, ease: EASE_OUT, delay: reduced ? 0 : 0.35 }}
          className="mt-6 text-center text-sm text-muted lg:mt-8"
        >
          Hover, use Tab, or select a sphere to explore each capability.
        </motion.p>
      </div>
    </section>
  );
}
