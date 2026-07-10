"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.2 } },
};

// transform/opacity only — filter: blur() is not compositor-friendly and
// can drop frames on lower-end devices.
const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT },
  },
};

// Line-mask reveal — each headline line slides up from behind an
// overflow-hidden clip, the signature entrance of editorial heroes.
const lineReveal: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

const NAV_LINKS = ["Services", "Industries", "About", "Contact"];

/* ─── Bespoke dark nav — the shared light navbar reads illegibly here,
   so this hero carries its own, tuned for a photo backdrop. Includes a
   mobile drawer so small viewports keep access to the links. ─── */
function HeroNav({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="relative z-20"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))] sm:px-12 sm:pt-5 lg:px-16">
        <a href="#" aria-label="Center Quest home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={412}
            height={304}
            className="h-12 w-auto sm:h-14"
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 1px 6px color-mix(in srgb, var(--ink) 60%, transparent))",
            }}
          />
        </a>

        <ul className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((label) => (
            <li key={label}>
              <a
                href={`#${label.toLowerCase()}`}
                className="relative block rounded-full px-5 py-2.5 text-[0.9375rem] font-medium text-white/75 transition-colors duration-300 after:absolute after:inset-x-5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-celeste after:transition-transform after:duration-300 after:ease-out hover:text-white hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Solid, high-contrast — this is a real action, not a quiet secondary link */}
        <a
          href="#contact"
          className="hidden touch-manipulation rounded-lg bg-celeste px-5 py-3 text-sm font-semibold text-foreground shadow-[0_4px_16px_-4px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-px hover:bg-white hover:shadow-[0_8px_22px_-6px_color-mix(in_srgb,var(--brand-celeste)_65%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste md:inline-block"
        >
          Contact us
        </a>

        {/* Mobile toggle — links are unreachable below md without this */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="hero-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-white/5 backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <motion.span
            animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="absolute h-px w-4 bg-white"
          />
          <motion.span
            animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3.5 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="absolute h-px w-4 bg-white"
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="hero-mobile-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((label, i) => (
                <motion.li
                  key={label}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease: EASE_OUT }}
                >
                  <a
                    href={`#${label.toLowerCase()}`}
                    onClick={() => setOpen(false)}
                    className="block touch-manipulation border-b border-white/10 py-3 text-base font-medium text-white/90 transition-colors hover:text-celeste focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
                  >
                    {label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={reduced ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + NAV_LINKS.length * 0.06, ease: EASE_OUT }}
                className="pt-4"
              >
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="block touch-manipulation rounded-lg bg-celeste px-5 py-3 text-center text-sm font-semibold text-foreground"
                >
                  Contact us
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type Metric = { value: string; label: string };

// NOTE: "98% CSAT" and "100K+ tickets" are placeholders — swap for real,
// verifiable figures before this ships. Coverage and industries-served are
// already true elsewhere on the site.
const METRICS: Metric[] = [
  { value: "24/7", label: "Coverage" },
  { value: "98%", label: "CSAT*" },
  { value: "5+", label: "Industries" },
  { value: "100K+", label: "Tickets*" },
];

function TrustMetrics() {
  return (
    <motion.dl
      variants={rise}
      className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/12 pt-7 md:flex md:items-stretch md:gap-0"
    >
      {METRICS.map((m, i) => (
        <div
          key={m.label}
          className={`md:pr-10 ${
            i > 0 ? "md:border-l md:border-white/12 md:pl-10" : ""
          }`}
        >
          <dt className="sr-only">{m.label}</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums leading-none text-white sm:text-[1.75rem]">
            {m.value}
          </dd>
          {/* aria-hidden: the sr-only <dt> already names this metric */}
          <dd
            aria-hidden
            className="mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/60"
          >
            {m.label}
          </dd>
        </div>
      ))}
    </motion.dl>
  );
}

/* ─── Brand signature — concentric arcs echoing the logo's twin circles,
   cropped at the left edge, restrained enough to read as identity ─── */
function BrandArc({ reduced }: { reduced: boolean }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 400 400"
      className="pointer-events-none absolute -left-36 bottom-6 hidden h-[26rem] w-[26rem] lg:block"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, delay: 1, ease: EASE_OUT }}
    >
      <motion.g
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="var(--brand-celeste)"
          strokeOpacity="0.32"
          strokeWidth="1.25"
          strokeDasharray="4 14"
          strokeLinecap="round"
        />
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="var(--brand-celeste)"
          strokeOpacity="0.18"
          strokeWidth="1"
        />
      </motion.g>
    </motion.svg>
  );
}

