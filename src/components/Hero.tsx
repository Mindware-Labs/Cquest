"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const cardsContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.55 },
  },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

function SectorIcon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d={d} />
    </svg>
  );
}

const SECTORS = [
  {
    label: "Health",
    icon: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z",
  },
  {
    label: "Banking and Finance",
    icon: "M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M3 9l9-7 9 7H3Z",
  },
  {
    label: "Retail & E-Commerce",
    icon: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0",
  },
  {
    label: "Telecommunications",
    icon: "M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
  },
  {
    label: "Tourism and Hospitality",
    icon: "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M2 17h20",
  },
];

/* Faint blueprint grid: the operational canvas everything else runs on. */
function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, color-mix(in srgb, var(--border) 32%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border) 32%, transparent) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage:
          "radial-gradient(ellipse 120% 90% at 50% 0%, black 30%, transparent 85%)",
      }}
    />
  );
}

/* Blueprint registration marks: tiny crosses pinned to grid intersections. */
function PlusMark({ col, row }: { col: number; row: number }) {
  return (
    <span
      aria-hidden
      className="absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `calc(72px * ${col})`, top: `calc(72px * ${row})` }}
    >
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-petroleo/25" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-petroleo/25" />
    </span>
  );
}

/* Ultra-subtle film grain so the flat surfaces don't read as digital-empty. */
function Grain() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/* Signature element: thin light pulses traveling along the grid lines —
   operations flowing through the system. */
function PulseBeam({
  position,
  delay,
  duration,
  color,
  vertical = false,
}: {
  position: string;
  delay: number;
  duration: number;
  color: string;
  vertical?: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className={vertical ? "absolute h-40 w-px" : "absolute h-px w-40"}
      style={{
        ...(vertical ? { left: position } : { top: position }),
        background: `linear-gradient(${vertical ? "180deg" : "90deg"}, transparent, ${color}, transparent)`,
        boxShadow: `0 0 12px 0 color-mix(in srgb, ${color} 35%, transparent)`,
      }}
      initial={vertical ? { top: "-15%", opacity: 0 } : { left: "-12%", opacity: 0 }}
      animate={
        vertical
          ? { top: "115%", opacity: [0, 1, 1, 0] }
          : { left: "112%", opacity: [0, 1, 1, 0] }
      }
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "linear",
      }}
    />
  );
}

/* Soft celeste glow that follows the pointer. Desktop only (.pointer-fine-only). */
function CursorGlow({
  x,
  y,
}: {
  x: ReturnType<typeof useSpring>;
  y: ReturnType<typeof useSpring>;
}) {
  return (
    <div aria-hidden className="pointer-fine-only pointer-events-none absolute inset-0">
      <motion.div
        className="absolute h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: x,
          top: y,
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-celeste) 14%, transparent) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}

/* Right-side visual: an abstract operations panel — the work CQ runs,
   told in three floating cards (metrics, support, automation). */
