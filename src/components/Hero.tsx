"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
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
    <h1 className="font-heading max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
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
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-24 pt-28 sm:pt-32"
      >
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.p
            variants={rise}
            className="mb-6 text-xs font-medium uppercase tracking-[0.28em] text-muted"
          >
            Center Quest · Business Solutions
          </motion.p>

          <Headline reduced={reduced} />

          <motion.p
            variants={rise}
            className="mt-8 max-w-xl text-base leading-[1.7] text-muted/85 sm:text-lg"
          >
            At Center Quest CQ, we are dedicated to providing top-notch
            business solutions. With extensive experience in technology,
            customer service, and technical support, we help you transform
            your operation into a powerhouse.
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-wrap items-center gap-4">
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
        </motion.div>
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
        <div className="mx-auto w-full max-w-6xl px-6 pb-7 pt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
            Sectors we specialize in
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-10 gap-y-5 sm:justify-between sm:gap-x-6">
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
