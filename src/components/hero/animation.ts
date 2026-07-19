import type { Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const HEADLINE_ROTATE_MS = 4600;

export const ROTATING_HEADLINES = [
  { top: "We power operations.", bottom: "You drive growth." },
  { top: "We answer every call.", bottom: "You keep every client." },
  { top: "We run the back office.", bottom: "You run the business." },
  { top: "We build your systems.", bottom: "You set the pace." },
] as const;

export const HERO_NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Success stories", href: "#success-stories" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export const heroContentVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } },
};

export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT },
  },
};

export const tickerLineVariants: Variants = {
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

export const tickerFadeVariants: Variants = {
  parked: { opacity: 0, transition: { duration: 0 } },
  active: { opacity: 1, transition: { duration: 0.4 } },
  leaving: { opacity: 0, transition: { duration: 0.3 } },
};

export const checkDrawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT, delay: 0.3 },
  },
};
