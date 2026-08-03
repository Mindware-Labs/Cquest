"use client";

import { motion } from "motion/react";
import { NEEDLE_WOBBLE_TRANSITION, needleVariants, PING_TRANSITION, ringVariants, tickVariants } from "./animation";

// 12 minor ticks + 4 cardinal ticks, evenly spaced — generated rather than
// hand-listed so the count can't drift out of sync with 360/n.
const MINOR_TICKS = Array.from({ length: 12 }, (_, i) => i * 30).filter((deg) => deg % 90 !== 0);
const CARDINAL_TICKS = [0, 90, 180, 270];

function tickLine(deg: number, outer: number, inner: number) {
  const rad = (deg * Math.PI) / 180;
  // 0deg = North = straight up, matching a real compass face.
  const x1 = 100 + outer * Math.sin(rad);
  const y1 = 100 - outer * Math.cos(rad);
  const x2 = 100 + inner * Math.sin(rad);
  const y2 = 100 - inner * Math.cos(rad);
  return { x1, y1, x2, y2 };
}

/**
 * The 404 scene's centerpiece: a compass that never finds North. Built in
 * the same monoline vocabulary as ServiceIcon (stroke-only, round caps,
 * currentColor) but at illustration scale rather than icon scale.
 *
 * `ambient` gates the two loops that would otherwise run forever off-screen
 * or with a hidden tab — the needle's drift and the radar ping — mirroring
 * the pause contract HeroImage and ServicesCarousel already use.
 */
export default function CompassMark({ reduced, ambient }: { reduced: boolean; ambient: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className="h-40 w-40 sm:h-48 sm:w-48"
      fill="none"
    >
      {/* Two radar pings, offset in phase, breathing outward from center and
          fading — a search that keeps sweeping and keeps coming up empty. */}
      {!reduced && ambient && (
        <>
          <motion.circle
            cx="100"
            cy="100"
            r="30"
            stroke="var(--brand-celeste)"
            strokeWidth="1.2"
            initial={{ scale: 0.55, opacity: 0.5 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={PING_TRANSITION}
            style={{ transformOrigin: "100px 100px" }}
          />
          <motion.circle
            cx="100"
            cy="100"
            r="30"
            stroke="var(--brand-celeste)"
            strokeWidth="1.2"
            initial={{ scale: 0.55, opacity: 0.5 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ ...PING_TRANSITION, delay: 1.3 }}
            style={{ transformOrigin: "100px 100px" }}
          />
        </>
      )}

      <motion.circle
        cx="100"
        cy="100"
        r="72"
        stroke="var(--brand-petroleo)"
        strokeWidth="1.6"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={ringVariants}
      />

      <motion.g
        stroke="var(--brand-petroleo)"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={tickVariants}
      >
        {CARDINAL_TICKS.map((deg) => {
          const { x1, y1, x2, y2 } = tickLine(deg, 72, 60);
          return <motion.line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} variants={tickVariants} />;
        })}
      </motion.g>
      <motion.g
        stroke="var(--brand-petroleo)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={tickVariants}
      >
        {MINOR_TICKS.map((deg) => {
          const { x1, y1, x2, y2 } = tickLine(deg, 72, 65);
          return <motion.line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} variants={tickVariants} />;
        })}
      </motion.g>

      {/* Needle — a two-tone kite, pivoting from the exact center. The outer
          group commits to a heading with a real spring; the inner group then
          keeps softly hunting for North on top of that, never fully at rest. */}
      <motion.g
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={needleVariants}
        style={{ transformOrigin: "100px 100px" }}
      >
        <motion.g
          animate={ambient ? { rotate: [0, -4, 4, 0] } : { rotate: 0 }}
          transition={NEEDLE_WOBBLE_TRANSITION}
          style={{ transformOrigin: "100px 100px" }}
        >
          <path d="M100 40 112 100 100 108 88 100Z" fill="var(--brand-petroleo)" />
          <path d="M100 160 112 100 100 92 88 100Z" fill="var(--brand-celeste)" />
        </motion.g>
      </motion.g>

      <circle cx="100" cy="100" r="5" fill="var(--background)" stroke="var(--brand-petroleo)" strokeWidth="1.6" />
    </svg>
  );
}
