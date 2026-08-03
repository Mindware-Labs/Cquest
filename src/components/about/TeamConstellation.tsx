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
const ROOT_X = 210;
const ROOT_Y = 40;

/* ── The instrument marks ────────────────────────────────────────────────
   Everything below this line is drafting detail: graduation, terminals,
   bezel, datum. None of it carries information — that is the point. The
   chart's job is to say "there is a structure here and it is precisely
   drawn" at a glance, and precision is legible long before any of these
   marks are individually resolvable. They all sit at a fraction of the
   connectors' contrast, so at reading distance they are texture; at close
   range they are measurement.

   Deliberately NOT hierarchy. Unequal node sizes or a weighted branch would
   assert a department structure that does not exist yet (see the note in
   MetricsSection about what this band may and may not claim). Geometry is
   free to be exact; content is not free to be invented. */

/* Graduated rail — three marks in each span between two people, the middle
   one longer, the way a rule is subdivided. */
const BUS_TICKS = NODE_X.slice(0, -1).flatMap((x, span) =>
  [20, 40, 60].map((offset, index) => ({
    key: `${span}-${index}`,
    x: x + offset,
    long: index === 1,
  })),
);

/* A dial bezel in the annulus between the root's disc and its halo — seven
   marks at 45°, the eighth omitted where the stem leaves. Same radial-spoke
   language the hero's mascot is built from, at instrument scale. */
const ROOT_BEZEL = [0, 45, 135, 180, 225, 270, 315].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    deg,
    x1: ROOT_X + cos * 29,
    y1: ROOT_Y + sin * 29,
    x2: ROOT_X + cos * 33,
    y2: ROOT_Y + sin * 33,
  };
});

/* The datum. A drafted plate is grounded by a reference line, not by the
   edge of its own box — and this one does a second job: it is the first
   statement of the hairline-and-junction grammar that the ledger's risers
   answer further down the band. The chart ends on the same kind of line the
   numbers hang from. */
const DATUM_Y = 192;
const DATUM_FROM = 16;
const DATUM_TO = 404;

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

  /* The instrument marks do not draw — they are printed on the plate, so
     they arrive as a group once the line they graduate is already there.
     Drawing sixteen ticks individually would turn detail into an event. */
  const print = (delay: number) => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT, delay } },
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

      {/* Graduation on the bus, printed once the bus itself is drawn. */}
      <motion.g className={styles.tick} strokeLinecap="round" variants={print(0.78)}>
        {BUS_TICKS.map((tick) => (
          <line
            key={tick.key}
            x1={tick.x}
            y1={BUS_Y}
            x2={tick.x}
            y2={BUS_Y + (tick.long ? 4.5 : 2.4)}
            className={tick.long ? styles.tickLong : undefined}
          />
        ))}
      </motion.g>

      {/* Where each drop lands on its frame: a terminal cap, so the connector
          arrives at the portrait instead of stopping near it. */}
      <motion.g className={styles.terminal} strokeLinecap="round" variants={print(1.2)}>
        {NODE_X.map((x) => (
          <line key={`terminal-${x}`} x1={x - 4} y1={NODE_Y - R_NODE} x2={x + 4} y2={NODE_Y - R_NODE} />
        ))}
      </motion.g>

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
        <circle cx={ROOT_X} cy={ROOT_Y} r={R_ROOT + 9} className={styles.rootHalo} />
        <motion.g className={styles.bezel} strokeLinecap="round" variants={print(0.5)}>
          {ROOT_BEZEL.map((mark) => (
            <line key={mark.deg} x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} />
          ))}
        </motion.g>
        <circle cx={ROOT_X} cy={ROOT_Y} r={R_ROOT} className={styles.rootDisc} />
        <circle cx={ROOT_X} cy={ROOT_Y} r={R_ROOT - 3.5} className={styles.rootRim} />
        <g className={styles.rootFigure}>
          <Avatar cx={ROOT_X} cy={ROOT_Y} r={R_ROOT} />
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

      {/* ── The datum ──────────────────────────────────────────────────
          Draws last, left to right, under the whole row: the plate is
          grounded only once everything standing on it has arrived. Its end
          serifs and per-person index marks are the same junction-and-
          hairline grammar the ledger's risers pick up further down the band,
          which is what lets the eye read the numbers as the bottom tier of
          this same drawing rather than as a separate block. */}
      <motion.line
        x1={DATUM_FROM}
        y1={DATUM_Y}
        x2={DATUM_TO}
        y2={DATUM_Y}
        className={styles.datum}
        strokeLinecap="round"
        variants={draw(1.4)}
      />
      <motion.g className={styles.datumMark} strokeLinecap="round" variants={print(1.72)}>
        <line x1={DATUM_FROM} y1={DATUM_Y - 4} x2={DATUM_FROM} y2={DATUM_Y + 4} />
        <line x1={DATUM_TO} y1={DATUM_Y - 4} x2={DATUM_TO} y2={DATUM_Y + 4} />
        {NODE_X.map((x) => (
          <line
            key={`index-${x}`}
            x1={x}
            y1={DATUM_Y}
            x2={x}
            y2={DATUM_Y + (x === ROOT_X ? 5.5 : 3.5)}
          />
        ))}
      </motion.g>
    </motion.svg>
  );
}
