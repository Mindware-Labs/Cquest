"use client";

import { motion } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";
import styles from "./TeamConstellation.module.css";

/* ── The home band's team figure ─────────────────────────────────────────
   Deliberately a MINIATURE ORG CHART rather than a decorative constellation:
   root, stem, bus, drops, five people. It is the same diagram the /team page
   opens with, at a glance — so the link below it is not a leap of faith, and
   arriving on that page feels like the figure resolving rather than a new
   idea being introduced.

   No photographs exist yet (see MEMORY: seccion-equipo), and the honest way
   to show a team you cannot show is a row of empty frames, not a row of stock
   faces. The silhouettes are the shape those portraits will occupy.

   One SVG, one coordinate space. The connectors and the nodes have to agree
   exactly — a drop that misses its avatar by two pixels is the whole
   difference between a drawn diagram and clip-art — and inside a single
   viewBox that agreement is arithmetic instead of CSS luck. */

const R_ROOT = 26;
const R_NODE = 25;
const NODE_Y = 152;
const BUS_Y = 96;
/* Five evenly spaced centres across the 420-wide box. The bus terminates on
   the outer two rather than running past them, same rule the /team chart's
   half-column inset enforces. */
const NODE_X = [50, 130, 210, 290, 370] as const;

/* Head and shoulders in a 64-box, shared with the /team page's roster cards
   so the two placeholders are visibly the same object at two sizes. */
function SilhouetteBody() {
  return (
    <>
      <circle cx="32" cy="25" r="11.5" />
      <path d="M32 40c-11.6 0-21 7.6-21 17v3h42v-3c0-9.4-9.4-17-21-17Z" />
    </>
  );
}

/* The 64-box is mapped onto a circle of radius `r` at (cx, cy). The clip lives
   on an INNER group so it is unambiguously evaluated in the 64-box's own
   coordinates — applying it to the same element that carries the transform
   leaves it up to the renderer whether the clip is measured before or after
   that transform, and the shoulders spill out the bottom when it guesses. */
function Avatar({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx - r} ${cy - r}) scale(${r / 32})`}>
      <g clipPath="url(#cqTeamAvatarClip)">
        <SilhouetteBody />
      </g>
    </g>
  );
}

export default function TeamConstellation({ reduced }: { reduced: boolean }) {
  const draw = (delay: number) => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.7, ease: EASE_OUT, delay },
        opacity: { duration: 0.2, delay },
      },
    },
  });

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 420 200"
      className={styles.figure}
      fill="none"
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={{ once: true, margin: "-100px" }}
    >
      <defs>
        <clipPath id="cqTeamAvatarClip">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <radialGradient id="cqTeamStageGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ab-celeste)" stopOpacity="0.13" />
          <stop offset="58%" stopColor="var(--ab-celeste)" stopOpacity="0.035" />
          <stop offset="100%" stopColor="var(--ab-celeste)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cqTeamRootFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--ab-celeste)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--ab-celeste)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="cqTeamNodeFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.085" />
          <stop offset="100%" stopColor="white" stopOpacity="0.025" />
        </linearGradient>
      </defs>

      <ellipse cx="210" cy="112" rx="205" ry="108" className={styles.stageGlow} />

      {/* ── Connectors ─────────────────────────────────────────────────
          Drawn in the order a hand would: down from the root, out along the
          bus, then down into each person. */}
      <g className={styles.rule} strokeWidth="1" strokeLinecap="round">
        <motion.line x1={210} y1={R_ROOT + 40} x2={210} y2={BUS_Y} variants={draw(0.1)} />
        <motion.line
          x1={NODE_X[0]}
          y1={BUS_Y}
          x2={NODE_X[NODE_X.length - 1]}
          y2={BUS_Y}
          variants={draw(0.42)}
        />
        {NODE_X.map((x, index) => (
          <motion.line
            key={x}
            x1={x}
            y1={BUS_Y}
            x2={x}
            y2={NODE_Y - R_NODE}
            variants={draw(0.8 + index * 0.07)}
          />
        ))}
      </g>

      {!reduced && (
        <g className={styles.signal} strokeLinecap="round">
          <line x1={210} y1={R_ROOT + 40} x2={210} y2={BUS_Y} className={styles.signalStem} pathLength={1} />
          <line
            x1={NODE_X[0]}
            y1={BUS_Y}
            x2={NODE_X[NODE_X.length - 1]}
            y2={BUS_Y}
            className={styles.signalBus}
            pathLength={1}
          />
          {NODE_X.map((x, index) => (
            <line
              key={`signal-${x}`}
              x1={x}
              y1={BUS_Y}
              x2={x}
              y2={NODE_Y - R_NODE}
              pathLength={1}
              style={{ animationDelay: `${1.02 + index * 0.1}s` }}
            />
          ))}
        </g>
      )}

      <g className={styles.junctions}>
        {NODE_X.map((x) => <circle key={`junction-${x}`} cx={x} cy={BUS_Y} r="1.6" />)}
      </g>

      {/* ── The root ───────────────────────────────────────────────── */}
      <motion.g
        variants={{
          hidden: { opacity: 0, scale: 0.6 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } },
        }}
        style={{ transformOrigin: `210px 40px` }}
      >
        <circle cx={210} cy={40} r={R_ROOT + 9} className={styles.rootHalo} />
        <circle cx={210} cy={40} r={R_ROOT} className={styles.rootDisc} />
        <circle cx={210} cy={40} r={R_ROOT - 3.5} className={styles.rootRim} />
        <g className={styles.rootFigure}>
          <Avatar cx={210} cy={40} r={R_ROOT} />
        </g>
        {!reduced && (
          <circle
            cx={210}
            cy={40}
            r={R_ROOT + 3}
            className={styles.rootPulse}
            style={{ transformOrigin: "210px 40px" }}
          />
        )}
      </motion.g>

      {/* ── The people ─────────────────────────────────────────────────
          The ring is a separate element from the disc so the ambient pulse
          can scale it without touching the filled frame underneath. */}
      {NODE_X.map((x, index) => (
        <motion.g
          key={x}
          variants={{
            hidden: { opacity: 0, scale: 0.55 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.5, ease: EASE_OUT, delay: 1.05 + index * 0.08 },
            },
          }}
          style={{ transformOrigin: `${x}px ${NODE_Y}px` }}
        >
          <circle cx={x} cy={NODE_Y} r={R_NODE + 6} className={styles.nodeHalo} />
          <circle cx={x} cy={NODE_Y} r={R_NODE} className={styles.nodeDisc} />
          <circle cx={x} cy={NODE_Y} r={R_NODE - 3.5} className={styles.nodeRim} />
          <g className={styles.nodeFigure}>
            <Avatar cx={x} cy={NODE_Y} r={R_NODE} />
          </g>
          {!reduced && (
            <circle
              cx={x}
              cy={NODE_Y}
              r={R_NODE + 1}
              className={styles.pulse}
              style={{ animationDelay: `${1.34 + index * 0.1}s`, transformOrigin: `${x}px ${NODE_Y}px` }}
            />
          )}
        </motion.g>
      ))}
    </motion.svg>
  );
}
