"use client";

import { useEffect, useId, useState, type CSSProperties, type RefObject } from "react";
import styles from "./AnimatedBeam.module.css";

/* ── Beam layer ───────────────────────────────────────────
   This started life as a port of Magic UI's <AnimatedBeam> — one component
   per beam, each animating a `linearGradient`'s x1/x2 forever so a lit
   segment travelled the path. That behaviour is gone. Five gradients each
   repainting a filtered stroke on every frame, for the entire time the
   section sits in the viewport, is a lot of continuous paint work to buy
   restlessness; and restlessness is the opposite of what this diagram is
   trying to say. The connections are permanent, so they should look drawn,
   not perpetually in transit.

   What replaced it: ONE svg for the whole hub-and-spokes figure, drawn once
   on entry by a GSAP timeline that lives in SectorsBeam, and then still.
   Consolidating the five components into one also collapses five
   ResizeObservers and five measurement passes into one, so every spoke is
   measured against the same layout snapshot — previously each beam measured
   independently and could disagree by a frame mid-reflow.

   Direction matters here. Each segment is authored FROM THE HUB OUTWARD,
   not from the node inward, because the sequence tells the story of a core
   coming online and reaching its industries: the line has to grow out of the
   hub, and the travelling light has to leave from it. The finished figure is
   symmetric, so the resting state reads as convergence either way — only the
   build has a direction.

   Two paths per spoke:
     • `data-spoke` — the connection itself. Its dash pattern is its own
       measured length, so a `stroke-dashoffset` of that length hides it
       exactly and an offset of 0 is the fully drawn resting state.
     • `data-light` — the energy pulse. A short dash on an otherwise empty
       pattern, parked out of view at rest, moved along the path by animating
       the same offset. This is why the project does not need MotionPathPlugin
       (which is not registered in src/lib/gsap.ts): a dash travelling a
       straight line is the same picture for a fraction of the work.

   `stroke-dashoffset` is the one property here that is not compositable.
   That is a deliberate, bounded exception: it is the only honest way to draw
   a line, it runs once on entry (plus a ~500ms pulse on hover), and the layer
   never repaints again at rest.

   Endpoints are read from `offsetLeft` / `offsetTop` / `offsetWidth`, NOT
   from getBoundingClientRect. That is load-bearing, not a style preference:
   the entry timeline puts a `scale` on the hub and on every node before this
   layer measures (a layout effect runs ahead of a passive one), and
   getBoundingClientRect reports the transformed box. Measuring it produced
   spokes computed against elements shrunk to 82% — stubs that never reached
   their nodes. `offset*` is layout, so it is blind to transforms, and since
   the nodes centre themselves with the `translate` property their offset
   position IS their visual centre.

   Because the paths are measured, not hard-coded, they survive responsive
   reflow: the ResizeObserver below re-measures on any layout change, which
   is what keeps the spokes attached to their nodes when the ring changes
   radius at the mobile breakpoint. */

interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;
  /** The element every spoke radiates from. */
  hubRef: RefObject<HTMLElement | null>;
  /** One ref per sector node, in ring order. */
  spokeRefs: readonly RefObject<HTMLElement | null>[];
  /** Index of the hovered sector, or null when nothing is hovered. */
  activeIndex: number | null;
  /**
   * Fired once the paths carry real geometry. SectorsBeam cannot build its
   * timeline before this: a tween against a zero-length path would resolve to
   * a no-op and the spokes would simply be there instead of drawing.
   */
  onMeasure?: () => void;
}

interface Segment {
  d: string;
  /** Straight-line length in px — the dash pattern the draw animates. */
  length: number;
}

/**
 * Distance from a rectangle's centre to its edge along the unit vector
 * (ux, uy). Exact for a rectangle, which is what the nodes are; the small
 * error at the rounded corners is under a pixel at these radii.
 */
