import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useMagnetic } from "@/hooks/useMagnetic";
import DesktopNav from "@/components/navigation/DesktopNav";
import MobileSidebar from "@/components/navigation/MobileSidebar";
import { EASE_OUT, HERO_NAV_LINKS } from "./animation";

const MotionLink = motion.create(Link);

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
        <Link href="/" aria-label="Center Quest home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={173}
            height={128}
            preload
            className="h-12 w-auto sm:h-14"
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 1px 6px color-mix(in srgb, var(--ink) 60%, transparent))",
            }}
          />
        </Link>

        <DesktopNav reduced={reduced} inverse links={HERO_NAV_LINKS} />

        <MotionLink
          ref={ctaRef}
          href="/cotizador"
          onMouseEnter={onMouseEnter}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={ctaStyle}
          whileHover={{ scale: 1.045 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="cq-rect-cta group/nav relative hidden touch-manipulation items-center overflow-hidden bg-celeste px-6 py-3 text-foreground shadow-[0_2px_10px_-4px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_28px_-8px_color-mix(in_srgb,var(--brand-celeste)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste md:inline-flex"
        >
          <span className="relative z-10 transition-colors duration-300 group-hover/nav:text-[var(--ink)]">
            Contact us
          </span>
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[2px] bg-white opacity-0 transition-opacity duration-300 ease-out group-hover/nav:opacity-100" />
        </MotionLink>

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

      <MobileSidebar
        id="hero-mobile-menu"
        open={open}
        reduced={reduced}
        onClose={() => setOpen(false)}
        links={HERO_NAV_LINKS}
        ctaHref="/cotizador"
        theme="dark"
      />
    </motion.div>
  );
}
