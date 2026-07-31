"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroReactiveGrid.module.css";

const GRID_SIZE = 46;

/* ── Sampling density ────────────────────────────────────────────────────
   How finely a line is subdivided *inside* the deformed region, in CSS px.

   This was 16, which sampled the whole canvas at ~5,500 points a frame. The
   dome being traced is smooth and shallow — roughly 34px of rise over a
   ~270px radius — so the sampling error of a polyline through it is bounded
   by ⅛·h″·Δ², with h″ ≈ maxElevation / radius² ≈ 4.7e-4. At Δ = 40 that is
   0.09px: a tenth of a pixel, well under the width of the hairline being
   drawn. The extra 2.5× of points bought nothing the eye could resolve and
   cost the frame budget that made pointer tracking feel heavy. */
const SAMPLE_SIZE = 40;
const MAX_DPR = 1.5;

/* ── Falloff ─────────────────────────────────────────────────────────────
   The dome's profile used to be a gaussian, exp(-d²/2σ²). A gaussian never
   actually reaches zero, so every line on the canvas was formally deformed
   and had to be subdivided — even the ones displaced by a hundredth of a
   pixel. This is the smooth polynomial (1 - t²)³ over t = d / (SPAN·σ),
   which tracks the gaussian closely through the visible part of the dome
   (0.62 vs 0.61 at d = σ; 0.30 vs 0.33 at 1.5σ) and is *exactly* zero at the
   edge. Two things follow: everything outside the disc can be drawn as a
   straight run of two points, and there is no seam where the two meet
   because there is no discontinuity to hide. It also drops Math.exp from the
   inner loop. */
const FALLOFF_SPAN = 2.6;

type Point = {
  x: number;
  y: number;
  lift: number;
  vx: number;
  vy: number;
  vl: number;
};

function spring(value: number, velocity: number, target: number, delta: number) {
  const acceleration = (target - value) * 135 - velocity * 22;
  const nextVelocity = velocity + acceleration * delta;
  return [value + nextVelocity * delta, nextVelocity] as const;
}

