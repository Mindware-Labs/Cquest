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
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};

const SECTORS = [
  {
    label: "Health",
    icon: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z",
  },
  {
    label: "Banking & Finance",
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
    label: "Tourism & Hospitality",
    icon: "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M2 17h20",
  },
];

/* ─── Aurora orbs — committed brand color, not decorative grid ─── */
function AuroraField({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Primary celeste aurora — top right */}
      <motion.div
        className="absolute -right-[20%] -top-[15%] h-[700px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--brand-celeste) 28%, transparent) 0%, color-mix(in srgb, var(--brand-celeste) 8%, transparent) 45%, transparent 70%)",
        }}
        animate={
          reduced
            ? undefined
            : { x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }
        }
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Petroleo deep aurora — bottom left */}
      <motion.div
        className="absolute -bottom-[30%] -left-[15%] h-[640px] w-[640px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 40% 60%, color-mix(in srgb, var(--brand-petroleo) 18%, transparent) 0%, color-mix(in srgb, var(--brand-petroleo) 5%, transparent) 50%, transparent 72%)",
        }}
        animate={
          reduced
            ? undefined
            : { x: [0, 28, 0], y: [0, -18, 0], scale: [1, 1.04, 1] }
        }
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Verde accent aurora — mid left, subtle */}
      <motion.div
        className="absolute left-[8%] top-[55%] h-[380px] w-[380px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-verde) 10%, transparent) 0%, transparent 65%)",
        }}
        animate={
          reduced
            ? undefined
            : { x: [0, 16, 0], y: [0, -12, 0], scale: [1, 1.06, 1] }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

/* ─── Cursor glow (fine pointer only) ─── */
function CursorGlow({
  x,
  y,
}: {
  x: ReturnType<typeof useSpring>;
  y: ReturnType<typeof useSpring>;
}) {
  return (
    <div
      aria-hidden
      className="pointer-fine-only pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: x,
          top: y,
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-celeste) 16%, transparent) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}

/* ─── Live signal dots — the pulse of operations ─── */
function SignalDot({
  delay,
  reduced,
}: {
  delay: number;
  reduced: boolean;
}) {
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      {!reduced && (
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-verde"
          animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
          transition={{
            duration: 2.4,
            delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-verde" />
    </span>
  );
}

/* ─── Headline — no gradient text, solid weight contrast instead ─── */
function Headline({ reduced }: { reduced: boolean }) {
  return (
    <h1
      className="font-heading max-w-3xl text-center text-[clamp(2.6rem,6vw,4.25rem)] font-bold leading-[1.06] tracking-[-0.02em] text-foreground"
      style={{ textWrap: "balance" } as React.CSSProperties}
    >
      <motion.span
        className="block"
        variants={
          reduced
            ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
            : rise
        }
      >
        We power operations.
      </motion.span>
      <motion.span
        className="block text-petroleo"
        variants={
          reduced
            ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
            : rise
        }
      >
        You drive growth.
      </motion.span>
    </h1>
  );
}

/* ─── Sector icon ─── */
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
      className="h-[18px] w-[18px]"
    >
      <path d={d} />
    </svg>
  );
}

/* ─── Main export ─── */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;

  const rawX = useMotionValue(-800);
  const rawY = useMotionValue(-800);
  const glowX = useSpring(rawX, { stiffness: 55, damping: 22 });
  const glowY = useSpring(rawY, { stiffness: 55, damping: 22 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduced ? 0 : -70]
  );
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.65],
    [1, reduced ? 1 : 0]
  );
  const bgY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 36]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      onPointerMove={(e) => {
        if (reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set(e.clientX - rect.left);
        rawY.set(e.clientY - rect.top);
      }}
      onPointerLeave={() => {
        rawX.set(-800);
        rawY.set(-800);
      }}
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-background"
    >
      {/* Background layers */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ y: bgY }}
      >
        <AuroraField reduced={reduced} />
      </motion.div>

      {!reduced && <CursorGlow x={glowX} y={glowY} />}

      {/* ── Main content ── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-0 px-6 pb-12 pt-28 text-center sm:pt-32"
      >
        {/* Live badge — replaces generic uppercase eyebrow */}
        <motion.div
          variants={rise}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-petroleo/12 bg-white/70 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(15,32,40,0.06)] backdrop-blur-sm"
        >
          <SignalDot delay={0} reduced={reduced} />
          <span className="text-[11px] font-semibold tracking-wide text-petroleo/80">
            Business Solutions — Center&nbsp;Quest
          </span>
        </motion.div>

        <Headline reduced={reduced} />

        <motion.p
          variants={rise}
          className="mt-7 max-w-[52ch] text-[1.0625rem] leading-[1.72] text-foreground/70"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          Dedicated to providing top-notch business solutions. With extensive
          experience in technology, customer service, and technical support, we
          help you transform your operation into a powerhouse.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={rise}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#services"
            className="group inline-flex items-center gap-2 rounded-lg bg-petroleo px-6 py-[0.8125rem] text-[0.9375rem] font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--brand-petroleo)_86%,black)] hover:shadow-[0_6px_20px_-6px_rgba(63,115,141,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
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
            className="inline-flex items-center rounded-lg border border-foreground/12 px-6 py-[0.8125rem] text-[0.9375rem] font-semibold text-foreground/75 transition-all duration-300 hover:-translate-y-px hover:border-petroleo/25 hover:text-petroleo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
          >
            Talk to our team
          </a>
        </motion.div>

        {/* Social proof hint */}
        <motion.div
          variants={rise}
          className="mt-10 flex items-center gap-2 text-[0.8125rem] text-muted/70"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 shrink-0 text-verde"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 8.5 6 12l7.5-8" />
          </svg>
          <span>Trusted across 5 industries · 24/7 operational coverage</span>
        </motion.div>
      </motion.div>

      {/* ── Sector strip ── */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.0, ease: EASE_OUT }}
        className="relative z-10"
      >
        {/* Gradient divider */}
        <div
          aria-hidden
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--brand-petroleo) 20%, transparent) 25%, color-mix(in srgb, var(--brand-celeste) 35%, transparent) 60%, transparent 100%)",
          }}
        />

        <div className="bg-background/60 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-0 px-6 py-5">
            {SECTORS.map(({ label, icon }, i) => (
              <motion.div
                key={label}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: 1.15 + i * 0.08,
                  ease: EASE_OUT,
                }}
                className="group flex flex-1 cursor-default items-center justify-center gap-2 px-4 py-3 transition-colors duration-300 hover:text-petroleo sm:justify-start"
              >
                <span className="shrink-0 text-petroleo/40 transition-colors duration-300 group-hover:text-petroleo/80">
                  <SectorIcon d={icon} />
                </span>
                <span className="whitespace-nowrap text-[0.8125rem] font-medium text-foreground/55 transition-colors duration-300 group-hover:text-foreground/85">
                  {label}
                </span>
                {i < SECTORS.length - 1 && (
                  <span
                    aria-hidden
                    className="ml-auto hidden h-3 w-px bg-border/50 sm:block"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
