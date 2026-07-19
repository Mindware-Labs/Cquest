"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import heroImage from "../../public/hero-image.jpeg";
import { useMagnetic } from "../hooks/useMagnetic";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  // delayChildren holds the supporting copy until the rotating headline's
  // first pair has essentially landed, preserving the original top-down rhythm.
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } },
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

/* ── Rotating headline ────────────────────────────────────
   The hero statement is a ticker of "We … / You …" pairs, one per way of
   reading the offer. Copy is edited here; keep the parallel structure. */
const HEADLINE_ROTATE_MS = 4600;

const ROTATING_HEADLINES = [
  { top: "We power operations.", bottom: "You drive growth." },
  { top: "We answer every call.", bottom: "You keep every client." },
  { top: "We run the back office.", bottom: "You run the business." },
  { top: "We build your systems.", bottom: "You set the pace." },
];

/* Ticker lines as a dissolve: the outgoing pair loses focus and fades with a
   whisper of upward drift; once it has cleared, the incoming pair condenses
   out of the blur from just below rest. Sequential — the entrance delay
   covers the exit, so two messages never speak at once. The bottom line
   trails the top by a beat in both directions. Parked pairs reset instantly
   while invisible. */
const tickerLine: Variants = {
  parked: { opacity: 0, y: 16, filter: "blur(7px)", transition: { duration: 0 } },
  active: (line: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_OUT, delay: 0.3 + line * 0.12 },
  }),
  leaving: (line: number) => ({
    opacity: 0,
    y: -12,
    filter: "blur(7px)",
    transition: { duration: 0.45, ease: "easeIn", delay: line * 0.06 },
  }),
};

// Reduced motion: the rotation survives as a quiet crossfade, no travel.
const tickerFade: Variants = {
  parked: { opacity: 0, transition: { duration: 0 } },
  active: { opacity: 1, transition: { duration: 0.4 } },
  leaving: { opacity: 0, transition: { duration: 0.3 } },
};

// Checkmark draws itself in after the social-proof line settles — a quiet
// flourish instead of an infinite loop, so it doesn't compete for attention.
const checkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT, delay: 0.3 },
  },
};

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Success stories", href: "#success-stories" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/* ─── Bespoke dark nav — the shared light navbar reads illegibly here,
   so this hero carries its own, tuned for a photo backdrop. Includes a
   mobile drawer so small viewports keep access to the links. ─── */
