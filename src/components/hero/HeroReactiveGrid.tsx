"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroReactiveGrid.module.css";

const GRID_SIZE = 46;
const SAMPLE_SIZE = 16;
const MAX_DPR = 1.5;

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
    let deformLimitSquared = deformRadius * deformRadius * 9;
    let maxElevation = 34;
    let frame = 0;
    let lastTime = 0;
    let rect: DOMRect | null = null;
    let rectStale = true;
    let pointerFrame = 0;
    let clientX = 0;
    let clientY = 0;

    const current: Point = { x: 0, y: 0, lift: 0, vx: 0, vy: 0, vl: 0 };
    const target = { x: 0, y: 0, lift: 0 };

    const deform = (x: number, y: number) => {
      if (current.lift < 0.001) return { x, y };

      const dx = x - current.x;
      const dy = y - current.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared > deformLimitSquared) return { x, y };

      const influence =
        Math.exp(-distanceSquared / (2 * deformRadius * deformRadius)) * current.lift;
      const elevation = influence * maxElevation;
      const expansion = influence * 0.028;

      return {
        x: x + dx * expansion,
        y: y + dy * expansion * 0.35 - elevation,
      };
    };

    const appendLine = (
      path: Path2D,
      start: number,
      end: number,
      fixed: number,
      horizontal: boolean,
    ) => {
      let started = false;

      for (let moving = start; moving <= end + SAMPLE_SIZE; moving += SAMPLE_SIZE) {
        const point = horizontal
          ? deform(Math.min(moving, end), fixed)
          : deform(fixed, Math.min(moving, end));

        if (!started) {
          path.moveTo(point.x, point.y);
          started = true;
        } else {
          path.lineTo(point.x, point.y);
        }
      }
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

        /* The reflection only repaints the grid strokes. There is no filled
           radial surface, blur or glow, so the cursor reads as polished light
           catching an elevated material rather than a cloud following it. */
        strokeGrid(paths, lineReflection, lineReflection, true);
      }
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
      const dprCap = window.matchMedia("(max-width: 48rem)").matches ? 1.25 : MAX_DPR;
      const nextDpr = Math.min(window.devicePixelRatio || 1, dprCap);
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
      deformLimitSquared = deformRadius * deformRadius * 9;
      maxElevation = Math.min(34, height * 0.038);
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
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
