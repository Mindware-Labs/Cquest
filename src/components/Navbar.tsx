"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import DesktopNav from "@/components/navigation/DesktopNav";
import MobileNav from "@/components/navigation/MobileNav";
import { NAV_EASE_OUT, SERVICE_DETAIL_PAGES, getNavLinks, getServiceNavLinks } from "@/components/navigation/data";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink, useLocalizedPathname } from "@/i18n/LocalizedLink";

const MotionLink = motion.create(LocalizedLink);

export default function Navbar() {
  const { dict, lang } = useI18n();
  const reduced = useReducedMotion() ?? false;
  const pathname = useLocalizedPathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    ref: ctaRef,
    style: ctaStyle,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.25, 2);

  // "Scrolled" flips the nav to its light chrome — but on a page with a dark
  // hero, flipping on the first pixel of scroll puts dark/near-invisible
  // text over a background that's still dark. Track the hero itself instead:
  // stay in the dark-hero look until it has actually scrolled out from under
  // the fixed navbar, then switch. Pages without a `[data-hero-boundary]`
  // (nothing currently renders Navbar outside /services/*, but this keeps it
  // safe if one ever does) fall back to a plain scroll-position threshold.
  useEffect(() => {
    const heroEl = document.querySelector<HTMLElement>("[data-hero-boundary]");

    if (!heroEl) {
      const onScroll = () => setScrolled(window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [pathname]);

  const serviceDetailPage = (SERVICE_DETAIL_PAGES as readonly string[]).includes(pathname);
  const inverse = serviceDetailPage && !scrolled && !open;
  const navLinks = getServiceNavLinks(dict)[pathname] ?? getNavLinks(dict, lang);
  // The quote CTA opens the dedicated /quote form — on a service page it
  // deep-links with that service preselected (Step 2). Left un-prefixed here;
  // MotionLink/LocalizedLink resolves the locale itself.
  const quoteHref = serviceDetailPage
    ? `/quote?servicio=${pathname.split("/").pop()}`
    : "/quote";

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: NAV_EASE_OUT }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${
        scrolled || open
          ? "border-b border-border/70 bg-background/80 shadow-[0_1px_12px_rgba(15,32,40,0.04)] backdrop-blur-xl"
          : inverse
            ? // Pure transparency lets the hero's own headline slide up and
              // visually collide with the nav links while it scrolls past —
              // a blurred top-down scrim keeps the nav readable without
              // looking like solid chrome. The blur (not just the darkening)
              // is what keeps scrolling hero text from reading as a sharp
              // overlap with the nav's own labels.
              "border-b border-white/12 bg-gradient-to-b from-black/55 via-black/20 to-transparent backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label={dict.nav.mainNavAriaLabel}
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5"
      >
        <LocalizedLink href="/" aria-label={dict.nav.homeLinkAriaLabel} className="shrink-0">
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={173}
            height={128}
            preload
            className={`h-12 w-auto transition-[filter] duration-500 ${inverse ? "brightness-0 invert" : ""}`}
          />
        </LocalizedLink>

        <DesktopNav reduced={reduced} inverse={inverse} links={navLinks} />

        <div className="flex items-center gap-3">
          <MotionLink
            ref={ctaRef}
            href={quoteHref}
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
            <span className="relative z-10">{dict.common.contactUs}</span>
          </MotionLink>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? dict.nav.menuClose : dict.nav.menuOpen}
            onClick={() => setOpen((value) => !value)}
            className={`relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 md:hidden ${inverse ? "border-white/30 bg-white/5 focus-visible:outline-celeste" : "border-border/70 bg-background/60 focus-visible:outline-petroleo"}`}
          >
            <span className="sr-only">{open ? dict.nav.menuClose : dict.nav.menuOpen}</span>
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
      <MobileNav open={open} reduced={reduced} onClose={() => setOpen(false)} links={navLinks} ctaHref={quoteHref} />
    </motion.header>
  );
}
