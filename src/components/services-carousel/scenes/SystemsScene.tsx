"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cancelFrame, frame } from "motion/react";

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

    /* Last box the six nodes were actually solved against. The ResizeObserver
       below always fires once on observe() even though `queue()` just
       measured the same layer moments earlier (its guaranteed-initial-
       notification behaviour, not a real size change) — comparing against
       this skips that redundant second pass instead of re-running the full
       read+write twice on every single mount. */
    const lastSize = { width: 0, height: 0 };

    /* The read half: one rect, one computed-style read and window.innerWidth,
       then pure arithmetic — no DOM writes here, so this is safe to run in
       Motion's `read` step without forcing a layout the write half could
       otherwise trip over. Returns the per-node targets to apply, or null if
       there's nothing new to solve. */
    const doMeasure = () => {
      const box = layer.getBoundingClientRect();
      /* Nothing to solve against yet — the ResizeObserver re-runs this as
         soon as the layer has real dimensions, so a zero-width mount heals
         itself instead of leaving all six nodes stacked at 0,0 with
         --nd: 0s (they would then flare in unison — see the CSS gate below). */
      if (box.width === 0 || box.height === 0) return null;
      if (box.width === lastSize.width && box.height === lastSize.height) return null;
      lastSize.width = box.width;
      lastSize.height = box.height;

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

      return Array.from(layer.querySelectorAll<HTMLElement>(".cq-v2-node")).map((node) => {
        const targetX = (Number.parseFloat(node.dataset.x ?? "50") / 100) * box.width;
        const targetY = (Number.parseFloat(node.dataset.y ?? "50") / 100) * box.height;
        const gridBaseX = centerX - halfCell;
        const gridBaseY = centerY - halfCell;
        const x = gridBaseX + Math.round((targetX - gridBaseX) / cell) * cell;
        const y = gridBaseY + Math.round((targetY - gridBaseY) / cell) * cell;
        const crossing = (SCAN_PERIOD * (x - beamBrightStart)) / beamTravel;
        return { node, x, y, nd: crossing - SCAN_PERIOD };
      });
    };

    /* `measure` is the exact function reference handed to `frame.read` below
       — Motion coalesces repeat calls to the same reference within a step
       (no manual "already queued" guard needed) and `cancelFrame` on
       unmount cancels precisely this, not some other closure wrapping it. */
    const measure = () => {
      const updates = doMeasure();
      if (!updates) return;
      frame.render(() => {
        for (const { node, x, y, nd } of updates) {
          node.style.left = `${x.toFixed(1)}px`;
          node.style.top = `${y.toFixed(1)}px`;
          node.style.setProperty("--nd", `${nd.toFixed(2)}s`);
        }
        /* Nodes stay paused and transparent (carousel.css) until this fires
           once — see the comment on the wrapper below. Deliberately a plain
           DOM write, not React state: flipping this doesn't need a
           re-render any more than the six style writes above do. */
        layer.dataset.synced = "true";
      });
    };

    /* Read in Motion's `read` step, write in its `render` step — the same
       batching fieldY/stageY/bandFill ride in ServicesCarousel, so this
       component's forced layout is ordered against every other Motion-driven
       read/write on the page by construction instead of by raw
       requestAnimationFrame registration luck. */
    const queue = () => frame.read(measure);

    queue();
    window.addEventListener("resize", queue, { passive: true });
    /* A zero-width mount (the slide can be laid out before the stage has
       settled) leaves nothing to solve against; the observer re-solves the
       moment the layer has real dimensions, and covers container-driven
       resizes the window event never sees. */
    const observer = new ResizeObserver(queue);
    observer.observe(layer);

    return () => {
      cancelFrame(measure);
      window.removeEventListener("resize", queue);
      observer.disconnect();
    };
  }, []);

  return (
    /* `data-synced="false"` from first paint holds the six nodes paused and
       invisible (carousel.css) until `measure`'s write phase flips it — the
       CSS keyframe would otherwise start advancing (and flare, at its 4%
       mark) against the unset defaults (stacked at 0,0, --nd: 0s) the moment
       this scene mounts, well before its position/phase has been solved. */
    <div ref={layerRef} data-synced="false" className="cq-v2-systems absolute inset-0">
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
