"use client";

import { useEffect, useRef } from "react";

const BRANCH_COUNT = 12;
const SEGMENTS_PER_BRANCH = 7;
const FORK_CHANCE = 0.4;

const PALETTE = {
  line: "#6d3f94",
  lineBright: "#9d5ce0",
  node: "#b98af0",
  nodeCore: "#e6d6ff",
} as const;

type Branch = {
  points: { x: number; y: number }[];
  cumLen: number[];
  totalLen: number;
  delay: number;
  seed: number;
  bright: boolean;
};

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function buildBranch(
  originX: number,
  originY: number,
  baseAngle: number,
  reach: number,
  delay: number,
): Branch {
  const points = [{ x: originX, y: originY }];
  const cumLen = [0];
  let angle = baseAngle;
  let x = originX;
  let y = originY;
  let total = 0;
  const stepLen = reach / SEGMENTS_PER_BRANCH;

  for (let i = 0; i < SEGMENTS_PER_BRANCH; i++) {
    angle += (Math.random() - 0.5) * 0.9;
    angle = lerp(angle, baseAngle, 0.22);
    const len = stepLen * (0.75 + Math.random() * 0.5);
    x += Math.cos(angle) * len;
    y += Math.sin(angle) * len;
    total += len;
    points.push({ x, y });
    cumLen.push(total);
  }

  return { points, cumLen, totalLen: total, delay, seed: Math.random() * 1000, bright: false };
}

function buildField(width: number, height: number): Branch[] {
  const originX = width * 0.5;
  const originY = height * 0.32;
  const reach = Math.hypot(width, height) * 0.62;

  const branches: Branch[] = [];

  for (let i = 0; i < BRANCH_COUNT; i++) {
    const baseAngle = (i / BRANCH_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const branch = buildBranch(originX, originY, baseAngle, reach * (0.75 + Math.random() * 0.5), Math.random() * 0.4);
    branch.bright = i % 4 === 0;
    branches.push(branch);

    if (Math.random() < FORK_CHANCE) {
      const forkIndex = 2 + Math.floor(Math.random() * 3);
      const forkPoint = branch.points[forkIndex];
      const forkAngle = baseAngle + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.6);
      const fork = buildBranch(
        forkPoint.x,
        forkPoint.y,
        forkAngle,
        reach * (0.35 + Math.random() * 0.3),
        branch.delay + 0.22 + Math.random() * 0.15,
      );
      fork.bright = Math.random() < 0.3;
      branches.push(fork);
    }
  }

  return branches;
}

export default function VenomField({ reduced, className }: { reduced: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let branches: Branch[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let disposed = false;
    let start = 0;

    const targetProgress = { value: 0 };
    const smoothProgress = { value: 0 };

    const updateScrollTarget = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress.value = max > 0 ? clamp01(window.scrollY / max) : 0;
    };

    const draw = (elapsed: number) => {
      if (width <= 0 || height <= 0 || !canvas.width || !canvas.height) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const progress = reduced ? 1 : smoothProgress.value;

      for (const branch of branches) {
        const growth = clamp01((progress - branch.delay) / (1 - branch.delay));
        if (growth <= 0) continue;

        const alpha = smoothstep(0, 0.18, growth);
        const revealLen = growth * branch.totalLen;

        const wobbleFor = (index: number) => {
          if (reduced) return { x: 0, y: 0 };
          const t = index / SEGMENTS_PER_BRANCH;
          const amp = t * 2.2 * smoothstep(0.15, 0.5, growth);
          const phase = elapsed * 0.55 + branch.seed + index * 0.7;
          return { x: Math.sin(phase) * amp, y: Math.cos(phase * 0.8) * amp };
        };

        context.beginPath();
        let lastIndex = 0;
        for (let i = 0; i < branch.points.length; i++) {
          if (branch.cumLen[i] > revealLen) break;
          const w = wobbleFor(i);
          const px = branch.points[i].x + w.x;
          const py = branch.points[i].y + w.y;
          if (i === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
          lastIndex = i;
        }

        if (lastIndex < branch.points.length - 1) {
          const a = branch.points[lastIndex];
          const b = branch.points[lastIndex + 1];
          const segLen = branch.cumLen[lastIndex + 1] - branch.cumLen[lastIndex];
          const segT = segLen > 0 ? clamp01((revealLen - branch.cumLen[lastIndex]) / segLen) : 0;
          const tipX = lerp(a.x, b.x, segT);
          const tipY = lerp(a.y, b.y, segT);
          context.lineTo(tipX, tipY);
        }

        context.lineWidth = branch.bright ? 1.6 : 1.1;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.strokeStyle = branch.bright ? PALETTE.lineBright : PALETTE.line;
        context.globalAlpha = alpha * (branch.bright ? 0.85 : 0.6);

        if (branch.bright) {
          context.shadowColor = PALETTE.lineBright;
          context.shadowBlur = 10;
        }
        context.stroke();
        context.shadowBlur = 0;

        for (let i = 1; i <= lastIndex; i++) {
          const w = wobbleFor(i);
          const px = branch.points[i].x + w.x;
          const py = branch.points[i].y + w.y;
          const pulse = 0.82 + Math.sin(elapsed * 1.4 + branch.seed + i) * 0.18;
          const radius = (branch.bright ? 2.1 : 1.5) * pulse;
          const isTip = i === lastIndex;

          context.globalAlpha = alpha * 0.9;
          context.fillStyle = isTip ? PALETTE.nodeCore : PALETTE.node;
          if (branch.bright || isTip) {
            context.shadowColor = PALETTE.nodeCore;
            context.shadowBlur = branch.bright ? 8 : 4;
          }
          context.beginPath();
          context.arc(px, py, radius, 0, Math.PI * 2);
          context.fill();
          context.shadowBlur = 0;
        }
      }

      context.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (disposed) return;
      if (!start) start = now;
      const dt = Math.min((now - start) / 1000, 1 / 20);
      start = now;

      smoothProgress.value += (targetProgress.value - smoothProgress.value) * 0.06;
      draw((frame += dt));

      requestedRef.current = document.visibilityState === "visible" ? requestAnimationFrame(loop) : 0;
    };
    const requestedRef = { current: 0 };

    const resize = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      branches = buildField(width, height);
      updateScrollTarget();
      if (reduced) {
        smoothProgress.value = 1;
        draw(0);
      }
    };

    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 200);
    };

    const onScroll = () => updateScrollTarget();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !requestedRef.current && !reduced) {
        start = 0;
        requestedRef.current = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    window.addEventListener("scroll", onScroll, { passive: true });
    if (!reduced) requestedRef.current = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (requestedRef.current) cancelAnimationFrame(requestedRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
