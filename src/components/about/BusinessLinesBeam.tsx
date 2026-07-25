"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import AnimatedBeam from "./AnimatedBeam";
import styles from "./BusinessLinesBeam.module.css";

/* ── The three lines, drawn ───────────────────────────────
   Story's body copy already claims that Call Center, BPO and Systems
   Development converge on one operation. Until now the reader had to take
   that on faith from a paragraph; this diagram is that same sentence as
   geometry — three sources, three beams, one hub.

   That is the whole reason this animation earns its place: it is not
   decorating the section, it is asserting the section's argument. If the
   copy ever stops being about convergence, this component should go with it.

   Beams are measured from the DOM (see AnimatedBeam), so the same markup
   carries the desktop layout (sources left, hub right) and the stacked
   mobile one (sources on top, hub below) with no second set of coordinates
   to keep in sync. */

const COPY = {
  en: {
    lines: [
      { label: "Call Center", note: "People" },
      { label: "BPO", note: "Process" },
      { label: "Systems", note: "Software" },
    ],
    hub: "Your operation",
    caption: "Three business lines, run as one operation.",
  },
  es: {
    lines: [
      { label: "Call Center", note: "Personas" },
      { label: "BPO", note: "Proceso" },
      { label: "Sistemas", note: "Software" },
    ],
    hub: "Tu operación",
    caption: "Tres líneas de negocio, gestionadas como una sola operación.",
  },
};

/* Icons are inline and single-stroke on purpose: at 22px an inline path costs
   nothing, needs no request, and inherits currentColor like type does. */
const ICON_PATHS = {
  callCenter:
    "M4 13v-1a8 8 0 0 1 16 0v1M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Zm16 0v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Zm-3 5v.5a2.5 2.5 0 0 1-2.5 2.5H12",
  bpo: "m12 3 9 5-9 5-9-5 9-5Zm9 9-9 5-9-5m18 4.5-9 5-9-5",
  systems: "m8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16",
} as const;

/* Each node takes its ref as a prop rather than being pulled out of an array
   of refs: react-hooks/refs rejects indexing a ref array in render, and
   threading one ref per node is also what keeps the three beams below
   explicitly paired with their source instead of positionally coupled. */
function LineNode({
  nodeRef,
  icon,
  label,
  note,
}: {
  nodeRef: React.RefObject<HTMLDivElement | null>;
  icon: string;
  label: string;
  note: string;
}) {
  return (
    <div className={styles.node} ref={nodeRef}>
      <span aria-hidden className={styles.nodeIcon}>
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={icon} />
        </svg>
      </span>
      <span className={styles.nodeText}>
        <strong>{label}</strong>
        <small>{note}</small>
      </span>
    </div>
  );
}

export default function BusinessLinesBeam({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const [callCenter, bpo, systems] = t.lines;

  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const callCenterRef = useRef<HTMLDivElement>(null);
  const bpoRef = useRef<HTMLDivElement>(null);
  const systemsRef = useRef<HTMLDivElement>(null);

  /* Outward bow: the top beam arcs up, the bottom beam arcs down, the middle
     one runs flat — so three converging paths read as a funnel rather than as
     three lines crossing each other.

     The delays are deliberately not even fractions of the 4s duration, so the
     three beams never settle into lockstep and re-fire as one pulse. */
  const beam = { containerRef, toRef: hubRef, duration: 4, reduced };

  return (
    <figure className={styles.beamFigure}>
      <div ref={containerRef} className={styles.beamStage}>
        <div className={styles.sources}>
          <LineNode nodeRef={callCenterRef} icon={ICON_PATHS.callCenter} {...callCenter} />
          <LineNode nodeRef={bpoRef} icon={ICON_PATHS.bpo} {...bpo} />
          <LineNode nodeRef={systemsRef} icon={ICON_PATHS.systems} {...systems} />
        </div>

        <div ref={hubRef} className={styles.hub}>
          <span className={styles.hubPulse} aria-hidden />
          <span className={styles.hubText}>{t.hub}</span>
        </div>

        <AnimatedBeam {...beam} fromRef={callCenterRef} curvature={46} delay={0} />
        <AnimatedBeam {...beam} fromRef={bpoRef} curvature={0} delay={0.9} />
        <AnimatedBeam {...beam} fromRef={systemsRef} curvature={-46} delay={1.7} />
      </div>
      {/* The caption is the accessible version of the diagram: the SVG layer
          is aria-hidden, so the relationship it draws has to be stated once
          in text for anyone who never sees a beam. */}
      <figcaption className={styles.beamCaption}>{t.caption}</figcaption>
    </figure>
  );
}
