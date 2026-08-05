"use client";

import { useEffect, useRef } from "react";

/* ── The mark, assembled ─────────────────────────────────────────────────
   The CQ monogram drawn as a cloud of points that gather into it.

   Sampled from the real asset rather than re-authored as vector paths. A
   hand-drawn CQ would be a guess at proportions the brand already owns, it
   would be wrong in ways nobody could name, and it would go stale the moment
   `logo.png` is replaced. Reading the alpha channel of the shipped file makes
   the formation exactly the mark, and keeps it that way for free.

   Only the MONOGRAM is sampled. The wordmark under it is set at a size no
   point cloud this box can carry would resolve — at 140px across, "Center
   Quest" in particles is a grey smudge under a legible CQ, which is worse
   than a legible CQ alone.

   Canvas 2D, deliberately, not a second Three.js context. This is a few
   hundred dots in a 9rem box on a page that already runs one WebGL field;
   spinning up a second GL context, program and instanced mesh for it would
   cost more than everything it draws. */

const SRC = "/logo.png";

/** Fraction of the source image sampled, from the top.
 *
 *  1, i.e. the whole lockup. It was 0.76 — monogram only — while the cloud
 *  WAS the mark and had to stay legible; the wordmark under it is set at a
 *  size no point cloud this box can carry would resolve. It is the whole
 *  asset now because the cloud is no longer the destination: the real image
 *  lands on top of it, and the two have to be the same shape in the same box
 *  or the resolve reads as a swap rather than as the mark coming into
 *  focus. A smudged wordmark for a second and a half is exactly right — that
 *  is what being out of focus looks like. */
const MARK_HEIGHT = 1;

/** Working resolution the alpha channel is sampled at, in px. */
const SAMPLE_W = 132;

/** Grid step through the sampled bitmap. Lower = denser cloud.
 *
 *  4 rather than 3, which is the difference between a mark made of points and
 *  a mark that happens to have a grainy edge: at the hub's ~90px the finer
 *  step puts the dots ~2.2px apart with a ~2.8px diameter, so they merge into
 *  a solid CQ and the whole conceit is invisible. */
const STEP = 4;

/** A pixel is part of the mark above this alpha. */
const ALPHA_FLOOR = 130;

/** How long one point takes to travel from the field into its place. */
const SETTLE = 1.05;

/** Spread of the per-point start times, in seconds. */
const STAGGER = 0.55;

