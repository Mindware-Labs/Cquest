"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import DesktopNav from "@/components/navigation/DesktopNav";
import MobileNav from "@/components/navigation/MobileNav";
import { NAV_EASE_OUT } from "@/components/navigation/data";
import { useMagnetic } from "@/hooks/useMagnetic";

export default function Navbar() {
  const reduced = useReducedMotion() ?? false;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const {
    ref: ctaRef,
    style: ctaStyle,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.25, 2);

  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 8));
  const callCenterPage = pathname === "/services/call-center";
  const inverse = callCenterPage && !scrolled && !open;

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: NAV_EASE_OUT }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${
        scrolled || open
          ? "border-b border-border/70 bg-background/80 shadow-[0_1px_12px_rgba(15,32,40,0.04)] backdrop-blur-xl"
          : inverse
            ? "border-b border-white/12 bg-transparent"
            : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5"
      >
        <Link href="/" aria-label="Center Quest home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={412}
            height={304}
            loading="eager"
            className={`h-12 w-auto transition-[filter] duration-500 ${inverse ? "brightness-0 invert" : ""}`}
          />
        </Link>

        <DesktopNav reduced={reduced} inverse={inverse} />

        <div className="flex items-center gap-3">
          <motion.a
            ref={ctaRef}
            href={callCenterPage ? "#contact" : "#"}
            onClick={(event) => !callCenterPage && event.preventDefault()}
            onMouseEnter={onMouseEnter}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={ctaStyle}
            whileHover={{ scale: 1.045 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className={`cq-rect-cta group/cta relative hidden items-center overflow-hidden px-6 py-3 shadow-[0_2px_10px_-4px_rgba(15,32,40,0.35)] transition-[background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_28px_-8px_rgba(15,32,40,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 md:inline-flex ${inverse ? "bg-celeste text-ink focus-visible:outline-celeste" : "bg-petroleo text-white focus-visible:outline-petroleo"}`}
          >
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-black/0 transition-[background-color] duration-500 ease-out group-hover/cta:bg-black/10" />
            <span className="relative z-10">Contact us</span>
          </motion.a>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className={`relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 md:hidden ${inverse ? "border-white/30 bg-white/5 focus-visible:outline-celeste" : "border-border/70 bg-background/60 focus-visible:outline-petroleo"}`}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <motion.span
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }}
              transition={{ duration: 0.3, ease: NAV_EASE_OUT }}
            className={`absolute h-px w-4 ${inverse ? "bg-white" : "bg-foreground"}`}
            />
            <motion.span
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3.5 }}
              transition={{ duration: 0.3, ease: NAV_EASE_OUT }}
            className={`absolute h-px w-4 ${inverse ? "bg-white" : "bg-foreground"}`}
            />
          </button>
        </div>
      </nav>
      <MobileNav open={open} reduced={reduced} onClose={() => setOpen(false)} />
    </motion.header>
  );
}
