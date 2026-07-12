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
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT },
  },
};

const NAV_LINKS = ["About us", "Services", "Sectors", "Contact"];

const SECTORS = [
  "Health",
  "Banking & Finance",
  "Retail & E-Commerce",
  "Telecommunications",
  "Tourism & Hospitality",
];

/* Six services from the company copy — icon + name + one-line hook. */
const SERVICES: { name: string; blurb: string; icon: React.ReactNode }[] = [
  {
    name: "Software Development",
    blurb: "Custom applications that streamline processes.",
    icon: <path d="M5.5 6 2.5 9l3 3M10.5 6l3 3-3 3M9 3.5 7 14.5" />,
  },
  {
    name: "Business Solutions",
    blurb: "Automation tools and operational platforms.",
    icon: (
      <>
        <rect x="2.5" y="5" width="11" height="8.5" rx="1.5" />
        <path d="M5.5 5V3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5V5" />
      </>
    ),
  },
  {
    name: "Technical Support",
    blurb: "Expert support that keeps you running smoothly.",
    icon: (
      <>
        <path d="M3 9.5V8a5 5 0 0 1 10 0v1.5" />
        <rect x="2" y="9" width="3" height="4.5" rx="1.2" />
        <rect x="11" y="9" width="3" height="4.5" rx="1.2" />
      </>
    ),
  },
  {
    name: "AI Implementation",
    blurb: "Assistants, RAG and automation in your tools.",
    icon: (
      <>
        <rect x="4" y="4" width="8" height="8" rx="2" />
        <path d="M8 1.5V4M8 12v2.5M1.5 8H4M12 8h2.5" />
      </>
    ),
  },
  {
    name: "Back Office Support",
    blurb: "Data entry, billing and reporting under SLAs.",
    icon: (
      <>
        <rect x="3.5" y="2.5" width="9" height="11" rx="1.5" />
        <path d="M6 6h4M6 8.5h4M6 11h2.5" />
      </>
    ),
  },
  {
    name: "Customer Service",
    blurb: "Omnichannel support with faster, friendlier answers.",
    icon: (
      <path d="M13.5 7.5a5.5 5.5 0 0 1-8.1 4.84L2.5 13.5l1.16-2.9A5.5 5.5 0 1 1 13.5 7.5Z" />
    ),
  },
];

/* Confetti — tiny brand-colored dots scattered around the hero,
   echoing the reference's floating specks. Decorative only. */
const DOTS: { top: string; left: string; size: number; color: string }[] = [
  { top: "12%", left: "46%", size: 10, color: "var(--brand-verde)" },
  { top: "8%", left: "72%", size: 7, color: "var(--brand-celeste)" },
  { top: "30%", left: "38%", size: 6, color: "var(--brand-gris)" },
  { top: "62%", left: "44%", size: 8, color: "var(--brand-celeste)" },
  { top: "20%", left: "92%", size: 9, color: "var(--brand-verde)" },
  { top: "70%", left: "90%", size: 6, color: "var(--brand-gris)" },
  { top: "78%", left: "58%", size: 7, color: "var(--brand-petroleo)" },
];