function HeroNav({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const {
    ref: navCtaRef,
    style: navCtaStyle,
    onMouseEnter: navCtaOnMouseEnter,
    onMouseMove: navCtaOnMouseMove,
    onMouseLeave: navCtaOnMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.25, 2);

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
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="relative block rounded-full px-5 py-2.5 text-[0.9375rem] font-medium text-white/90 transition-colors duration-300 after:absolute after:inset-x-5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-celeste after:transition-transform after:duration-300 after:ease-out hover:text-white hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Solid, high-contrast — this is a real action, not a quiet secondary link.
            Magnetic pull + spring scale read as premium; the white sweep still
            carries the color-swap payoff underneath. */}
        <motion.a
          ref={navCtaRef}
          href="#contact"
          onMouseEnter={navCtaOnMouseEnter}
          onMouseMove={navCtaOnMouseMove}
          onMouseLeave={navCtaOnMouseLeave}
          style={navCtaStyle}
          whileHover={{ scale: 1.045 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="group/nav relative hidden touch-manipulation overflow-hidden rounded-lg bg-celeste px-5 py-3 text-sm font-semibold text-foreground shadow-[0_2px_10px_-4px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_28px_-8px_color-mix(in_srgb,var(--brand-celeste)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste md:inline-block"
        >
          <span className="relative z-10 transition-colors duration-300 group-hover/nav:text-[var(--ink)]">Request a quote</span>
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity duration-300 ease-out group-hover/nav:opacity-100" />
        </motion.a>

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
              {NAV_LINKS.map(({ label, href }, i) => (
                <motion.li
                  key={label}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease: EASE_OUT }}
                >
                  <a
                    href={href}
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
                  Request a quote
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Hero — full-bleed photo, dark scrim, bold uppercase headline.
   One strong message: headline, subhead, CTAs, one line of social proof —
   no sidebars, no ornament competing for attention. ─── */
export default function HeroImage() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  /* Headline ticker: current pair on stage, previous pair on its way out.
     Tracking both lets the exit and entrance overlap like a relay handoff.
     The interval skips beats while the tab is hidden so the rotation never
     races to catch up on return. */
  const [slides, setSlides] = useState<{ current: number; previous: number | null }>({
    current: 0,
    previous: null,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;
      setSlides(({ current }) => ({
        current: (current + 1) % ROTATING_HEADLINES.length,
        previous: current,
      }));
    }, HEADLINE_ROTATE_MS);
    return () => clearInterval(timer);
  }, []);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [0, 54],
  );
  const imageScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [1, 1] : [1, 1.07],
  );
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [0, -24],
  );
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [1, 1] : [1, 0.38],
  );
  // The scroll cue only belongs to the resting hero — it clears out within
  // the first stretch of scroll so it never lingers over moving content.
  const cueOpacity = useTransform(
    scrollYProgress,
    [0, 0.12],
    reduced ? [1, 1] : [1, 0],
  );
  const {
    ref: exploreCtaRef,
    style: exploreCtaStyle,
    onMouseEnter: exploreCtaOnMouseEnter,
    onMouseMove: exploreCtaOnMouseMove,
    onMouseLeave: exploreCtaOnMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.2, 3);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="cq-hero relative isolate flex min-h-svh scroll-mt-20 flex-col overflow-hidden bg-ink text-white"
    >
      {/* Background photo — restrained parallax keeps the scroll handoff alive. */}
      <motion.div aria-hidden style={{ y: imageY, scale: imageScale }} className="absolute -inset-y-8 inset-x-0 will-change-transform">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          quality={82}
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
      </motion.div>

      {/* Scrim — dark on the left where copy sits. Front-loaded so the
          right side of the photo (the person, the office) can breathe. */}
      <div
        aria-hidden
        className="cq-hero-bloom absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--ink) 90%, transparent) 0%, color-mix(in srgb, var(--ink) 78%, transparent) 20%, color-mix(in srgb, var(--ink) 50%, transparent) 38%, color-mix(in srgb, var(--ink) 20%, transparent) 54%, color-mix(in srgb, var(--ink) 6%, transparent) 66%, transparent 78%)",
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

      <HeroNav reduced={reduced} />

      {/* Content — vertically centered with a slight downward bias */}
      <motion.div
        variants={container}
        initial={reduced ? false : "hidden"}
        animate="visible"
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-[calc(max(4rem,env(safe-area-inset-bottom))+var(--curtain))] pt-28 sm:px-12 sm:pt-32 lg:px-16"
      >
        {/* Rotating headline — every pair stacks in the same grid cell, so the
            block always reserves the tallest pair's height and the page never
            shifts as messages trade places. Screen readers get one canonical
            line; the ticker itself is presentation. */}
        <h1
          style={{ textWrap: "balance" } as React.CSSProperties}
          className="font-heading grid max-w-[38rem] text-[clamp(2.3rem,5.4vw,4.25rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em]"
        >
          <span className="sr-only">We power operations. You drive growth.</span>
          {ROTATING_HEADLINES.map((pair, index) => {
            const status =
              index === slides.current
                ? "active"
                : index === slides.previous
                  ? "leaving"
                  : "parked";
            const variants = reduced ? tickerFade : tickerLine;
            return (
              <span
                key={pair.top}
                aria-hidden
                className={`col-start-1 row-start-1 select-none ${
                  index === slides.current ? "" : "pointer-events-none"
                }`}
              >
                {/* No clip masks here — the dissolve needs its blur halo and
                    drift to breathe past the line box. */}
                <span className="block pb-[0.08em]">
                  <motion.span
                    custom={0}
                    variants={variants}
                    initial={reduced ? status : "parked"}
                    animate={status}
                    className="block text-white"
                  >
                    {pair.top}
                  </motion.span>
                </span>
                <span className="block pb-[0.08em]">
                  <motion.span
                    custom={1}
                    variants={variants}
                    initial={reduced ? status : "parked"}
                    animate={status}
                    className="block text-celeste"
                  >
                    {pair.bottom}
                  </motion.span>
                </span>
              </span>
            );
          })}
        </h1>

        <motion.p
          variants={rise}
          className="mt-5 max-w-[50ch] text-pretty text-[1.125rem] font-light leading-relaxed text-white/90"
        >
          Call center, BPO and systems development for operations —
          one partner across your three growth priorities.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"
        >
          <motion.a
            ref={exploreCtaRef}
            href="#contact"
            onMouseEnter={exploreCtaOnMouseEnter}
            onMouseMove={exploreCtaOnMouseMove}
            onMouseLeave={exploreCtaOnMouseLeave}
            style={exploreCtaStyle}
            whileHover={{ scale: 1.035 }}
            whileTap={{ scale: 0.965 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="group relative inline-flex touch-manipulation items-center gap-3 overflow-hidden rounded-full bg-celeste py-2 pl-6 pr-2 text-[0.9375rem] font-semibold text-foreground shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--brand-celeste)_40%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_20px_40px_-10px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
          >
            {/* White fill sweeps in from left on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
            <span className="relative z-10">Request a quote</span>
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-celeste transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:shadow-[0_0_14px_color-mix(in_srgb,var(--brand-celeste)_45%,transparent)]">
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
            </span>
          </motion.a>
          <a
            href="#services"
            className="group/link relative touch-manipulation text-[0.9375rem] font-medium text-white/70 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
          >
            <span className="inline-flex items-center gap-1.5">
              See our services
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-3 w-3 -translate-x-1 text-celeste opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-0 group-hover/link:opacity-100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3.5 10.5 8 6 12.5" />
              </svg>
            </span>
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-celeste transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:scale-x-100"
            />
          </a>
        </motion.div>

        {/* Social proof — one understated line, not a metrics grid */}
        <motion.p
          variants={rise}
          className="mt-10 flex items-center gap-2 border-t border-white/12 pt-6 text-[0.875rem] text-white/80"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 shrink-0 text-celeste"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path variants={checkDraw} d="M2.5 8.5 6 12l7.5-8" />
          </svg>
          Call Center · BPO · Systems Development — 24/7 coverage
        </motion.p>
      </motion.div>

      {/* Scroll cue — a hairline track with a celeste drip, inviting the first
          scroll; it fades as soon as the journey starts. Desktop only: on
          mobile the fold itself already implies more below. Two layers because
          a style motion value would override an animate on the same property:
          the outer div follows scroll, the inner link owns its late entrance. */}
      <motion.div
        style={{ opacity: cueOpacity, bottom: "calc(var(--curtain) + 1.75rem)" }}
        className="absolute left-1/2 z-10 hidden -translate-x-1/2 md:block"
      >
        <motion.a
          href="#services"
          aria-label="Scroll to services"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.4 }}
          className="flex flex-col items-center gap-2.5"
        >
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/55">
            Scroll
          </span>
          <span aria-hidden className="cq-scroll-cue" />
        </motion.a>
      </motion.div>
    </section>
  );
}
