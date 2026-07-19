import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { EASE_OUT, HERO_NAV_LINKS } from "./animation";

export default function HeroNav({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const {
    ref: ctaRef,
    style: ctaStyle,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
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
            loading="eager"
            className="h-12 w-auto sm:h-14"
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 1px 6px color-mix(in srgb, var(--ink) 60%, transparent))",
            }}
          />
        </a>

        <ul className="hidden items-center gap-2 md:flex">
          {HERO_NAV_LINKS.map(({ label, href }) => (
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

        <motion.a
          ref={ctaRef}
          href="#contact"
          onMouseEnter={onMouseEnter}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={ctaStyle}
          whileHover={{ scale: 1.045 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="group/nav relative hidden touch-manipulation overflow-hidden rounded-lg bg-celeste px-5 py-3 text-sm font-semibold text-foreground shadow-[0_2px_10px_-4px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_28px_-8px_color-mix(in_srgb,var(--brand-celeste)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste md:inline-block"
        >
          <span className="relative z-10 transition-colors duration-300 group-hover/nav:text-[var(--ink)]">
            Contact us
          </span>
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity duration-300 ease-out group-hover/nav:opacity-100" />
        </motion.a>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="hero-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
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
              {HERO_NAV_LINKS.map(({ label, href }, index) => (
                <motion.li
                  key={label}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + index * 0.06, ease: EASE_OUT }}
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
                transition={{ duration: 0.4, delay: 0.05 + HERO_NAV_LINKS.length * 0.06, ease: EASE_OUT }}
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
