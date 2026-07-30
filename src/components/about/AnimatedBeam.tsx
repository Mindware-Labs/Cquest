"use client";

import { motion } from "motion/react";
import { useEffect, useId, useState, type RefObject } from "react";
import styles from "./AnimatedBeam.module.css";

/* ── Animated beam ────────────────────────────────────────
   A Magic UI component (magicui.design/docs/components/animated-beam) ported
   to this codebase rather than installed: the upstream version ships as a
   shadcn registry item that assumes Tailwind utility classes and a `cn`
   helper, neither of which this project uses. The geometry and the travelling
   gradient are the same idea; the surface is ours (CSS Modules + About's
   `--ab-*` tokens), so a beam sits in the same material as the mission card
   beside it.

   How it works: the SVG is an absolutely-positioned overlay sized to
   `containerRef`. Each beam measures the two endpoint elements against the
   container's own box, draws one quadratic curve between their centres, and
   animates a `linearGradient`'s x1/x2 so a lit segment travels the path —
   the stroke itself never changes, only where the gradient is sampled.

   Because the path is measured, not hard-coded, it survives responsive
   reflow: a ResizeObserver on the container re-measures on any layout change,
   which is what keeps the beams attached when the diagram stacks on mobile. */

interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  /** Bow of the curve in px — positive arcs the path upward. */
  curvature?: number;
  /** Travel the gradient from `to` back to `from`. */
  reverse?: boolean;
  /** Seconds for one full traversal. */
  duration?: number;
  /** Seconds before the first traversal, for staggering a set of beams. */
  delay?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  /** When true the resting path is drawn but nothing travels along it. */
  reduced?: boolean;
}

export default function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  reduced = false,
}: AnimatedBeamProps) {
  // useId keeps every beam's <linearGradient> uniquely addressable — SVG
  // paint references are document-global, so a shared id would make every
  // beam on the page share one gradient's animation.
  const id = useId();
  const [path, setPath] = useState("");
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!container || !from || !to) return;

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();

      setBox({ width: containerRect.width, height: containerRect.height });

      // Endpoint centres expressed in the container's own coordinate space,
      // which is also the SVG's viewBox — so no scaling maths is needed.
      const startX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
      const startY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
      const endX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
      const endY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      const controlX = (startX + endX) / 2;
      const controlY = (startY + endY) / 2 - curvature;

      setPath(`M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`);
    };

    // Observing the container alone is enough: the endpoints live inside it,
    // so anything that moves them also changes the container's content box.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    measure();

    return () => observer.disconnect();
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  // The lit segment is the middle three stops; it enters from off-path on one
  // side and exits off-path on the other, so the beam appears and disappears
  // rather than popping at the endpoints.
  const gradientCoordinates = reverse
    ? { x1: ["90%", "-10%"], x2: ["100%", "0%"] }
    : { x1: ["10%", "110%"], x2: ["0%", "100%"] };

  return (
    <svg
      aria-hidden
      fill="none"
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      className={styles.beamSvg}
    >
      {/* Resting path: the connection is always legible, lit or not — which
          is also the entire visual under reduced motion. */}
      <path d={path} stroke="var(--ab-rule)" strokeWidth={1.5} strokeLinecap="round" />
      {!reduced && (
        <>
          <path d={path} stroke={`url(#${id})`} strokeWidth={1.5} strokeLinecap="round" className={styles.beamGlow} />
          <defs>
            <motion.linearGradient
              id={id}
              gradientUnits="userSpaceOnUse"
              initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
              animate={{
                x1: gradientCoordinates.x1,
                x2: gradientCoordinates.x2,
                y1: ["0%", "0%"],
                y2: ["0%", "0%"],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                repeatDelay: 0,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Transparent → celeste → petroleo → transparent: the beam
                  cools as it travels, arriving in the hub's own colour. */}
              <stop stopColor="var(--ab-celeste)" stopOpacity="0" />
              <stop stopColor="var(--ab-celeste)" />
              <stop offset="32.5%" stopColor="var(--ab-petroleo)" />
              <stop offset="100%" stopColor="var(--ab-petroleo)" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </>
      )}
    </svg>
  );
}