function Confetti({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      {DOTS.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.color,
            opacity: 0.85,
          }}
          animate={reduced ? undefined : { y: [0, -10, 0] }}
          transition={{
            duration: 5 + i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Dark nav — logo left, centered links, verde pill CTA right. ─── */
function DarkNav({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="relative z-30"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-12 lg:px-16">
        <a href="#" aria-label="Center Quest home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={412}
            height={304}
            priority
            className="h-11 w-auto sm:h-12"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((label) => (
            <li key={label}>
              <a
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="relative block rounded-full px-5 py-2.5 text-[0.875rem] font-medium text-white/70 transition-colors duration-300 after:absolute after:inset-x-5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-verde after:transition-transform after:duration-300 after:ease-out hover:text-white hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="group relative hidden touch-manipulation overflow-hidden rounded-full bg-verde px-6 py-3 text-sm font-semibold text-ink shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--brand-verde)_70%,transparent)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde sm:inline-block"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-celeste transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
            <span className="relative z-10">Contact us</span>
          </a>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="dark-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde lg:hidden"
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
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="dark-mobile-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden border-b border-white/10 bg-ink/95 backdrop-blur-md lg:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
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
                    className="block touch-manipulation border-b border-white/10 py-3 text-base font-medium text-white/90 transition-colors hover:text-verde focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
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
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="block touch-manipulation rounded-full bg-verde px-6 py-3 text-center text-sm font-semibold text-ink"
                >
                  Contact us
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── Dark hero — reference-style: near-black canvas, split hero with
   glowing photo, confetti dots, sector chip strip, then a services
   grid (cards left, heading right). ─── */
export default function HeroDark() {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="relative isolate overflow-hidden bg-ink text-white">
      {/* Ambient glows — celeste top-right behind the photo, verde low-left */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 40% at 74% 22%, color-mix(in srgb, var(--brand-celeste) 16%, transparent) 0%, transparent 70%), radial-gradient(ellipse 40% 35% at 10% 85%, color-mix(in srgb, var(--brand-verde) 10%, transparent) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 50% 55%, color-mix(in srgb, var(--brand-petroleo) 14%, transparent) 0%, transparent 75%)",
        }}
      />

      <DarkNav reduced={reduced} />

      {/* ── Hero split ── */}
      <section id="hero" className="relative">
        <Confetti reduced={reduced} />

        <motion.div
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="visible"
          className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-16 pt-14 sm:px-12 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-16"
        >
          {/* Copy */}
          <div className="relative z-10">
            <motion.p
              variants={rise}
              className="text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-celeste"
            >
              Center Quest CQ
            </motion.p>
            <motion.h1
              variants={rise}
              style={{ textWrap: "balance" } as React.CSSProperties}
              className="font-heading mt-4 max-w-[16ch] text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.06] tracking-[-0.02em] text-white"
            >
              Top-Notch{" "}
              <span className="text-verde">Business Solutions</span> Agency
            </motion.h1>
            <motion.p
              variants={rise}
              className="mt-5 max-w-[46ch] text-pretty text-[1.0625rem] leading-relaxed text-white/70"
            >
              With extensive experience in technology, customer service, and
              technical support, we help you transform your operation into a
              powerhouse.
            </motion.p>
            <motion.div variants={rise} className="mt-8">
              <a
                href="#contact"
                className="group relative inline-flex touch-manipulation items-center gap-3 overflow-hidden rounded-full bg-verde py-2.5 pl-7 pr-2.5 text-[0.9375rem] font-semibold text-ink shadow-[0_12px_28px_-10px_color-mix(in_srgb,var(--brand-verde)_70%,transparent)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-celeste transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                />
                <span className="relative z-10">Schedule a Call</span>
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
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

          {/* Photo — rounded block over a brand glow, like the reference cutout */}
          <motion.div variants={rise} className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[3rem]"
              style={{
                background:
                  "radial-gradient(ellipse 70% 65% at 55% 45%, color-mix(in srgb, var(--brand-celeste) 26%, transparent) 0%, transparent 72%)",
              }}
            />
            <div
              aria-hidden
              className="absolute -right-3 top-6 h-20 w-20 rounded-full sm:-right-5 sm:h-24 sm:w-24"
              style={{
                background:
                  "color-mix(in srgb, var(--brand-verde) 45%, transparent)",
                filter: "blur(2px)",
              }}
            />
            <div className="relative mx-auto aspect-square w-full max-w-75 overflow-hidden rounded-full border border-white/10 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.8)] sm:max-w-95 lg:max-w-105">
              <Image
                src="/MichelePodesta.png"
                alt="Michele Podesta, Center Quest"
                fill
                priority
                quality={85}
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 380px, 300px"
                className="object-cover"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* ── Sector strip — the reference's "Featured in" row ── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 sm:px-12 lg:px-16"
        >
          <div className="flex items-center gap-4 pb-5">
            <p className="shrink-0 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-white/60">
              Sectors we specialize in
            </p>
            <span aria-hidden className="h-px flex-1 bg-white/10" />
          </div>
          <ul className="flex flex-wrap gap-3">
            {SECTORS.map((s) => (
              <li key={s}>
                <span className="inline-block rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-[0.875rem] font-medium text-celeste transition-colors duration-300 hover:border-celeste/40 hover:bg-white/[0.08]">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ── Services grid — cards left, heading right ── */}
      <section
        id="services"
        className="relative mx-auto w-full max-w-7xl px-6 pb-24 sm:px-12 lg:px-16"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <motion.ul
            variants={container}
            initial={reduced ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1"
          >
            {SERVICES.map((svc) => (
              <motion.li key={svc.name} variants={rise}>
                <a
                  href="#contact"
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-5 transition-[border-color,background-color,transform] duration-400 ease-out hover:-translate-y-1 hover:border-verde/40 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-verde/15 text-verde transition-colors duration-300 group-hover:bg-verde group-hover:text-ink">
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {svc.icon}
                    </svg>
                  </span>
                  <span className="font-heading text-[1rem] font-semibold leading-snug text-white">
                    {svc.name}
                  </span>
                  <span className="text-[0.875rem] leading-relaxed text-white/60">
                    {svc.blurb}
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="order-1 lg:order-2"
          >
            <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-celeste">
              Our Services
            </p>
            <h2
              style={{ textWrap: "balance" } as React.CSSProperties}
              className="font-heading mt-4 text-[clamp(1.9rem,3.6vw,2.8rem)] font-bold leading-[1.1] tracking-[-0.02em] text-white"
            >
              Everything your operation needs,{" "}
              <span className="text-verde">under one roof</span>
            </h2>
            <p className="mt-5 max-w-[44ch] text-pretty text-[1rem] leading-relaxed text-white/70">
              Whether you need custom software development, a robust call
              center solution, or ongoing technical support, we optimize your
              operations and take your business to the next level.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