function edgeDistance(halfWidth: number, halfHeight: number, ux: number, uy: number) {
  const byWidth = Math.abs(ux) < 1e-6 ? Infinity : halfWidth / Math.abs(ux);
  const byHeight = Math.abs(uy) < 1e-6 ? Infinity : halfHeight / Math.abs(uy);
  return Math.min(byWidth, byHeight);
}

export default function AnimatedBeam({
  containerRef,
  hubRef,
  spokeRefs,
  activeIndex,
  onMeasure,
}: AnimatedBeamProps) {
  // useId keeps the paint ids addressable per instance — SVG paint references
  // are document-global, so a hard-coded id would collide if the figure were
  // ever rendered twice on one page.
  const id = useId();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const hub = hubRef.current;
    if (!container || !hub) return;

    const measure = () => {
      setBox({ width: container.offsetWidth, height: container.offsetHeight });

      // The hub is a circle, so one radius covers every approach angle. The
      // extra 2px keeps the stroke's round cap off the hub's edge instead of
      // tucked under it.
      const hubRadius = hub.offsetWidth / 2 + 2;
      const hubX = hub.offsetLeft;
      const hubY = hub.offsetTop;

      const next: Segment[] = [];
      for (const spokeRef of spokeRefs) {
        const node = spokeRef.current;
        if (!node) continue;

        const nodeX = node.offsetLeft;
        const nodeY = node.offsetTop;

        // Unit vector pointing hub → node, i.e. the direction the line is
        // built in and the direction the pulse travels.
        const dx = nodeX - hubX;
        const dy = nodeY - hubY;
        const distance = Math.hypot(dx, dy);
        if (distance === 0) continue;

        const ux = dx / distance;
        const uy = dy / distance;
        const trimEnd = edgeDistance(node.offsetWidth / 2, node.offsetHeight / 2, ux, uy) + 2;

        // A spoke shorter than its own trim would invert; clamp it away
        // rather than drawing a backwards line during a mid-reflow frame.
        const length = Math.max(distance - hubRadius - trimEnd, 0);
        const startX = hubX + ux * hubRadius;
        const startY = hubY + uy * hubRadius;

        next.push({
          d: `M ${startX},${startY} L ${startX + ux * length},${startY + uy * length}`,
          length,
        });
      }

      setSegments(next);
      onMeasure?.();
    };

    /* Every endpoint is observed, not just the container. Observing the
       container alone looks sufficient and is not: the stage is sized by
       `aspect-ratio` and `max-width`, and the nodes are absolutely
       positioned, so a node that reflows — a web font landing and changing a
       label's width is the ordinary case — cannot change the container's box
       and would never trigger a re-measure. The paths would stay attached to
       geometry that no longer exists. */
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(hub);
    for (const spokeRef of spokeRefs) {
      if (spokeRef.current) observer.observe(spokeRef.current);
    }
    measure();

    return () => observer.disconnect();
  }, [containerRef, hubRef, spokeRefs, onMeasure]);

  return (
    <svg
      aria-hidden
      fill="none"
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      className={styles.beamSvg}
      data-dimmed={activeIndex === null ? undefined : ""}
    >
      {segments.map((segment, index) => (
        <g key={`${id}-${index}`}>
          <path
            d={segment.d}
            className={styles.spoke}
            strokeLinecap="round"
            data-spoke=""
            data-index={index}
            data-active={activeIndex === index ? "" : undefined}
            // Held as a custom property rather than a literal so the resting
            // dash pattern and any offset GSAP writes are the same measured
            // number — a mismatch would leave a visible gap in the line.
            style={{ "--spoke-length": `${segment.length}px` } as CSSProperties}
          />
          {/* Parked out of view at rest (zero opacity, dash sitting before the
              path start). Only the entry timeline and the hover pulse ever
              move it, and both hand it back in this state. */}
          <path
            d={segment.d}
            className={styles.spokeLight}
            strokeLinecap="round"
            data-light=""
            data-index={index}
            style={{ "--spoke-length": `${segment.length}px` } as CSSProperties}
          />
        </g>
      ))}
    </svg>
  );
}
