"use client";

import { useEffect, useRef } from "react";

const SRC = "/logo.png";

const MARK_HEIGHT = 1;

/* El logo se muestrea a esta anchura y luego se recorre cada STEP píxeles:
   sube cualquiera de los dos y el número de partículas crece al cuadrado. */
const SAMPLE_W = 132;

const STEP = 4;

/* Por debajo de este alfa el píxel es antialias del borde, no marca. */
const ALPHA_FLOOR = 130;

const SETTLE = 1.05;

const STAGGER = 0.55;

type Dot = {
  tx: number;
  ty: number;

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
  active: boolean;
  reduced: boolean;

  resolved?: boolean;
  color?: string;
  accent?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const reducedRef = useRef(reduced);
  const resolvedRef = useRef(resolved);

  /* Publicado por el motor para que las puertas de arriba lo despierten sin
     reconstruirlo: el efecto monta una sola vez y lee refs. */
  const wakeRef = useRef<(() => void) | null>(null);

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
      if (width <= 0 || height <= 0 || !canvas.width || !canvas.height) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      for (const dot of dots) {
        const progress = reducedRef.current
          ? 1
          : easeOutCubic(clamp01((elapsed - dot.delay) / SETTLE));

        const idle = reducedRef.current ? 0 : Math.sin(elapsed * 0.55 + dot.phase) * 0.0035;

        const x = (dot.fx + (dot.tx - dot.fx) * progress + idle) * width;
        const y = (dot.fy + (dot.ty - dot.fy) * progress - idle) * height;

        context.globalAlpha = 0.25 + progress * 0.75;
        context.fillStyle = progress > 0.82 ? paintRef.current.color : paintRef.current.accent;
        context.beginPath();

        context.arc(x, y, dot.radius * (width / 100) * (0.45 + progress * 0.55), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    let elapsed = 0;

    const loop = (now: number) => {
      if (disposed) return;
      if (!start) start = now;
      elapsed += Math.min((now - start) / 1000, 1 / 20);
      start = now;
      draw(elapsed);

      frame =
        activeRef.current && !reducedRef.current && !resolvedRef.current
          ? requestAnimationFrame(loop)
          : 0;
    };

    wakeRef.current = () => {
      if (frame || disposed || !dots.length) return;

      if (!activeRef.current || reducedRef.current || resolvedRef.current) return;
      start = 0;
      frame = requestAnimationFrame(loop);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      const nextWidth = Math.min(Math.max(1, rect.width), 640);
      const nextHeight = Math.min(Math.max(1, rect.height), 640);
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (width === nextWidth && height === nextHeight && dpr === nextDpr) return;

      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

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

          const jx = (Math.random() - 0.5) * STEP * 0.85;
          const jy = (Math.random() - 0.5) * STEP * 0.85;

          const boxScale = markAspect > 1 ? 1 / markAspect : 1;
          const tx = 0.5 + ((x + jx) / sampleW - 0.5) * boxScale;
          const ty = 0.5 + ((y + jy) / sampleH - 0.5) * markAspect * boxScale;

          const angle = Math.atan2(ty - 0.5, tx - 0.5);
          const throwOut = 1.35 + Math.random() * 1.1;

          next.push({
            tx,
            ty,
            fx: 0.5 + Math.cos(angle) * throwOut,
            fy: 0.5 + Math.sin(angle) * throwOut,
            delay: Math.random() * STAGGER,
            phase: Math.random() * Math.PI * 2,

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
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden data-resolved={resolved ? "" : undefined} />;
}
