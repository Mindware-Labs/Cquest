"use client";

import { useEffect, useRef } from "react";

/* ── The symbiote field ──────────────────────────────────────────────────
   Mindware Labs' mark is a brain dripping into a circuit of branching lines
   and node-particles. This takes that exact motif — branch, node, drip —
   and grows it loose across the page: a cluster of purple veins that
   spreads outward from a fixed point near the hero as the reader scrolls,
   the way Venom's symbiote creeps across a surface rather than simply
   fading in.

   Canvas 2D, fixed to the viewport. The geometry (every branch's polyline)
   is generated once per layout size; only how much of each branch is drawn,
   and a small idle wobble, changes per frame. Scroll only sets a TARGET
   growth — the drawn amount eases toward it, so the reader never sees the
   field snap to a new length on a janky scroll frame. */

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
    // Random walk pulled back toward the base direction each step, so the
    // branch wanders but keeps travelling outward instead of curling home.
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
  // Anchored high and slightly left of centre — roughly where the hero
  // logo sits — so the growth reads as spreading FROM the mark, not from
  // an arbitrary point on the screen.
  const originX = width * 0.5;
  const originY = height * 0.32;
  const reach = Math.hypot(width, height) * 0.62;

  const branches: Branch[] = [];

  for (let i = 0; i < BRANCH_COUNT; i++) {
    // Full radial spread. The origin sits near the top, so downward angles
    // have the most open canvas to grow into and dominate the read even
    // though every direction is available — the same asymmetry the logo's
    // own drips have.
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

        // Idle wobble grows with both distance-from-origin and how settled
        // the branch already is — a freshly-drawn tip doesn't wobble (it
        // would read as jitter, not life), a long-settled vein does.
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

        // The growing tip: a partial segment lerped between the last fully
        // revealed point and the next one, so growth reads as continuous
        // travel rather than snapping in whole-segment jumps.
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
        // Glow only on the ~quarter of branches marked bright — the rest
        // stroke plain. Canvas shadowBlur rasterises per call, so gating it
        // this way keeps a page-long field of ~20 branches cheap instead of
        // blurring every one of them every frame.
        if (branch.bright) {
          context.shadowColor = PALETTE.lineBright;
          context.shadowBlur = 10;
        }
        context.stroke();
        context.shadowBlur = 0;

        // Nodes at each fully-grown joint — the logo's own dot-tipped drips,
        // repeated down every vein. Only the branch's own growing tip glows
        // on a plain branch, so the "just arrived" node still reads as live.
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
    // Kept even under reduced motion: a resize already redraws the static
    // frame, and scroll changing the document height (e.g. a late-loading
    // image) should still update the target in case the preference flips.
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