/* ─── Hero — full-bleed photo, dark scrim, bold uppercase headline ─── */
export default function HeroImage() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink text-white">
      {/* Background photo — slow Ken Burns drift for a touch of cinema.
          easeInOut so the reversal breathes instead of snapping. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 will-change-transform"
        initial={{ scale: 1 }}
        animate={reduced ? undefined : { scale: 1.08 }}
        transition={{
          duration: 26,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <Image
          src="/hero-image.jpeg"
          alt=""
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
      </motion.div>

      {/* Scrim — dark on the left where copy sits, opened up further so
          faces, monitors and office depth stay visible on the right */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--ink) 93%, transparent) 0%, color-mix(in srgb, var(--ink) 85%, transparent) 22%, color-mix(in srgb, var(--ink) 60%, transparent) 42%, color-mix(in srgb, var(--ink) 28%, transparent) 58%, color-mix(in srgb, var(--ink) 10%, transparent) 72%, transparent 84%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--ink) 60%, transparent) 0%, transparent 24%, transparent 74%, color-mix(in srgb, var(--ink) 38%, transparent) 100%)",
        }}
      />

      {/* Brand light — a faint celeste bloom where the photo's screens glow,
          tying the photograph into the palette instead of sitting apart from it */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 42% 55% at 78% 42%, color-mix(in srgb, var(--brand-celeste) 12%, transparent) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Film grain — kills digital sterility on the large dark gradient */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <BrandArc reduced={reduced} />
      <HeroNav reduced={reduced} />

      {/* Content — entrance gated on reduced motion (Motion animates via JS,
          so the global CSS reduced-motion net doesn't cover it) */}
      <motion.div
        variants={container}
        initial={reduced ? false : "hidden"}
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-16 sm:px-12 lg:px-16"
      >
        {/* Eyebrow — editorial kicker anchoring the headline */}
        <motion.p
          variants={rise}
          className="mb-6 flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.24em] text-celeste/90"
        >
          <span aria-hidden className="inline-block h-px w-10 bg-celeste/60" />
          Trusted Operations Partner
        </motion.p>

        <h1 className="font-heading max-w-2xl text-balance text-[clamp(2.3rem,5.4vw,4.25rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em]">
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span
              variants={reduced ? rise : lineReveal}
              className="block text-white"
            >
              We power operations.
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span
              variants={reduced ? rise : lineReveal}
              className="block text-celeste"
            >
              You drive growth.
            </motion.span>
          </span>
        </h1>

        <motion.p
          variants={rise}
          className="mt-5 max-w-[50ch] text-pretty text-[1.125rem] font-light leading-relaxed text-white/80"
        >
          Customer support, technical support and business process
          outsourcing solutions tailored for growing companies.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"
        >
          <a
            href="#services"
            className="group inline-flex touch-manipulation items-center gap-3 rounded-full bg-celeste py-2 pl-6 pr-2 text-[0.9375rem] font-semibold text-foreground transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-px hover:bg-white hover:shadow-[0_10px_30px_-8px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
          >
            Explore services
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-celeste transition-transform duration-300 group-hover:translate-x-0.5">
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3.5 10.5 8 6 12.5" />
              </svg>
            </span>
          </a>
          <a
            href="#contact"
            className="touch-manipulation text-[0.9375rem] font-medium text-white/70 underline decoration-white/30 underline-offset-[6px] transition-colors duration-300 hover:text-white hover:decoration-celeste focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
          >
            Talk to our team
          </a>
        </motion.div>

        <TrustMetrics />
      </motion.div>

      {/* Right-edge scrim — a narrow dark band so the vertical tagline stays
          legible over the photo's bright window light */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 z-[5] hidden w-16 lg:block"
        style={{
          background:
            "linear-gradient(270deg, color-mix(in srgb, var(--ink) 48%, transparent) 0%, color-mix(in srgb, var(--ink) 20%, transparent) 55%, transparent 100%)",
        }}
      />

      {/* Edge tagline — runs vertically down the right edge, clear of both
          the nav and the photo's focal point; an editorial signature, not a caption */}
      <motion.span
        initial={reduced ? false : { opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 1.1, ease: EASE_OUT }}
        className="absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-white [writing-mode:vertical-rl] lg:flex"
        style={{
          textShadow:
            "0 1px 8px color-mix(in srgb, var(--ink) 90%, transparent)",
        }}
      >
        <span aria-hidden className="inline-block h-10 w-px bg-white/60" />
        24/7 Global Support
      </motion.span>
    </section>
  );
}
