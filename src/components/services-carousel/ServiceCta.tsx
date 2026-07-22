"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMagnetic } from "@/hooks/useMagnetic";
import type { Service } from "@/components/services/data";

/* Next's Link with motion capabilities, so the CTA can share the hero's
   magnetic pointer-follow and spring press states. */
const MotionLink = motion.create(Link);

/* The hero's primary-CTA language on the slide's action: rectangular 2px
   radius, celeste field, white wipe on hover, chevron nudge, magnetic
   pointer-follow with critically-damped springs. */
export default function ServiceCta({ service }: { service: Service }) {
  const { ref, style, onMouseEnter, onMouseMove, onMouseLeave } =
    useMagnetic<HTMLAnchorElement>(0.2, 3);

  return (
    <MotionLink
      ref={ref}
      href={service.href}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="cq-rect-cta group relative mt-9 inline-flex touch-manipulation items-center gap-3 overflow-hidden bg-celeste py-3 pl-6 pr-[1.375rem] text-foreground shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--brand-celeste)_40%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_20px_40px_-10px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
      />
      <span className="relative z-10">Explore {service.label}</span>
      <span className="relative z-10 flex h-4 w-4 items-center justify-center text-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
        <Chevron />
      </span>
    </MotionLink>
  );
}

/* Same glyph the hero's CTAs use. */
function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-px"
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
