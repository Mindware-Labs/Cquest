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
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT },
  },
};

const NAV_LINKS = ["Home", "About us", "Services", "Contact Us"];

/* ─── Nav lives inside the white card, like the reference. Pill link
   cluster in the center, logo left, action right. Mobile gets a
   drawer so links stay reachable. ─── */
function CardNav({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Home");

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
      className="relative z-20"
    >
      <div className="flex items-center justify-between gap-4 px-6 pt-5 sm:px-10 sm:pt-6 lg:px-12">
        <a href="#" aria-label="Center Quest home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={412}
            height={304}
            priority
            className="h-11 w-auto sm:h-12"
          />
        </a>

        {/* Pill nav — soft sunken capsule like the reference */}
        <ul className="hidden items-center gap-1 rounded-full bg-surface-sunken px-2 py-1.5 lg:flex">
          {NAV_LINKS.map((label) => (
            <li key={label}>
              <a
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setActive(label)}
                aria-current={active === label ? "page" : undefined}
                className={`relative block rounded-full px-5 py-2 text-[0.875rem] font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo ${
                  active === label
                    ? "text-petroleo"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {active === label && (
                  <motion.span
                    layoutId="nav-pill"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(13,30,41,0.08)]"
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[0.8125rem] font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo sm:flex"
          >
            EN
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3.5 6 8 10.5 12.5 6" />
            </svg>
          </button>

          <a
            href="#contact-us"
            className="group relative hidden touch-manipulation overflow-hidden rounded-full bg-petroleo px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--brand-petroleo)_60%,transparent)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_color-mix(in_srgb,var(--brand-petroleo)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo sm:inline-block"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
            <span className="relative z-10">Schedule a Call</span>
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="card-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-border bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <motion.span
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="absolute h-px w-4 bg-foreground"
            />
            <motion.span
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3.5 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="absolute h-px w-4 bg-foreground"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="card-mobile-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="flex flex-col px-6 pt-4 sm:px-10">
              {NAV_LINKS.map((label, i) => (
                <motion.li
                  key={label}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.05 + i * 0.06,
                    ease: EASE_OUT,
                  }}
                >
                  <a
                    href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setOpen(false)}
                    className="block touch-manipulation border-b border-border py-3 text-base font-medium text-foreground transition-colors hover:text-petroleo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
                  >
                    {label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={reduced ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.05 + NAV_LINKS.length * 0.06,
                  ease: EASE_OUT,
                }}
                className="pt-4"
              >
                <a
                  href="#contact-us"
                  onClick={() => setOpen(false)}
                  className="block touch-manipulation rounded-full bg-petroleo px-6 py-3 text-center text-sm font-semibold text-white"
                >
                  Schedule a Call
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── Hero — full-screen white canvas: nav on top, split hero
   (copy left, photo right) filling the viewport, strapline at the
   bottom. The old gradient frame and floating blobs are gone. ─── */
export default function HeroCard() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-white"
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col"
      >
        <CardNav reduced={reduced} />

        <motion.div
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="visible"
          className="grid flex-1 items-center gap-10 px-6 pb-10 pt-10 sm:px-10 sm:pb-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-12 lg:pb-14 lg:pt-12"
        >
          {/* Copy — left column */}
          <div className="relative z-10">
            <motion.p
              variants={rise}
              className="text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-verde"
            >
              Business Solutions
            </motion.p>

            <motion.h1
              variants={rise}
              style={{ textWrap: "balance" } as React.CSSProperties}
              className="font-heading mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground"
            >
              Center Quest:{" "}
              <span className="text-petroleo">
                We power operations, you drive growth.
              </span>
            </motion.h1>

            <motion.p
              variants={rise}
              className="mt-5 max-w-[42ch] text-pretty text-[1.0625rem] leading-relaxed text-muted"
            >
              Custom software development, robust call center solutions, and
              expert technical support that transform your operation into a
              powerhouse.
            </motion.p>

            <motion.div variants={rise} className="mt-8">
              <a
                href="#services"
                className="group relative inline-flex touch-manipulation items-center gap-3 overflow-hidden rounded-full bg-petroleo py-2.5 pl-7 pr-2.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_-8px_color-mix(in_srgb,var(--brand-petroleo)_65%,transparent)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_color-mix(in_srgb,var(--brand-petroleo)_60%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                />
                <span className="relative z-10">See our services</span>
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
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
            </motion.div>
          </div>

          {/* Photo — right column, arched top like the reference */}
          <motion.div variants={rise} className="relative">
            <div
              aria-hidden
              className="absolute -right-4 -top-4 h-24 w-24 rounded-[58%_42%_50%_50%/52%_46%_54%_48%] sm:-right-6 sm:-top-6 sm:h-32 sm:w-32"
              style={{
                background:
                  "linear-gradient(150deg, color-mix(in srgb, var(--brand-celeste) 80%, white), color-mix(in srgb, var(--brand-verde) 55%, #eef56a))",
                opacity: 0.9,
              }}
            />
            <div className="relative overflow-hidden rounded-[1.5rem] rounded-t-[45%_18%] shadow-[0_24px_50px_-20px_color-mix(in_srgb,var(--brand-petroleo)_40%,transparent)] sm:rounded-[2rem] sm:rounded-t-[48%_20%]">
              <Image
                src="/hero-image.jpeg"
                alt="Center Quest team collaborating around a laptop"
                width={1200}
                height={900}
                priority
                quality={80}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="h-[300px] w-full object-cover object-center sm:h-[380px] lg:h-[420px]"
              />
              {/* Celeste wash ties the photo into the palette */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(200deg, color-mix(in srgb, var(--brand-celeste) 18%, transparent) 0%, transparent 45%)",
                  mixBlendMode: "multiply",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
        {/* Strapline at the foot of the hero */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE_OUT }}
          className="mx-auto max-w-2xl px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center text-[1.0625rem] font-medium leading-relaxed text-muted sm:text-[1.1875rem]"
        >
          We help you transform your operation into a{" "}
          <span className="font-heading font-bold text-petroleo">
            powerhouse
          </span>
          .
        </motion.p>
      </motion.div>
    </section>
  );
}
