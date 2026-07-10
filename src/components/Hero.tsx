"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
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

/* ─── Ambient dust — fine particles drifting weightlessly, mouse-aware ───
   No shapes, no motif — just a field of quiet points that float slowly
   upward, wrap around, and nudge away from the cursor. Kept clear of the
   text column by a mask cutout so they truly sit around the copy. */
function ParticleField({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    type Dust = {
      x: number;
      y: number;
      vy: number;
      sway: number;
      phase: number;
      size: number;
    };

    let dust: Dust[] = [];

    const pointer = { x: -9999, y: -9999, active: false };

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
    }
    function onPointerLeave() {
      pointer.active = false;
    }
    if (!reduced) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerleave", onPointerLeave);
    }

    function seed() {
      const dustCount = Math.max(70, Math.min(200, Math.round((width * height) / 9500)));
      dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: 0.08 + Math.random() * 0.14,
        sway: 6 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
        size: 1 + Math.random() * 1.1,
      }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    let raf = 0;
    let running = true;
    let t = 0;

    const DUST_REPEL_RADIUS = 90;

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      for (const d of dust) {
        if (!reduced) {
          d.y -= d.vy;
          if (d.y < -10) d.y = height + 10;

          if (pointer.active) {
            const dx = d.x - pointer.x;
            const dy = d.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < DUST_REPEL_RADIUS && dist > 0.01) {
              const force = (1 - dist / DUST_REPEL_RADIUS) * 3.2;
              d.x += (dx / dist) * force;
              d.y += (dy / dist) * force;
            }
          }
        }
        const sway = Math.sin(t * 0.01 + d.phase) * d.sway;
        const twinkle = 0.25 + (Math.sin(t * 0.02 + d.phase) + 1) * 0.2;
        ctx!.fillStyle = `rgba(13, 30, 41, ${twinkle})`;
        ctx!.beginPath();
        ctx!.arc(d.x + sway, d.y, d.size, 0, Math.PI * 2);
        ctx!.fill();
      }

      t += 1;
      if (running) raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      draw();
      running = false;
    } else {
      raf = requestAnimationFrame(draw);
    }

    const onVisibility = () => {
      const shouldRun = !document.hidden && !reduced;
      if (shouldRun && !running) {
        running = true;
        raf = requestAnimationFrame(draw);
      } else if (!shouldRun) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(([entry]) => {
      const shouldRun = entry.isIntersecting && !document.hidden && !reduced;
      if (shouldRun && !running) {
        running = true;
        raf = requestAnimationFrame(draw);
      } else if (!shouldRun) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, [reduced]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          // True cutout around the text column — particles live around the
          // copy, not behind it, with a soft feather so the edge isn't hard.
          maskImage:
            "radial-gradient(ellipse 37% 34% at 50% 46%, transparent 0%, transparent 55%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 37% 34% at 50% 46%, transparent 0%, transparent 55%, black 100%)",
        }}
      />
    </div>
  );
}

/* ─── Ambient backdrop — pairs the particle field with a quiet vignette ─── */
function HeroBackdrop({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <ParticleField reduced={reduced} />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 85% at 50% 35%, transparent 60%, color-mix(in srgb, var(--background) 45%, transparent) 100%)",
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
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-background"
    >
      {/* Background layers */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ y: bgY }}
      >
        <HeroBackdrop reduced={reduced} />
      </motion.div>

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
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-petroleo/14 bg-white/75 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(15,32,40,0.06),0_10px_30px_-14px_rgba(63,115,141,0.35)] backdrop-blur-md"
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
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-petroleo px-6 py-[0.8125rem] text-[0.9375rem] font-semibold text-white shadow-[0_2px_8px_-2px_rgba(63,115,141,0.3)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-8px_rgba(63,115,141,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
          >
            {/* Shimmer sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-full"
            />
            {/* Darkening overlay */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-black/0 transition-[background-color] duration-500 ease-out group-hover:bg-black/10"
            />
            <span className="relative z-10">Explore our services</span>
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
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
            className="group/ghost relative inline-flex items-center overflow-hidden rounded-lg border border-foreground/12 px-6 py-[0.8125rem] text-[0.9375rem] font-semibold text-foreground/75 transition-[transform,border-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-petroleo/30 hover:text-petroleo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--brand-petroleo)_6%,transparent)] opacity-0 transition-opacity duration-400 ease-out group-hover/ghost:opacity-100"
            />
            <span className="relative z-10">Talk to our team</span>
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
