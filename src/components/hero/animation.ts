import type { Variants } from "motion/react";
import { SERVICE_ICON, SERVICES } from "@/components/services/data";
import type { Dictionary } from "@/i18n/dictionaries/types";
import type { Locale } from "@/i18n/config";
import type { NavLink } from "@/components/navigation/data";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const HEADLINE_ROTATE_MS = 4600;

export function getHeroNavLinks(dict: Dictionary, lang: Locale): readonly NavLink[] {
  return [
    {
      label: dict.hero.navLinks.services,
      href: "#services",
      children: SERVICES.map((service) => ({
        label: service.label[lang],
        href: service.href,
        description: service.strapline[lang],
        icon: SERVICE_ICON[service.id],
      })),
    },
    { label: dict.hero.navLinks.successStories, href: "#success-stories" },
    { label: dict.hero.navLinks.about, href: "#about" },
    { label: dict.hero.navLinks.contact, href: "/quote" },
  ];
}

export const heroContentVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } },
};

export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
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
