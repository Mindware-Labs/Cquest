"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useMagnetic } from "../hooks/useMagnetic";

/* Shared ease — matches the hero and navbar so motion reads as one system. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const PILL_SPRING = { type: "spring", stiffness: 400, damping: 36 } as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
};

// transform/opacity only — compositor-friendly, no layout thrash.
const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT } },
};

/* ─── Icon set ───────────────────────────────────────────────
   One consistent line family: 24px grid, 1.6 stroke, round caps.
   Decorative — every icon is paired with a text label, so aria-hidden. */
type IconName =
  | "callcenter"
  | "customer"
  | "sales"
  | "collections"
  | "surveys"
  | "onboarding"
  | "bpo"
  | "systems";

function Icon({ name, className }: { name: IconName; className?: string }) {
  const p = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, React.ReactNode> = {
    callcenter: (
      <>
        <path {...p} d="M4 13v-1a8 8 0 0 1 16 0v1" />
        <rect {...p} x="2" y="13" width="4.5" height="7" rx="1.6" />
        <rect {...p} x="17.5" y="13" width="4.5" height="7" rx="1.6" />
        <path {...p} d="M20 20a4 4 0 0 1-4 3.5h-2" />
      </>
    ),
    customer: (
      <>
        <path
          {...p}
          d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.3-4.1A7.5 7.5 0 1 1 20 11.5Z"
        />
        <path {...p} d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
      </>
    ),
    sales: (
      <>
        <path {...p} d="M3 16.5 9 10.5l3.5 3.5L21 5.5" />
        <path {...p} d="M15 5.5h6v6" />
      </>
    ),
    collections: (
      <>
        <rect {...p} x="3" y="6" width="18" height="13" rx="2.5" />
        <path {...p} d="M17.5 12.5a1.5 1.5 0 0 0 0 3H21v-3Z" />
      </>
    ),
    surveys: (
      <>
        <rect {...p} x="5" y="4.5" width="14" height="16" rx="2.5" />
        <path
          {...p}
          d="M9.5 3.5h5a1 1 0 0 1 1 1V6a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        />
        <path {...p} d="M9 16.5V14M12 16.5v-5M15 16.5v-3" />
      </>
    ),
    onboarding: (
      <>
        <circle {...p} cx="9.5" cy="8" r="3.3" />
        <path {...p} d="M4 20a5.6 5.6 0 0 1 10-3.3" />
        <path {...p} d="M14.5 13.8l2 2 3.7-3.7" />
      </>
    ),
    bpo: (
      <>
        <path {...p} d="M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5Z" />
        <path {...p} d="M4 12l8 4.5 8-4.5" />
        <path {...p} d="M4 15.8l8 4.5 8-4.5" />
      </>
    ),
    systems: (
      <>
        <path {...p} d="M8 8l-4 4 4 4" />
        <path {...p} d="M16 8l4 4-4 4" />
        <path {...p} d="M13.5 6l-3 12" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      {paths[name]}
    </svg>
  );
}

/* ─── Content (source: AGENTS.md / REQUER_1.PDF v1.1) ───────── */
const CALL_CENTER_SERVICES = [
  { icon: "customer" as const, name: "Customer service", desc: "Phone, email, chat & social." },
  { icon: "sales" as const, name: "Sales", desc: "Outbound campaigns & closing." },
  { icon: "collections" as const, name: "Collections", desc: "Recovery with clear protocols." },
  { icon: "surveys" as const, name: "Surveys", desc: "CSAT, market pulse & NPS." },
  { icon: "onboarding" as const, name: "Onboarding", desc: "Welcome, activation, follow-up." },
];

type Line = {
  id: string;
  icon: IconName;
  name: string;
  sub: string;
  tag?: string;
  desc: string;
  meta?: string;
  services?: typeof CALL_CENTER_SERVICES;
  chips?: string[];
  cta: string;
};

const LINES: Line[] = [
  {
    id: "call-center",
    icon: "callcenter",
    name: "Call Center",
    sub: "Inbound & outbound operations",
    tag: "Flagship",
    desc: "Every customer conversation handled by trained agents — measured and tuned to your goals.",
    meta: "Inbound & outbound · 24/7",
    services: CALL_CENTER_SERVICES,
    cta: "Explore Call Center",
  },
  {
    id: "bpo",
    icon: "bpo",
    name: "BPO",
    sub: "Business Process Outsourcing",
    desc: "The repeatable work behind your operation — back office, data processing and omnichannel support, run accurately, at volume, under clear SLAs.",
    chips: ["Back office", "Data processing", "Omnichannel"],
    cta: "Explore BPO",
  },
  {
    id: "systems",
    icon: "systems",
    name: "Systems Development",
    sub: "Software for operations",
    desc: "Custom software shaped around how your operation actually runs — CRMs, dashboards and operations automation.",
    chips: ["CRM", "Dashboards", "Automation"],
    cta: "Explore Systems",
  },
];

/* Subpage links aren't built yet (this is the landing overview). Keep the
   affordance but no-op the navigation so nothing 404s — same pattern the
   navbar uses for pending routes. */
const stop = (e: React.MouseEvent) => e.preventDefault();

/* Cursor-tracking spotlight over the dark stage: a soft celeste glow that
   follows the pointer. Pointer-driven (no autoplay), so it's fine under
   reduced motion. */
function useSpotlight() {
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const onMouseMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const onMouseLeave = () => {
    mx.set(-500);
    my.set(-500);
  };
  const background = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, color-mix(in srgb, var(--brand-celeste) 14%, transparent), transparent 70%)`;
  return { onMouseMove, onMouseLeave, background };
}

/* ─── Stage panel content — swapped per active line ─────────── */
function StagePanel({
  line,
  reduced,
  cta,
}: {
  line: Line;
  reduced: boolean;
  cta: ReturnType<typeof useMagnetic<HTMLAnchorElement>>;
}) {
  const stageContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.055 } },
    exit: { opacity: 0, transition: { duration: 0.16, ease: "easeIn" } },
  };
  const stageItem: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
    exit: { opacity: 0, transition: { duration: 0.16, ease: "easeIn" } },
  };

  return (
    <motion.div
      key={line.id}
      role="tabpanel"
      id={`line-panel-${line.id}`}
      aria-labelledby={`line-tab-${line.id}`}
      variants={stageContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative z-10 flex h-full flex-col p-7 sm:p-9 lg:p-11"
    >
      {/* Header */}
      <motion.div variants={stageItem} className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-celeste">
          <Icon name={line.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-heading text-[1.5rem] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[1.75rem]">
              {line.name}
            </h3>
            {line.tag && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--brand-celeste)_18%,transparent)] px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-celeste">
                {line.tag}
              </span>
            )}
          </div>
          <p className="mt-1 text-[0.875rem] text-white/65">{line.sub}</p>
        </div>
      </motion.div>

      <motion.p
        variants={stageItem}
        className="mt-6 max-w-[52ch] text-pretty text-[0.9875rem] leading-relaxed text-white/75"
      >
        {line.desc}
      </motion.p>

      {/* Body — five services for Call Center, capability pills otherwise */}
      <motion.p
        variants={stageItem}
        className="mt-8 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/55"
      >
        What we handle
      </motion.p>

      {line.services ? (
        <ul className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {line.services.map((s) => (
            <motion.li key={s.name} variants={stageItem} className="flex gap-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-celeste ring-1 ring-inset ring-white/10">
                <Icon name={s.icon} className="h-[1.05rem] w-[1.05rem]" />
              </span>
              <div>
                <p className="text-[0.875rem] font-semibold leading-tight text-white">
                  {s.name}
                </p>
                <p className="mt-1 text-[0.75rem] leading-snug text-white/65">
                  {s.desc}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2.5">
          {line.chips?.map((chip) => (
            <motion.li
              key={chip}
              variants={stageItem}
              className="rounded-full bg-white/[0.07] px-4 py-2 text-[0.875rem] font-medium text-white/90 ring-1 ring-inset ring-white/10"
            >
              {chip}
            </motion.li>
          ))}
        </ul>
      )}

      {/* Footer — meta + CTA pinned to the bottom of the stage */}
      <motion.div
        variants={stageItem}
        className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-4 pt-9"
      >
        <motion.a
          ref={cta.ref}
          href="#"
          onClick={stop}
          onMouseEnter={cta.onMouseEnter}
          onMouseMove={cta.onMouseMove}
          onMouseLeave={cta.onMouseLeave}
          style={cta.style}
          whileHover={reduced ? undefined : { scale: 1.035 }}
          whileTap={reduced ? undefined : { scale: 0.965 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="group/cta relative inline-flex touch-manipulation items-center gap-2 overflow-hidden rounded-lg bg-celeste px-5 py-2.5 text-sm font-semibold text-foreground shadow-[0_2px_10px_-4px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_28px_-8px_color-mix(in_srgb,var(--brand-celeste)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
        >
          {/* White fill sweeps in from the left on hover — same payoff as the hero CTA */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:scale-x-100"
          />
          <span className="relative z-10">{line.cta}</span>
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3.5 10.5 8 6 12.5" />
          </svg>
        </motion.a>

        {line.meta && (
          <p className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-white/75">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-verde" />
            {line.meta}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Services() {
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const spotlight = useSpotlight();
  const cta = useMagnetic<HTMLAnchorElement>(0.22, 2);

  const line = LINES[active];

  // Roving tabindex — arrows cycle, Home/End jump. Selection follows focus.
  const onTablistKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight")
      next = (active + 1) % LINES.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = (active - 1 + LINES.length) % LINES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = LINES.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  // Reduced motion → snap to the visible state on mount (no transform, no
  // wait for scroll). Everyone else gets the scroll-triggered reveal.
  const reveal = (amount: number) =>
    reduced
      ? ({ initial: false, animate: "visible" } as const)
      : ({
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount },
        } as const);

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative isolate overflow-hidden scroll-mt-24 py-20 sm:py-24 lg:py-28"
    >
      {/* ── Layered ambient background ──────────────────────────
          1. Cool celeste wash (replaces the flat warm beige)
          2. Slow brand aurora, drifting on the compositor
          3. Concentric "signal" rings pulsing outward — the call-center
             motif: a conversation radiating out. All CSS-driven; the
             global reduced-motion net freezes every layer. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, var(--background) 0%, color-mix(in srgb, var(--brand-celeste) 10%, var(--background)) 42%, color-mix(in srgb, var(--brand-celeste) 5%, var(--background)) 78%, var(--background) 100%)",
          }}
        />
        <div
          className="cq-orb h-[36rem] w-[36rem]"
          style={{
            top: "-12rem",
            right: "-8rem",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--brand-celeste) 40%, transparent), transparent 68%)",
            opacity: 0.55,
            animation: "cq-float-a 26s ease-in-out infinite",
          }}
        />
        <div
          className="cq-orb h-[28rem] w-[28rem]"
          style={{
            bottom: "-10rem",
            left: "-9rem",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--brand-verde) 24%, transparent), transparent 68%)",
            opacity: 0.35,
            animation: "cq-float-b 32s ease-in-out infinite",
          }}
        />
        <div
          className="cq-orb h-[22rem] w-[22rem]"
          style={{
            top: "30%",
            left: "34%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--brand-petroleo) 22%, transparent), transparent 70%)",
            opacity: 0.3,
            animation: "cq-float-c 28s ease-in-out infinite",
          }}
        />
        {/* Signal rings — anchored behind the stage on desktop */}
        <div
          className="absolute top-1/2 hidden -translate-y-1/2 lg:block"
          style={{ right: "-16rem", height: "56rem", width: "56rem" }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="cq-ring" style={{ animationDelay: `${i * 3.4}s` }} />
          ))}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12 lg:px-16">
        {/* ── Intro — heading and lead side-by-side on desktop ── */}
        <motion.div
          variants={container}
          {...reveal(0.5)}
          className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-xl">
            <motion.p
              variants={rise}
              className="inline-flex items-center gap-2.5 text-sm font-medium text-petroleo"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-verde" />
              Services
            </motion.p>
            <motion.h2
              id="services-heading"
              variants={rise}
              style={{ textWrap: "balance" } as React.CSSProperties}
              className="font-heading mt-4 text-[clamp(1.9rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground"
            >
              Three lines of business.{" "}
              <span className="text-petroleo">One operations partner.</span>
            </motion.h2>
          </div>
          <motion.p
            variants={rise}
            className="max-w-[40ch] text-pretty text-[1rem] leading-relaxed text-muted lg:text-right"
          >
            The conversations, the back-office work, and the software that hold
            an operation together — under one roof.
          </motion.p>
        </motion.div>

        {/* ── Console: typographic line selector + dark stage ── */}
        <motion.div
          variants={container}
          {...reveal(0.15)}
          className="mt-10 grid items-stretch gap-5 sm:mt-12 lg:mt-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-8"
        >
          {/* Selector — an index, not cards. Horizontal rail on mobile,
              vertical typographic list on desktop. */}
          <motion.div variants={rise} className="flex min-w-0 flex-col">
            <div
              role="tablist"
              aria-label="Business lines"
              onKeyDown={onTablistKeyDown}
              className="-mx-6 flex gap-1 overflow-x-auto px-6 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {LINES.map((l, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={l.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`line-tab-${l.id}`}
                    aria-selected={isActive}
                    aria-controls={`line-panel-${l.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group relative shrink-0 touch-manipulation rounded-xl px-4 py-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo lg:px-5 lg:py-5"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="cq-active-line"
                        transition={reduced ? { duration: 0 } : PILL_SPRING}
                        aria-hidden
                        className="absolute inset-0 rounded-xl border border-border bg-surface-raised shadow-[0_1px_2px_rgba(13,30,41,0.05)]"
                      />
                    )}
                    <span className="relative flex items-center gap-3.5 lg:gap-4">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 lg:h-11 lg:w-11 lg:rounded-xl ${
                          isActive
                            ? "bg-[color-mix(in_srgb,var(--brand-celeste)_20%,transparent)] text-petroleo"
                            : "bg-surface-sunken text-muted group-hover:text-petroleo"
                        }`}
                      >
                        <Icon name={l.icon} className="h-[1.2rem] w-[1.2rem]" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span
                            className={`font-heading whitespace-nowrap text-[1.05rem] font-bold tracking-[-0.01em] transition-colors duration-300 lg:text-[1.3rem] ${
                              isActive
                                ? "text-foreground"
                                : "text-muted group-hover:text-foreground"
                            }`}
                          >
                            {l.name}
                          </span>
                          {l.tag && (
                            <span className="hidden rounded-full bg-surface-sunken px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted lg:inline-block">
                              {l.tag}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 hidden text-[0.8125rem] text-muted lg:block">
                          {l.sub}
                        </span>
                      </span>
                      {/* Chevron slides in on the active row */}
                      <svg
                        aria-hidden
                        viewBox="0 0 16 16"
                        className={`ml-auto hidden h-4 w-4 shrink-0 text-petroleo transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
                          isActive
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-1.5 opacity-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3.5 10.5 8 6 12.5" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sectors — quiet institutional footer under the index */}
            <p className="mt-6 hidden max-w-[34ch] border-t border-border pt-5 text-[0.8125rem] leading-relaxed text-muted lg:mt-auto lg:block">
              Specialized across Health, Banking &amp; Finance, Retail &amp;
              E&#8209;Commerce, Telecommunications, and Tourism &amp; Hospitality.
            </p>
          </motion.div>

          {/* Stage — deep petroleo panel, aurora inside, cursor spotlight */}
          <motion.div
            variants={rise}
            onMouseMove={spotlight.onMouseMove}
            onMouseLeave={spotlight.onMouseLeave}
            className="relative min-w-0 overflow-hidden rounded-2xl lg:min-h-[27rem]"
            style={{
              background:
                "linear-gradient(150deg, color-mix(in srgb, var(--brand-petroleo) 58%, var(--ink)) 0%, color-mix(in srgb, var(--brand-petroleo) 24%, var(--ink)) 46%, var(--ink) 100%)",
              boxShadow:
                "0 30px 60px -30px rgba(13, 30, 41, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.09)",
            }}
          >
            {/* Inner aurora — the panel's own weather */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div
                className="absolute -right-20 -top-24 h-80 w-80 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--brand-celeste) 42%, transparent), transparent 70%)",
                  filter: "blur(70px)",
                  opacity: 0.4,
                  animation: "cq-float-a 24s ease-in-out infinite",
                  willChange: "transform",
                }}
              />
              <div
                className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--brand-verde) 22%, transparent), transparent 70%)",
                  filter: "blur(64px)",
                  opacity: 0.22,
                  animation: "cq-float-b 30s ease-in-out infinite",
                  willChange: "transform",
                }}
              />
            </div>
            {/* Cursor spotlight */}
            <motion.span
              aria-hidden
              style={{ background: spotlight.background }}
              className="pointer-events-none absolute inset-0"
            />

            <AnimatePresence mode="wait" initial={false}>
              <StagePanel key={line.id} line={line} reduced={reduced} cta={cta} />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
