"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import DesktopNav from "@/components/navigation/DesktopNav";
import MobileNav from "@/components/navigation/MobileNav";
import { ACCENT_CTA_PAGES, DARK_PAGES, NAV_EASE_OUT, NAV_HEIGHT_PX, SERVICE_DETAIL_PAGES, getNavLinks, getServiceNavLinks, isDarkHeroPage } from "@/components/navigation/data";

import container from "@/components/services/Container.module.css";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useSectionSpy } from "@/hooks/useSectionSpy";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";
import { dict } from "@/lib/dictionary";

const MotionLink = motion.create(TransitionLink);

export default function Navbar() {
  const reduced = useReducedMotion() ?? false;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    ref: ctaRef,
    style: ctaStyle,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.25, 2);

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
      { rootMargin: `-${NAV_HEIGHT_PX}px 0px 0px 0px` },
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [pathname]);

  const serviceDetailPage = (SERVICE_DETAIL_PAGES as readonly string[]).includes(pathname);

  const darkPage = (DARK_PAGES as readonly string[]).includes(pathname);

  /* En una página oscura entera el modo inverso no se apaga nunca: no hay un
     punto del scroll en el que debajo haya contenido claro. */
  const inverse =
    darkPage || (isDarkHeroPage(pathname) && !scrolled && !open);

  const accentCta = (ACCENT_CTA_PAGES as readonly string[]).includes(pathname);
  const navLinks = getServiceNavLinks()[pathname] ?? getNavLinks();

  const quoteHref = serviceDetailPage
    ? `/quote?servicio=${pathname.split("/").pop()}`
    : "/quote";

  const activeHref = useSectionSpy(
    navLinks.map((link) => link.href),
    NAV_HEIGHT_PX,
  );

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: NAV_EASE_OUT }}

      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ${
        scrolled || open
          ? darkPage
            ?

              "border-b border-white/12 bg-ink/85 shadow-[0_1px_12px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "border-b border-border/70 bg-background/80 shadow-[0_1px_12px_rgba(15,32,40,0.04)] backdrop-blur-xl"
          : inverse
            ?

              "border-b border-white/12 bg-gradient-to-b from-black/55 via-black/20 to-transparent backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label={dict.nav.mainNavAriaLabel}
        className={`${container.container} flex items-center justify-between py-5`}
      >
        <TransitionLink href="/" aria-label={dict.nav.homeLinkAriaLabel} className="ml-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={692}
            height={512}
            preload
            sizes="76px"
            className={`h-14 w-auto transition-[filter] duration-500 ${inverse ? "brightness-0 invert" : ""}`}
          />
        </TransitionLink>

        <DesktopNav reduced={reduced} inverse={inverse} links={navLinks} activeHref={activeHref} />

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
            className={`cq-rect-cta group/cta relative hidden items-center overflow-hidden px-6 py-3 shadow-[0_2px_10px_-4px_rgba(15,32,40,0.35)] transition-[background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_28px_-8px_rgba(15,32,40,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 md:inline-flex ${
              inverse
                ? accentCta
                  ?

                    "bg-[#9d5ce0] text-black focus-visible:outline-[#9d5ce0]"
                  : "bg-celeste text-ink focus-visible:outline-celeste"
                : "bg-petroleo text-white focus-visible:outline-petroleo"
            }`}
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
      <MobileNav
        open={open}
        reduced={reduced}
        onClose={() => setOpen(false)}
        links={navLinks}
        ctaHref={quoteHref}
        theme={darkPage ? "dark" : "light"}
      />
    </motion.header>
  );
}