function OpsCard({
  reduced,
  x,
  y,
  className,
  children,
}: {
  reduced: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={reduced ? undefined : rise}
      className={className}
    >
      <motion.div
        style={reduced ? undefined : { x, y }}
        className="rounded-2xl border border-[rgba(15,32,40,0.06)] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(15,32,40,0.05),0_24px_48px_-24px_rgba(15,32,40,0.22)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_4px_rgba(15,32,40,0.06),0_32px_64px_-28px_rgba(15,32,40,0.3)]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* Animated counter for the KPI figure. */
function CountUp({ value, reduced }: { value: number; reduced: boolean }) {
  const mv = useMotionValue(reduced ? value : 0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-US"));

  useEffect(() => {
    if (reduced) return;
    const controls = animate(mv, value, { duration: 1.8, delay: 1.4, ease: EASE_OUT });
    return () => controls.stop();
  }, [mv, value, reduced]);

  return <motion.span>{text}</motion.span>;
}

function OpsPanel({
  reduced,
  nx,
  ny,
}: {
  reduced: boolean;
  nx: MotionValue<number>;
  ny: MotionValue<number>;
}) {
  // Depth map: each card reacts to the pointer with its own intensity and
  // direction, so the cluster reads as layers in space.
  const kpiX = useTransform(nx, (v) => v * 18);
  const kpiY = useTransform(ny, (v) => v * 12);
  const chatX = useTransform(nx, (v) => v * -10);
  const chatY = useTransform(ny, (v) => v * -7);
  const autoX = useTransform(nx, (v) => v * 12);
  const autoY = useTransform(ny, (v) => v * 9);

  return (
    <motion.div
      aria-hidden
      variants={cardsContainer}
      className="hidden w-[380px] shrink-0 flex-col gap-3 lg:flex"
    >
      {/* KPI card */}
      <OpsCard reduced={reduced} x={kpiX} y={kpiY} className="w-64 self-end">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 13.5v-4M8 13.5v-8M13 13.5v-6" />
            </svg>
            Tickets resolved
          </p>
          <span className="rounded-full bg-verde/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[color-mix(in_srgb,var(--brand-verde)_70%,black)]">
            +12.4%
          </span>
        </div>
        <p className="font-heading mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
          <CountUp value={12480} reduced={reduced} />
        </p>
        <p className="mt-0.5 text-[11px] text-muted/80">This month</p>
        <svg viewBox="0 0 120 40" fill="none" className="mt-2.5 h-10 w-full overflow-visible">
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--brand-petroleo)" />
              <stop offset="1" stopColor="var(--brand-celeste)" />
            </linearGradient>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--brand-celeste)" stopOpacity="0.22" />
              <stop offset="1" stopColor="var(--brand-celeste)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M2 32 18 28 34 30 50 22 66 24 82 14 98 16 118 6 V38 H2 Z"
            fill="url(#sparkFill)"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.5, ease: EASE_OUT }}
          />
          <motion.path
            d="M2 32 18 28 34 30 50 22 66 24 82 14 98 16 118 6"
            stroke="url(#spark)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: 1.5, ease: EASE_OUT }}
          />
          {!reduced && (
            <motion.circle
              cx="118"
              cy="6"
              fill="none"
              stroke="var(--brand-celeste)"
              strokeWidth="1"
              initial={{ r: 3, opacity: 0 }}
              animate={{ r: [3, 8], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, delay: 3, repeat: Infinity, repeatDelay: 1.2, ease: "easeOut" }}
            />
          )}
          <motion.circle
            cx="118"
            cy="6"
            r="2.5"
            fill="var(--brand-petroleo)"
            stroke="white"
            strokeWidth="1.5"
            initial={reduced ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 2.8, ease: EASE_OUT }}
          />
        </svg>
      </OpsCard>

      {/* support chat card */}
      <OpsCard reduced={reduced} x={chatX} y={chatY} className="w-72 self-start">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-petroleo to-celeste text-[10px] font-bold text-white ring-2 ring-white">
            CQ
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">Support · Center Quest</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="relative flex h-1.5 w-1.5">
                {!reduced && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verde opacity-60" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-verde" />
              </span>
              Online
            </p>
          </div>
          <p className="text-[10px] tabular-nums text-muted/70">2 min</p>
        </div>
        <div className="mt-3 space-y-2">
          <p className="w-fit rounded-xl rounded-bl-[4px] bg-gris/40 px-3 py-1.5 text-xs text-foreground/80 shadow-[0_1px_2px_rgba(15,32,40,0.04)]">
            Where is my refund?
          </p>
          <p className="ml-auto flex w-fit items-center gap-1.5 rounded-xl rounded-br-[4px] bg-[color-mix(in_srgb,var(--brand-celeste)_18%,white)] px-3 py-1.5 text-xs text-foreground/90 shadow-[0_1px_2px_rgba(15,32,40,0.04)]">
            Resolved — refund issued
            <svg viewBox="0 0 16 12" className="h-2.5 w-4 shrink-0 text-petroleo" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m1.5 6 3 3 5-6M7.5 9l1 1 5-6" />
            </svg>
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[rgba(15,32,40,0.06)] pt-2.5">
          <p className="text-[10px] text-muted/80">Avg. first response</p>
          <p className="text-[10px] font-semibold tabular-nums text-petroleo">32s</p>
        </div>
      </OpsCard>

      {/* automation card */}
      <OpsCard reduced={reduced} x={autoX} y={autoY} className="w-64 self-end">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 1.5 3 9h4l-.5 5.5L12 7H8l.5-5.5Z" />
            </svg>
            Automation queue
          </p>
          <span className="rounded-full bg-gris/40 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted">
            24/7
          </span>
        </div>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-xs text-foreground/80">Ticket #4821 · Billing</p>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-verde/15 px-2 py-0.5 text-[10px] font-semibold text-[color-mix(in_srgb,var(--brand-verde)_70%,black)]">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 6.5 5 9l4.5-5.5" />
              </svg>
              Auto-resolved
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-xs text-foreground/80">Workflow · Invoice sync</p>
              <span className="shrink-0 rounded-full bg-celeste/20 px-2 py-0.5 text-[10px] font-semibold text-petroleo">
                Running
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-celeste/15">
              <motion.div
                className="h-full w-1/3 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--brand-celeste), var(--brand-petroleo))",
                }}
                initial={{ x: "-120%" }}
                animate={reduced ? { x: "0%" } : { x: ["-120%", "320%"] }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut", delay: 2 }
                }
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[rgba(15,32,40,0.06)] pt-2.5">
          <p className="text-[10px] text-muted/80">Uptime SLA</p>
          <p className="text-[10px] font-semibold tabular-nums text-petroleo">99.9%</p>
        </div>
      </OpsCard>
    </motion.div>
  );
}

