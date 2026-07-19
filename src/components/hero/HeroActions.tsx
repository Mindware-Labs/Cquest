import { motion } from "motion/react";
import { useMagnetic } from "@/hooks/useMagnetic";

export default function HeroActions() {
  const {
    ref,
    style,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.2, 3);

  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
      <motion.a
        ref={ref}
        href="#contact"
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={style}
        whileHover={{ scale: 1.035 }}
        whileTap={{ scale: 0.965 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="group relative inline-flex touch-manipulation items-center gap-3 overflow-hidden rounded-full bg-celeste py-2 pl-6 pr-2 text-[0.9375rem] font-semibold text-foreground shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--brand-celeste)_40%,transparent)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_20px_40px_-10px_color-mix(in_srgb,var(--brand-celeste)_50%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
        <span className="relative z-10">Request a quote</span>
        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-celeste transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:shadow-[0_0_14px_color-mix(in_srgb,var(--brand-celeste)_45%,transparent)]">
          <Chevron />
        </span>
      </motion.a>

      <a
        href="#services"
        className="group/link relative touch-manipulation text-[0.9375rem] font-medium text-white/70 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
      >
        <span className="inline-flex items-center gap-1.5">
          See our services
          <span className="-translate-x-1 text-celeste opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:translate-x-0 group-hover/link:opacity-100">
            <Chevron />
          </span>
        </span>
        <span aria-hidden className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-celeste transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:scale-x-100" />
      </a>
    </div>
  );
}

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
