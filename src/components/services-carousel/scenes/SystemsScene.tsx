"use client";

import { useEffect, useRef } from "react";

/* Mirror of the scan beam's CSS geometry (globals.css .cq-v2-scan): one
   pass per SCAN_PERIOD, starting at -24rem, travelling to 100vw + 8rem,
   with the bright line sitting at 55% of the beam's 20rem width. */
const SCAN_PERIOD = 13;
const SCAN_START_REM = -24;
const SCAN_OVERSHOOT_REM = 8;
const SCAN_BRIGHT_LINE_REM = 0.55 * 20;
/* The blueprint grid's cell size (matches .cq-v2-grid background-size). */
const GRID_CELL_REM = 3.4;

/* Systems' indexing field. Like the radar→ping sync on Call Center, the
   effect below does two live measurements per node: it SNAPS the node onto
   the nearest true grid intersection (the grid is centre-anchored, so
   lines sit at centre ± half a cell ± k cells), then — because the beam
   moves linearly — solves for the moment the bright line crosses that
   snapped x and phase-shifts the node's 13s flare to land exactly there.
   data-x/data-y hold the layout intent in %, so resizes re-solve cleanly. */
export default function SystemsScene() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const sync = () => {
      const box = layer.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const rem =
        Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const cell = GRID_CELL_REM * rem;
      const halfCell = cell / 2;
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      const beamBrightStart = (SCAN_START_REM + SCAN_BRIGHT_LINE_REM) * rem;
      /* The CSS keyframe travels to 100vw + 8rem: 100vw is the FULL
         viewport (scrollbar included) = window.innerWidth, not the layer's
         clientWidth — using the latter would drift the sync by the
         scrollbar's width. */
      const beamTravel =
        window.innerWidth + (SCAN_OVERSHOOT_REM - SCAN_START_REM) * rem;

      layer.querySelectorAll<HTMLElement>(".cq-v2-node").forEach((node) => {
        const targetX = (Number.parseFloat(node.dataset.x ?? "50") / 100) * box.width;
        const targetY = (Number.parseFloat(node.dataset.y ?? "50") / 100) * box.height;
        const gridBaseX = centerX - halfCell;
        const gridBaseY = centerY - halfCell;
        const x = gridBaseX + Math.round((targetX - gridBaseX) / cell) * cell;
        const y = gridBaseY + Math.round((targetY - gridBaseY) / cell) * cell;
        node.style.left = `${x.toFixed(1)}px`;
        node.style.top = `${y.toFixed(1)}px`;
        const crossing = (SCAN_PERIOD * (x - beamBrightStart)) / beamTravel;
        node.style.setProperty("--nd", `${(crossing - SCAN_PERIOD).toFixed(2)}s`);
      });
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return (
    <div ref={layerRef} className="absolute inset-0">
      {/* Blueprint grid framing the field; its mask keeps the reading
          column clear. */}
      <div className="cq-v2-grid" />
      {/* The indexing beam (linear, so the node sync can predict it). */}
      <span className="cq-v2-scan" />
      {/* Grid nodes in the safe margins — snapped onto intersections and
          flaring exactly as the beam's bright line reaches them. */}
      <span className="cq-v2-node" data-x="12" data-y="22" />
      <span className="cq-v2-node" data-x="22" data-y="80" />
      <span className="cq-v2-node" data-x="38" data-y="12" />
      <span className="cq-v2-node" data-x="66" data-y="88" />
      <span className="cq-v2-node" data-x="84" data-y="18" />
      <span className="cq-v2-node" data-x="90" data-y="66" />
      <span
        className="cq-v2-orb left-[-9rem] top-[30%] h-[28rem] w-[28rem]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--svc) 26%, transparent)",
          animation: "cq-float-b 24s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        }}
      />
      <span
        className="cq-v2-orb right-[-10rem] bottom-[-9rem] h-[30rem] w-[30rem]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--svc-glow) 22%, transparent)",
          animation: "cq-float-c 27s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse",
        }}
      />
    </div>
  );
}
