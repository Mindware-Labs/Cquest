import { motion } from "motion/react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";

const MotionLink = motion.create(LocalizedLink);

export default function HeroActions() {
  const { dict } = useI18n();
  const {
    ref,
    style,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.2, 3);

  return (
    <div className="flex items-center">
      <MotionLink
        ref={ref}
        href="/quote"
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={style}
        whileHover={{ scale: 1.035 }}
        /* Asymmetric press. The press-in is a short, flat tween so the button
           acknowledges the finger on the frame it lands; the release falls
           back to the spring below, which carries a little weight. Matching
           the two would make the control feel rubbery instead of physical. */
        whileTap={{ scale: 0.965, transition: { duration: 0.09, ease: "easeOut" } }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="cq-rect-cta group relative inline-flex touch-manipulation items-center gap-3 overflow-hidden bg-celeste py-3 pl-6 pr-[1.375rem] text-foreground shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--brand-celeste)_40%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_20px_40px_-10px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
      >
        {/* Wipe — the slowest layer, so it reads as the surface changing
            underneath rather than as part of the label's own motion. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
        />

        {/* Specular sweep, one pass across the face on hover. Transform-only,
            so it costs a composite and nothing else. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[300%]"
        />

        {/* Label roll: the resting word leaves upward while its double arrives
            from below. Faster than the wipe, so the type leads the surface. */}
        <span className="relative z-10 inline-grid overflow-hidden">
          <span className="col-start-1 row-start-1 transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[115%]">
            {dict.hero.primaryCta}
          </span>
          <span
            aria-hidden
            className="col-start-1 row-start-1 translate-y-[115%] transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
          >
            {dict.hero.primaryCta}
          </span>
        </span>

        <span className="relative z-10 flex h-4 w-4 items-center justify-center text-foreground transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
          <Chevron />
        </span>
      </MotionLink>
    </div>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-px"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}