export default function HeroReactiveGrid({
  ambient,
  reduced,
}: {
  ambient: boolean;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let deformRadius = 150;
    /* Outer edge of the dome — past this the surface is flat by definition. */
    let deformReach = deformRadius * FALLOFF_SPAN;
    let deformReachSquared = deformReach * deformReach;
    let maxElevation = 34;
    let frame = 0;
    let lastTime = 0;
    let rect: DOMRect | null = null;
    let rectStale = true;
    let pointerFrame = 0;
    let clientX = 0;
    let clientY = 0;
    /* The edge fade, rebuilt on resize. Two ramps multiplied together — the
       same intersect the CSS mask used to do, applied here so the element
       stays an ordinary texture for the compositor. Narrow viewports keep
       only the vertical ramp: the field is already edge-to-edge there and
       the horizontal fade eats into it. */
    let fadeDown: CanvasGradient | null = null;
    let fadeAcross: CanvasGradient | null = null;

    const buildFades = (compact: boolean) => {
      const down = context.createLinearGradient(0, 0, 0, height);
      down.addColorStop(0, "rgba(0,0,0,0)");
      down.addColorStop(compact ? 0.12 : 0.09, "rgba(0,0,0,1)");
      down.addColorStop(compact ? 0.68 : 0.72, "rgba(0,0,0,1)");
      down.addColorStop(compact ? 0.94 : 0.98, "rgba(0,0,0,0)");
      fadeDown = down;

      if (compact) {
        fadeAcross = null;
        return;
      }

      const across = context.createLinearGradient(0, 0, width, 0);
      across.addColorStop(0, "rgba(0,0,0,0)");
      across.addColorStop(0.08, "rgba(0,0,0,1)");
      across.addColorStop(0.92, "rgba(0,0,0,1)");
      across.addColorStop(1, "rgba(0,0,0,0)");
      fadeAcross = across;
    };

    const applyFade = () => {
      context.globalCompositeOperation = "destination-in";
      if (fadeDown) {
        context.fillStyle = fadeDown;
        context.fillRect(0, 0, width, height);
      }
      if (fadeAcross) {
        context.fillStyle = fadeAcross;
        context.fillRect(0, 0, width, height);
      }
      context.globalCompositeOperation = "source-over";
    };

    const current: Point = { x: 0, y: 0, lift: 0, vx: 0, vy: 0, vl: 0 };
    const target = { x: 0, y: 0, lift: 0 };

    /* The deformed point, written rather than returned. At tens of thousands
       of calls a second an allocated {x, y} per sample is pure garbage for
       the collector to walk, and the pauses land exactly where the pointer is
       moving fastest. */
    let outX = 0;
    let outY = 0;

    const deform = (x: number, y: number) => {
      outX = x;
      outY = y;
      if (current.lift < 0.001) return;

      const dx = x - current.x;
      const dy = y - current.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared >= deformReachSquared) return;

      const falloff = 1 - distanceSquared / deformReachSquared;
      const influence = falloff * falloff * falloff * current.lift;
      const elevation = influence * maxElevation;
      const expansion = influence * 0.028;

      outX = x + dx * expansion;
      outY = y + dy * expansion * 0.35 - elevation;
    };

    /* Walks one grid line, subdividing it ONLY across the span the dome
       actually touches. `across` is the line's distance from the dome's
       centre on the perpendicular axis; from it and the reach we get the
       chord the disc cuts out of this line, and everything either side of
       that chord is a single straight segment. On a still pointer — or one
       parked outside the hero — every line is one segment and the whole grid
       costs about sixty of them. */
    const appendLine = (
      path: Path2D,
      start: number,
      end: number,
      fixed: number,
      horizontal: boolean,
    ) => {
      const centreAlong = horizontal ? current.x : current.y;
      const across = fixed - (horizontal ? current.y : current.x);
      const halfChordSquared = deformReachSquared - across * across;

      const emit = (along: number) => {
        if (horizontal) deform(along, fixed);
        else deform(fixed, along);
      };

      emit(start);
      path.moveTo(outX, outY);

      if (current.lift >= 0.001 && halfChordSquared > 0) {
        const halfChord = Math.sqrt(halfChordSquared);
        const from = Math.max(start, centreAlong - halfChord);
        const to = Math.min(end, centreAlong + halfChord);

        if (to > from) {
          if (from > start) {
            emit(from);
            path.lineTo(outX, outY);
          }
          for (let along = from + SAMPLE_SIZE; along < to; along += SAMPLE_SIZE) {
            emit(along);
            path.lineTo(outX, outY);
          }
          emit(to);
          path.lineTo(outX, outY);
        }
      }

      emit(end);
      path.lineTo(outX, outY);
    };

    const buildGridPaths = () => {
      const minor = new Path2D();
      const major = new Path2D();
      const offsetX = (width % GRID_SIZE) / 2;
      const offsetY = (height % GRID_SIZE) / 2;

      for (let y = offsetY, index = 0; y <= height; y += GRID_SIZE, index += 1) {
        appendLine(index % 4 === 0 ? major : minor, 0, width, y, true);
      }
      for (let x = offsetX, index = 0; x <= width; x += GRID_SIZE, index += 1) {
        appendLine(index % 4 === 0 ? major : minor, 0, height, x, false);
      }

      return { minor, major };
    };

    const strokeGrid = (
      paths: ReturnType<typeof buildGridPaths>,
      minorStyle: string | CanvasGradient,
      majorStyle: string | CanvasGradient,
      highlighted = false,
    ) => {
      context.strokeStyle = minorStyle;
      context.lineWidth = highlighted ? 0.85 : 0.65;
      context.stroke(paths.minor);

      context.strokeStyle = majorStyle;
      context.lineWidth = highlighted ? 1.15 : 0.9;
      context.stroke(paths.major);
    };

    const draw = () => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const paths = buildGridPaths();
      strokeGrid(
        paths,
        "rgba(116, 195, 213, 0.072)",
        "rgba(116, 195, 213, 0.145)",
      );

      if (current.lift > 0.01) {
        const radius = Math.min(230, Math.max(140, width * 0.14));
        const lineReflection = context.createRadialGradient(
          current.x,
          current.y - 18,
          0,
          current.x,
          current.y,
          radius,
        );
        lineReflection.addColorStop(
          0,
          `rgba(202, 237, 244, ${0.38 * current.lift})`,
        );
        lineReflection.addColorStop(
          0.38,
          `rgba(116, 195, 213, ${0.2 * current.lift})`,
        );
        lineReflection.addColorStop(1, "rgba(116, 195, 213, 0)");

        /* Clipped to the gradient's own footprint. The reflection pass used
           to re-stroke the ENTIRE grid a second time with this gradient —
           every line on the canvas rasterised twice per frame so that a
           ~230px disc could catch the light, while the gradient evaluated to
           fully transparent across the other 95% of the surface. Clipping
           first means the second pass rasterises only the disc; the paths
           are shared with the base pass, so no geometry is rebuilt.

           The reflection only repaints the grid strokes. There is no filled
           radial surface, blur or glow, so the cursor reads as polished light
           catching an elevated material rather than a cloud following it. */
        context.save();
        context.beginPath();
        context.arc(current.x, current.y, radius + 24, 0, Math.PI * 2);
        context.clip();
        strokeGrid(paths, lineReflection, lineReflection, true);
        context.restore();
      }

      applyFade();
    };

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000 || 1 / 60, 1 / 30);
      lastTime = time;

      [current.x, current.vx] = spring(current.x, current.vx, target.x, delta);
      [current.y, current.vy] = spring(current.y, current.vy, target.y, delta);
      [current.lift, current.vl] = spring(
        current.lift,
        current.vl,
        target.lift,
        delta,
      );
      draw();

      const moving =
        Math.abs(current.x - target.x) > 0.08 ||
        Math.abs(current.y - target.y) > 0.08 ||
        Math.abs(current.lift - target.lift) > 0.002 ||
        Math.abs(current.vx) > 0.08 ||
        Math.abs(current.vy) > 0.08 ||
        Math.abs(current.vl) > 0.002;

      frame = moving && ambient && !reduced ? requestAnimationFrame(animate) : 0;
    };

    const requestDraw = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    };

    const resize = () => {
      const nextRect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, nextRect.width);
      const nextHeight = Math.max(1, nextRect.height);
      const compact = window.matchMedia("(max-width: 48rem)").matches;
      const nextDpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : MAX_DPR);
      const pixelWidth = Math.round(nextWidth * nextDpr);
      const pixelHeight = Math.round(nextHeight * nextDpr);

      rect = nextRect;
      rectStale = false;

      if (
        width === nextWidth &&
        height === nextHeight &&
        dpr === nextDpr &&
        canvas.width === pixelWidth &&
        canvas.height === pixelHeight
      ) {
        return;
      }

      if (width > 0 && height > 0) {
        const scaleX = nextWidth / width;
        const scaleY = nextHeight / height;
        current.x *= scaleX;
        current.y *= scaleY;
        target.x *= scaleX;
        target.y *= scaleY;
      } else {
        current.x = target.x = nextWidth * 0.55;
        current.y = target.y = nextHeight * 0.42;
      }

      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      deformRadius = Math.min(270, Math.max(150, width * 0.16));
      deformReach = deformRadius * FALLOFF_SPAN;
      deformReachSquared = deformReach * deformReach;
      maxElevation = Math.min(34, height * 0.038);
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      buildFades(compact);
      draw();
    };

    const updatePointer = () => {
      pointerFrame = 0;
      if (rectStale || !rect) {
        rect = canvas.getBoundingClientRect();
        rectStale = false;
      }

      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (!inside) {
        target.lift = 0;
      } else {
        target.x = clientX - rect.left;
        target.y = clientY - rect.top;
        target.lift = 1;
      }
      requestDraw();
    };

    const onPointerMove = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    };

    const onPointerLeave = () => {
      target.lift = 0;
      requestDraw();
    };

    const invalidateRect = () => {
      rectStale = true;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const finePointer =
      ambient &&
      !reduced &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", invalidateRect, { passive: true });
      window.addEventListener("resize", invalidateRect, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", invalidateRect);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [ambient, reduced]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />;
}