function Headline({ reduced }: { reduced: boolean }) {
  const lineOne = "We power operations.";
  const lineTwo = "You drive growth.";

  const word = (text: string, i: number, gradient: boolean) => (
    <motion.span
      key={`${text}-${i}`}
      className="inline-block"
      variants={
        reduced
          ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
          : rise
      }
    >
      <span
        className={
          gradient
            ? "bg-gradient-to-r from-petroleo to-celeste bg-clip-text text-transparent"
            : undefined
        }
      >
        {text}
      </span>
      {" "}
    </motion.span>
  );

  return (
    <h1 className="font-heading max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl xl:text-[68px]">
      <span className="block">
        {lineOne.split(" ").map((w, i) => word(w, i, false))}
      </span>
      <span className="block">
        {lineTwo.split(" ").map((w, i) => word(w, i, true))}
      </span>
    </h1>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;

  const pointerX = useMotionValue(-600);
  const pointerY = useMotionValue(-600);
  const glowX = useSpring(pointerX, { stiffness: 60, damping: 20 });
  const glowY = useSpring(pointerY, { stiffness: 60, damping: 20 });

  // Normalized pointer position (-0.5..0.5) driving the ops-panel depth parallax
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);
  const parX = useSpring(normX, { stiffness: 50, damping: 18, mass: 0.6 });
  const parY = useSpring(normY, { stiffness: 50, damping: 18, mass: 0.6 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 0]);
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 40]);

  return (
    <section
      ref={sectionRef}
      onPointerMove={(e) => {
        if (reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        pointerX.set(e.clientX - rect.left);
        pointerY.set(e.clientY - rect.top);
        normX.set((e.clientX - rect.left) / rect.width - 0.5);
        normY.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        normX.set(0);
        normY.set(0);
      }}
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-background"
    >
      {/* ambient layers */}
      <motion.div aria-hidden className="absolute inset-0" style={{ y: backdropY }}>
        <GridBackdrop />

        {/* registration marks on grid intersections */}
        <PlusMark col={3} row={5} />
        <PlusMark col={9} row={2} />
        <PlusMark col={15} row={7} />
        <PlusMark col={6} row={9} />
        <PlusMark col={19} row={4} />

        {/* soft brand auroras, slowly drifting */}
        <motion.div
          className="absolute -top-40 right-[-10%] h-[640px] w-[640px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--brand-celeste) 22%, transparent) 0%, transparent 70%)",
          }}
          animate={
            reduced
              ? undefined
              : { x: [0, -40, 0], y: [0, 24, 0], scale: [1, 1.06, 1] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-25%] left-[-12%] h-[560px] w-[560px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--brand-petroleo) 10%, transparent) 0%, transparent 70%)",
          }}
          animate={
            reduced
              ? undefined
              : { x: [0, 32, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }
          }
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {!reduced && (
          <>
            <PulseBeam position="calc(72px * 3)" delay={1.2} duration={7} color="var(--brand-celeste)" />
            <PulseBeam position="calc(72px * 6)" delay={3.8} duration={9} color="var(--brand-petroleo)" />
            <PulseBeam position="calc(72px * 8)" delay={6.2} duration={8} color="var(--brand-verde)" />
            <PulseBeam position="calc(72px * 14)" delay={5} duration={10} color="var(--brand-celeste)" vertical />
          </>
        )}

        <Grain />
      </motion.div>
      {!reduced && <CursorGlow x={glowX} y={glowY} />}

      {/* main content (top padding clears the fixed navbar) */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center gap-12 px-6 pb-10 pt-24 sm:pt-28"
      >
        <div
          className="min-w-0 flex-1"
        >
          <motion.p
            variants={rise}
            className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-muted"
          >
            Center Quest · Business Solutions
          </motion.p>

          <Headline reduced={reduced} />

          <motion.p
            variants={rise}
            className="mt-6 max-w-xl text-base leading-[1.7] text-muted/85 sm:text-lg"
          >
            At Center Quest CQ, we are dedicated to providing top-notch
            business solutions. With extensive experience in technology,
            customer service, and technical support, we help you transform
            your operation into a powerhouse.
          </motion.p>

          <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#services"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-petroleo px-6 py-3 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(15,32,40,0.2)] transition-all duration-300 hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--brand-petroleo)_88%,black)] hover:shadow-[0_8px_24px_-8px_rgba(63,115,141,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
            >
              Explore our services
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3.5 10.5 8 6 12.5" />
              </svg>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-lg border border-petroleo/15 bg-[color-mix(in_srgb,var(--brand-petroleo)_7%,white)] px-6 py-3 text-[15px] font-semibold text-petroleo transition-all duration-300 hover:-translate-y-px hover:border-petroleo/30 hover:bg-[color-mix(in_srgb,var(--brand-petroleo)_11%,white)] hover:shadow-[0_4px_12px_-4px_rgba(63,115,141,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
            >
              Talk to our team
            </a>
          </motion.div>
        </div>

        <OpsPanel reduced={reduced} nx={parX} ny={parY} />
      </motion.div>

      {/* sector strip: a ruler of specialization, ticks echoing the blueprint grid */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1, ease: EASE_OUT }}
        className="relative z-10 bg-background/70 backdrop-blur"
      >
        {/* brand-gradient hairline, echoing the headline gradient */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand-petroleo) 35%, transparent) 30%, color-mix(in srgb, var(--brand-celeste) 55%, transparent) 70%, transparent)",
          }}
        />
        <div className="mx-auto w-full max-w-6xl px-6 pb-5 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
            Sectors we specialize in
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-10 gap-y-4 sm:justify-between sm:gap-x-6">
            {SECTORS.map(({ label, icon }, i) => (
              <motion.li
                key={label}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.25 + i * 0.09, ease: EASE_OUT }}
                className="group cursor-default"
              >
                <span className="block text-muted/70 transition-colors duration-300 group-hover:text-petroleo">
                  <SectorIcon d={icon} />
                </span>
                <span className="mt-2 block text-sm text-foreground/70 transition-colors duration-300 group-hover:text-foreground">
                  {label}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
