import { useState } from "react";
import { motion } from "motion/react";
import DesktopNav from "@/components/navigation/DesktopNav";
import MobileSidebar from "@/components/navigation/MobileSidebar";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import QuestLogoMark from "./QuestLogoMark";
import { EASE_OUT, getHeroNavLinks } from "./animation";

export default function HeroNav({ reduced }: { reduced: boolean }) {
  const { dict, lang } = useI18n();
  const heroNavLinks = getHeroNavLinks(dict, lang);
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="relative z-20"
    >
      <div className="grid w-full grid-cols-2 items-center px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5 md:grid-cols-3 lg:px-8 xl:px-10">
        <LocalizedLink
          href="/"
          aria-label={dict.nav.homeLinkAriaLabel}
          className="shrink-0 justify-self-start"
        >
          <QuestLogoMark />
        </LocalizedLink>

        <div className="hidden justify-self-center md:flex">
          <DesktopNav reduced={reduced} inverse links={heroNavLinks} />
        </div>

        <div className="flex items-center justify-self-end gap-4">
          <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-white/55 md:inline">
            {dict.hero.locationLabel}
          </span>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="hero-mobile-menu"
            aria-label={open ? dict.nav.menuClose : dict.nav.menuOpen}
            onClick={() => setOpen((value) => !value)}
            className="relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-white/25 bg-white/5 backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste md:hidden"
          >
            <span className="sr-only">{open ? dict.nav.menuClose : dict.nav.menuOpen}</span>
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

      <MobileSidebar
        id="hero-mobile-menu"
        open={open}
        reduced={reduced}
        onClose={() => setOpen(false)}
        links={heroNavLinks}
        ctaHref="/quote"
        theme="dark"
      />
    </motion.div>
  );
}
