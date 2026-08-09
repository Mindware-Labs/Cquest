import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import DesktopNav from "@/components/navigation/DesktopNav";
import MobileSidebar from "@/components/navigation/MobileSidebar";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { EASE_OUT, REVEAL, chromeRise, getHeroNavLinks } from "./animation";

const MotionLink = motion.create(LocalizedLink);

export default function HeroNav({
  reduced,
  revealed,
  onServiceHover,
}: {
  reduced: boolean;

  revealed: boolean;

  onServiceHover?: (href: string | null) => void;
}) {
  const { dict, lang } = useI18n();
  const heroNavLinks = getHeroNavLinks(dict, lang);
  const [open, setOpen] = useState(false);
  const {
    ref: ctaRef,
    style: ctaStyle,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.25, 2);

  return (
    /* Solo PROPAGA la etiqueta de variante; cada celda de abajo lleva su beat.
       Antes la barra animaba como un bloque y se leía como un rectángulo. */
    <motion.div
      initial={reduced ? false : "hidden"}
      animate={revealed ? "visible" : "hidden"}

      /* Oculto es oculto: mientras no se ve, tampoco se tabula ni se pulsa. */
      inert={!revealed}
      className="relative z-20"
    >
      <div className="grid w-full grid-cols-2 items-center px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5 md:grid-cols-3 lg:px-8 xl:px-10">
        <MotionLink
          variants={chromeRise(REVEAL.nav)}
          href="/"
          aria-label={dict.nav.homeLinkAriaLabel}

          /* Desde lg la marca arranca en el mismo --hero-inset que usa el copy,
             y la columna derecha espeja la escala: los tres a la misma distancia. */
          className="ml-1 shrink-0 justify-self-start sm:ml-2 lg:ml-[var(--hero-inset)]"
        >

          <Image
            src="/logo.png"
            alt="Center Quest"
            width={692}
            height={512}
            preload
            /* Se pinta a 65-76px de ancho. Sin `sizes`, next/image emite un
               srcset 1x/2x sobre los 692 del original y un móvil se baja 1384px
               de logo para una marca de 76. */
            sizes="76px"
            className="h-12 w-auto brightness-0 invert sm:h-14"
          />
        </MotionLink>

        <motion.div
          variants={chromeRise(REVEAL.nav + REVEAL.navStep)}
          className="hidden justify-self-center md:flex"
        >
          <DesktopNav
            reduced={reduced}
            inverse
            links={heroNavLinks}
            onChildHover={onServiceHover}
          />
        </motion.div>

        <motion.div
          variants={chromeRise(REVEAL.nav + 2 * REVEAL.navStep)}
          className="mr-1 flex items-center justify-self-end gap-4 sm:mr-2 lg:mr-[var(--hero-inset)]"
        >

          <MotionLink
            ref={ctaRef}
            href="/quote"
            onMouseEnter={onMouseEnter}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={ctaStyle}
            whileHover={{ scale: 1.045 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="cq-rect-cta group/cta relative hidden items-center overflow-hidden bg-celeste px-6 py-3 text-ink shadow-[0_2px_10px_-4px_rgba(15,32,40,0.35)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_14px_28px_-8px_rgba(15,32,40,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste md:inline-flex"
          >
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-black/0 transition-[background-color] duration-500 ease-out group-hover/cta:bg-black/10" />
            <span className="relative z-10">{dict.hero.primaryCta}</span>
          </MotionLink>

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
        </motion.div>
      </div>

      <MobileSidebar
        id="hero-mobile-menu"
        open={open}
        reduced={reduced}
        onClose={() => setOpen(false)}
        links={heroNavLinks}
        ctaHref="/quote"
        ctaLabel={dict.hero.primaryCta}
        theme="dark"
      />
    </motion.div>
  );
}
