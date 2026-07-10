"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const LINKS = [
  { label: "About us", href: "#" },
  { label: "Services", href: "#" },
  { label: "Sectors", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Navbar() {
  const reduced = useReducedMotion() ?? false;
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  const stop = (e: React.MouseEvent) => e.preventDefault();

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${
        scrolled || open
          ? "border-b border-border/70 bg-background/80 shadow-[0_1px_12px_rgba(15,32,40,0.04)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5"
      >
        <a href="#" onClick={stop} aria-label="Center Quest home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={412}
            height={304}
            priority
            className="h-12 w-auto"
          />
        </a>

        {/* desktop links */}
        <ul
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {LINKS.map(({ label, href }) => (
            <li key={label} className="relative">
              {hovered === label && (
                <motion.span
                  layoutId="nav-hover"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 400, damping: 32 }
                  }
                  className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--brand-celeste)_16%,transparent)]"
                />
              )}
              <a
                href={href}
                onClick={stop}
                onMouseEnter={() => setHovered(label)}
                onFocus={() => setHovered(label)}
                className="relative z-10 block rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors duration-300 hover:text-petroleo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={stop}
            className="hidden rounded-lg bg-petroleo px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--brand-petroleo)_88%,black)] hover:shadow-[0_8px_20px_-8px_rgba(63,115,141,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo md:block"
          >
            Contact us
          </a>

          {/* mobile toggle */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/60 backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo md:hidden"
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
      </nav>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
              {LINKS.map(({ label, href }, i) => (
                <motion.li
                  key={label}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease: EASE_OUT }}
                >
                  <a
                    href={href}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                    }}
                    className="block border-b border-border/40 py-3 text-base font-medium text-foreground/90 transition-colors hover:text-petroleo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
                  >
                    {label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={reduced ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + LINKS.length * 0.06, ease: EASE_OUT }}
                className="pt-4"
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                  }}
                  className="block rounded-lg bg-petroleo px-5 py-3 text-center text-sm font-semibold text-white"
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