type Dot = {
  /** Target, in unit coordinates of the mark's own box (0–1). */
  tx: number;
  ty: number;
  /** Where it comes in from, same space, off the edge of the box. */
  fx: number;
  fy: number;
  delay: number;
  phase: number;
  radius: number;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export default function ParticleLogo({
  active,
  reduced,
  resolved = false,
  color = "#3f738d",
  accent = "#74c3d5",
  className,
}: {
  /** False parks the loop — off screen, hidden tab, or before the hub lands. */
  active: boolean;
  reduced: boolean;
  /* True once the real image on top has taken over. The cloud's job was to
     draw the eye to the formation, not to keep drawing forever underneath a
     mark that has already landed — left running, its idle drift keeps
     nudging points a fraction of a pixel apart at the mark's own antialiased
     edge, which reads as a permanent, gently animating grain around every
     stroke rather than as a settled logo. Stopping the loop here, paired
     with the CSS opacity this drives on the canvas itself, is what makes the
     handoff to the real asset actually final. */
  resolved?: boolean;
  color?: string;
  accent?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const reducedRef = useRef(reduced);
  const resolvedRef = useRef(resolved);
  /* Published by the engine below. The loop stops itself the moment the gate
     closes — that is the whole point of gating it — so reopening the gate
     needs something to start it again. */
  const wakeRef = useRef<(() => void) | null>(null);
  /* Through refs for the same reason as the gates: the engine mounts once,
     and a colour change must not re-sample the bitmap and replay the
     assembly. It is read fresh on every frame, so a new value simply lands. */
  const paintRef = useRef({ color, accent });

  useEffect(() => {
    activeRef.current = active;
    reducedRef.current = reduced;
    resolvedRef.current = resolved;
    paintRef.current = { color, accent };
    if (active && !reduced && !resolved) wakeRef.current?.();
  }, [active, reduced, resolved, color, accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let start = 0;
    let disposed = false;

    const draw = (elapsed: number) => {
      /* Never draw into a box that has no valid backing store. A canvas whose
         bitmap failed to allocate is left in a permanent error state, and
         every 2D call on it throws from then on — so one bad layout frame
         would otherwise take the whole page down rather than just skipping a
         paint. */
      if (width <= 0 || height <= 0 || !canvas.width || !canvas.height) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      for (const dot of dots) {
        /* Reduced motion gets the finished mark on the first frame — the
           formation is the decoration, the mark is the content. */
        const progress = reducedRef.current
          ? 1
          : easeOutCubic(clamp01((elapsed - dot.delay) / SETTLE));

        /* A settled point keeps a breath of drift, an eighth of a pixel at
           this scale. Enough that the mark reads as held together rather than
           printed; nowhere near enough to blur it. */
        const idle = reducedRef.current ? 0 : Math.sin(elapsed * 0.55 + dot.phase) * 0.0035;

        const x = (dot.fx + (dot.tx - dot.fx) * progress + idle) * width;
        const y = (dot.fy + (dot.ty - dot.fy) * progress - idle) * height;

        /* Points arrive small and grow into place, and the ones still in
           flight carry the celeste the field outside is made of — so the mark
           visibly condenses out of the same material the ring is. */
        context.globalAlpha = 0.25 + progress * 0.75;
        context.fillStyle = progress > 0.82 ? paintRef.current.color : paintRef.current.accent;
        context.beginPath();
        /* Radius scales with the box: the hub is a clamp() across three
           breakpoints, and a dot size fixed in px would be a granular mark at
           one of them and a solid one at the others. */
        context.arc(x, y, dot.radius * (width / 100) * (0.45 + progress * 0.55), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    /* Paused time, so a gate that closes mid-assembly and reopens later
       resumes the formation instead of teleporting it forward by however long
       the reader spent elsewhere on the page. */
    let elapsed = 0;

    const loop = (now: number) => {
      if (disposed) return;
      if (!start) start = now;
      elapsed += Math.min((now - start) / 1000, 1 / 20);
      start = now;
      draw(elapsed);
      /* The formation is finite; only the idle keeps it running, and the idle
         is what the ambient gate exists to stop — resolved stops it for good,
         the others merely pause it. */
      frame =
        activeRef.current && !reducedRef.current && !resolvedRef.current
          ? requestAnimationFrame(loop)
          : 0;
    };

    wakeRef.current = () => {
      if (frame || disposed || !dots.length) return;
      /* The gate is checked HERE and not only inside the loop. Without it a
         wake before the figure is on screen would run one frame at elapsed 0
         — every point still outside the box — and stop, leaving the core
         permanently blank for anyone whose gate never opened. */
      if (!activeRef.current || reducedRef.current || resolvedRef.current) return;
      start = 0;
      frame = requestAnimationFrame(loop);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      /* Ceilinged. This box is 74% of a hub that is itself a clamp() — it can
         never legitimately be 640px, so anything larger is a layout fault,
         and honouring it would ask the browser for a backing store it may
         refuse. Clamping keeps a broken box to a wrong-looking mark rather
         than a canvas that throws on every call for the rest of the session. */
      const nextWidth = Math.min(Math.max(1, rect.width), 640);
      const nextHeight = Math.min(Math.max(1, rect.height), 640);
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (width === nextWidth && height === nextHeight && dpr === nextDpr) return;

      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      /* Points are held in unit coordinates, so a resize costs one redraw and
         never a re-sample. Reduced motion is the one case that redraws at the
         END of the formation rather than at wherever it currently is, because
         for that reader there is no formation — only the finished mark. */
      if (dots.length) draw(reducedRef.current ? SETTLE + STAGGER : elapsed);
    };

    const build = (image: HTMLImageElement) => {
      const markAspect = (image.naturalHeight * MARK_HEIGHT) / image.naturalWidth;
      const sampleW = SAMPLE_W;
      const sampleH = Math.max(1, Math.round(SAMPLE_W * markAspect));

      const scratch = document.createElement("canvas");
      scratch.width = sampleW;
      scratch.height = sampleH;
      const scratchContext = scratch.getContext("2d", { willReadFrequently: true });
      if (!scratchContext) return;

      /* Source-cropped to the monogram: the full asset is drawn scaled so that
         only its top MARK_HEIGHT lands inside the scratch box. */
      scratchContext.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight * MARK_HEIGHT,
        0,
        0,
        sampleW,
        sampleH,
      );

      const { data } = scratchContext.getImageData(0, 0, sampleW, sampleH);
      const next: Dot[] = [];

      for (let y = 0; y < sampleH; y += STEP) {
        for (let x = 0; x < sampleW; x += STEP) {
          if (data[(y * sampleW + x) * 4 + 3] < ALPHA_FLOOR) continue;

          /* Jittered off the sampling grid. A point cloud that sits on exact
             rows and columns reads as a halftone screen of the logo rather
             than as particles that found it. */
          const jx = (Math.random() - 0.5) * STEP * 0.85;
          const jy = (Math.random() - 0.5) * STEP * 0.85;

          /* The mark is drawn into a square box, letterboxed vertically so it
             keeps its proportions whatever the hub measures. The box IS the
             margin — `.hubMark` is already inset inside the core — so there
             is no second inset here; the 0.94 that used to be was a margin
             on a margin, and it was costing the monogram 6% for nothing. */
          const boxScale = markAspect > 1 ? 1 / markAspect : 1;
          const tx = 0.5 + ((x + jx) / sampleW - 0.5) * boxScale;
          const ty = 0.5 + ((y + jy) / sampleH - 0.5) * markAspect * boxScale;

          /* Points come in from outside the box, along the radius they will
             end up on — the same direction the field's own ring lies in, so
             the mark gathers out of it rather than materialising in place. */
          const angle = Math.atan2(ty - 0.5, tx - 0.5);
          const throwOut = 1.35 + Math.random() * 1.1;

          next.push({
            tx,
            ty,
            fx: 0.5 + Math.cos(angle) * throwOut,
            fy: 0.5 + Math.sin(angle) * throwOut,
            delay: Math.random() * STAGGER,
            phase: Math.random() * Math.PI * 2,
            /* Up from 1.05–1.8. The grid step puts the points ~3% of the box
               apart, so a dot has to be about that wide to close the stroke
               into a letterform instead of leaving it a dotted outline — and
               a CQ that reads as an outline is the one failure mode worth
               spending density on. */
            radius: 1.35 + Math.random() * 0.75,
          });
        }
      }

      dots = next;
    };

    const image = new Image();
    image.decoding = "async";
    image.src = SRC;

    const onReady = () => {
      if (disposed) return;
      build(image);
      resize();
      if (reducedRef.current) {
        draw(SETTLE + STAGGER);
        return;
      }
      wakeRef.current?.();
    };

    if (image.complete && image.naturalWidth) onReady();
    else image.addEventListener("load", onReady, { once: true });

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      disposed = true;
      wakeRef.current = null;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      image.removeEventListener("load", onReady);
    };
    /* Mount-only: the gates arrive through refs, and re-running this would
       re-sample the bitmap and restart the assembly from scratch. */
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden data-resolved={resolved ? "" : undefined} />;
}
