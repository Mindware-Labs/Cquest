import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import DesktopNav from "@/components/navigation/DesktopNav";
import MobileSidebar from "@/components/navigation/MobileSidebar";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { EASE_IN_EXPO, EASE_OUT, REVEAL, getHeroNavLinks } from "./animation";

const MotionLink = motion.create(LocalizedLink);

export default function HeroNav({
  reduced,
  revealed,
  onServiceHover,
}: {
  reduced: boolean;
  /** False during act one, while the mascot has the stage to itself. */
  revealed: boolean;
  /** Forwarded straight to DesktopNav's `onChildHover` — see there and
   *  SERVICE_QUESTION_INDEX in ./animation for what it drives. */
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
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -14 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
      /* The retreat (a replay returning the hero to act one) is its own
         gesture: shorter and accelerating, not the entrance played back. */
      transition={
        revealed
          ? { duration: 0.7, ease: EASE_OUT, delay: REVEAL.nav }
          : { duration: 0.35, ease: EASE_IN_EXPO }
      }
      /* Hidden means hidden: while it's invisible the chrome must also be
         untabbable and unclickable, or there's an invisible menu button
         sitting over the mascot waiting to be hit. */
      inert={!revealed}
      className="relative z-20"
    >
      <div className="grid w-full grid-cols-2 items-center px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5 md:grid-cols-3 lg:px-8 xl:px-10">
        <LocalizedLink
          href="/"
          aria-label={dict.nav.homeLinkAriaLabel}
          /* From lg the mark starts on the copy's left edge — same
             `--hero-inset` the composition's cell uses as padding, on top of
             the identical container padding this row and that plane both
             carry. The right-hand column below mirrors this exact scale
             (ml-1/sm:ml-2/lg:hero-inset ↔ mr-1/sm:mr-2/lg:hero-inset) so the
             mark, the copy and the CTA all sit the same distance from their
             own edge. The nudge below lg is the mobile row's own
             composition and has nothing to do with the copy, which is
             full-width and flush down there. */
          className="ml-1 shrink-0 justify-self-start sm:ml-2 lg:ml-[var(--hero-inset)]"
        >
          {/* The real mark, not the placeholder compass — always rendered
              white, the same brightness(0)/invert(1) pair Navbar and
              SiteFooter use on this exact PNG, since the hero stage under
              it is always dark. */}
          <Image
            src="/logo.png"
            alt="Center Quest"
            width={692}
            height={512}
            preload
            className="h-12 w-auto brightness-0 invert sm:h-14"
          />
        </LocalizedLink>

        <div className="hidden justify-self-center md:flex">
          <DesktopNav
            reduced={reduced}
            inverse
            links={heroNavLinks}
            onChildHover={onServiceHover}
          />
        </div>

        <div className="mr-1 flex items-center justify-self-end gap-4 sm:mr-2 lg:mr-[var(--hero-inset)]">
          {/* Desktop-only — the mobile sidebar below is passed the same
              label so the two stay in sync rather than drifting the way a
              default-vs-override pair eventually does. Styled to match
              Navbar's "inverse" contact pill exactly, hardcoded rather than
              threaded through a prop: unlike Navbar, this bar never scrolls
              onto a light background, so it never needs the other variant. */}
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
        </div>
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
