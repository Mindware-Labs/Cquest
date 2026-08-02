"use client";

import { useEffect, useRef, type CSSProperties } from "react";

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
      /* Nothing to solve against yet — the ResizeObserver below re-runs the
         sync as soon as the layer has real dimensions, so a zero-width mount
         heals itself instead of leaving all six nodes stacked at 0,0 with
         --nd: 0s (they would then flare in unison). */
      if (box.width === 0 || box.height === 0) return;
      /* Read once per sync, above the loop: this is a computed-style read
         and the node loop must stay a pure measure-then-write pass. */
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

    /* sync() forces layout (a rect, a computed style and window.innerWidth)
       and then writes six nodes, so it must run at most once per frame and
       never inside a commit. Same rAF-coalescing shape as useSectionSpy:
       events only ever queue a frame, the frame does the work.

       The initial run is deferred for the same reason — called inline it
       lands in the mount commit, which here is the middle of the
       AnimatePresence page turn, and forces a synchronous layout flush on
       exactly the frame that can least afford one. */
    let frame = 0;
    const queue = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    queue();
    window.addEventListener("resize", queue, { passive: true });
    /* A zero-width mount (the slide can be laid out before the stage has
       settled) leaves nothing to solve against; the observer re-solves the
       moment the layer has real dimensions, and covers container-driven
       resizes the window event never sees. */
    const observer = new ResizeObserver(queue);
    observer.observe(layer);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", queue);
      observer.disconnect();
    };
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
        className="cq-v2-orb cq-v2-orb--sys-a left-[-11rem] top-[26%] h-[32rem] w-[32rem]"
        style={{ "--orb": "color-mix(in srgb, var(--svc) 26%, transparent)" } as CSSProperties}
      />
      <span
        className="cq-v2-orb cq-v2-orb--sys-b right-[-12rem] bottom-[-11rem] h-[34rem] w-[34rem]"
        style={{ "--orb": "color-mix(in srgb, var(--svc-glow) 22%, transparent)" } as CSSProperties}
      />
    </div>
  );
}
