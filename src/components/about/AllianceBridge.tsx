"use client";

import { useEffect, useRef } from "react";
import Arrow from "@/components/services/Arrow";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import styles from "./AllianceBridge.module.css";

/* Composición de alianza: marca CQ sólida (izquierda) -> trazas de circuito con
   pulsos (centro) -> cerebro Mindware reconstruido en partículas (derecha).
   Todo vive en un solo <canvas> con un único requestAnimationFrame. */

const MINDWARE_SRC = "/mindware-labs/logo_transparent_background.png";

/* Recorte en fracciones del bitmap original: solo el cerebro y sus
   ramificaciones, sin el wordmark "mindware labs". */
const BRAIN_CROP = { x: 0, y: 0, w: 0.3, h: 1 };

/* Marca Quest, portada de quest-bot-hero.html: viewBox "-215 -235 430 710".
   Aro + cradle inferior + asta, trazo 54. */
const MARK = { left: -215, top: -235, width: 430, height: 710 } as const;
const MARK_ASPECT = MARK.width / MARK.height;
const MARK_RADIUS = 179.5;
const MARK_STROKE = 54;
/* Centro del arco "A 179.5 179.5 0 1 0": los extremos (±155.4, 164.25) y el
   radio fijan el centro a 89.84 por debajo de ellos. */
const CRADLE_CENTER_Y = 164.25 + Math.sqrt(MARK_RADIUS ** 2 - 155.4 ** 2);
const CRADLE_START = Math.atan2(164.25 - CRADLE_CENTER_Y, -155.4);
const CRADLE_END = Math.atan2(164.25 - CRADLE_CENTER_Y, 155.4);

const SAMPLE_WIDTH = 210;
const SAMPLE_STEP = 3;
const ALPHA_MIN = 140;
const INK_MAX = 235;

/* Entrada al llegar scrolleando: la marca aparece, el circuito se dibuja hacia
   la derecha y el cerebro se arma desde partículas dispersas. */
const INTRO_DURATION = 1.9;
const INTRO_SCATTER = 0.42;

const BOUNCE_PERIOD = 3.4;
const BOUNCE_AMPLITUDE = 0.085;

const PALETTE = {
  line: "#6d3f94",
  lineBright: "#9d5ce0",
  node: "#b98af0",
  nodeCore: "#e6d6ff",
  particleNear: "#9d5ce0",
  particleFar: "#d9bcff",
} as const;

type Point = { x: number; y: number };

type Particle = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  stiffness: number;
  /* Punto de partida disperso desde el que la partícula se arma en la entrada. */
  sx: number;
  sy: number;
  seed: number;
  size: number;
  tone: number;
};

type Sampled = {
  points: Point[];
  width: number;
  height: number;
  /* Caja del contenido real, en pixeles del bitmap original. */
  source: { x: number; y: number; w: number; h: number };
};

type Trace = {
  points: Point[];
  cumulative: number[];
  length: number;
  /* Los pulsos alternan sentido: la alianza fluye en los dos lados. */
  reverse: boolean;
  offset: number;
  speed: number;
  bright: boolean;
  /* Retraso escalonado en la entrada: el circuito se traza de arriba a abajo. */
  introDelay: number;
};

type Box = { x: number; y: number; w: number; h: number };

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Lee los pixeles con tinta de un recorte y devuelve una nube de puntos normalizada. */
function sampleImage(
  image: HTMLImageElement,
  crop: { x: number; y: number; w: number; h: number },
): Sampled | null {
  const sx = image.naturalWidth * crop.x;
  const sy = image.naturalHeight * crop.y;
  const sw = image.naturalWidth * crop.w;
  const sh = image.naturalHeight * crop.h;
  if (sw <= 0 || sh <= 0) return null;

  const scale = SAMPLE_WIDTH / sw;
  const cw = Math.max(1, Math.round(sw * scale));
  const ch = Math.max(1, Math.round(sh * scale));

  const buffer = document.createElement("canvas");
  buffer.width = cw;
  buffer.height = ch;
  const bufferContext = buffer.getContext("2d", { willReadFrequently: true });
  if (!bufferContext) return null;

  bufferContext.drawImage(image, sx, sy, sw, sh, 0, 0, cw, ch);

  let data: Uint8ClampedArray;
  try {
    data = bufferContext.getImageData(0, 0, cw, ch).data;
  } catch {
    return null;
  }

  const points: Point[] = [];
  let minX = cw;
  let minY = ch;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < ch; y += SAMPLE_STEP) {
    for (let x = 0; x < cw; x += SAMPLE_STEP) {
      const index = (y * cw + x) * 4;
      const alpha = data[index + 3];
      if (alpha < ALPHA_MIN) continue;
      /* Sirve tanto para PNG transparente como para logos sobre blanco. */
      const luminance = (data[index] + data[index + 1] + data[index + 2]) / 3;
      if (luminance > INK_MAX) continue;

      points.push({ x, y });
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (!points.length) return null;

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  for (const point of points) {
    point.x -= minX;
    point.y -= minY;
  }

  return {
    points,
    width,
    height,
    source: {
      x: sx + minX / scale,
      y: sy + minY / scale,
      w: width / scale,
      h: height / scale,
    },
  };
}

/** Dibuja la marca Quest en blanco dentro de la caja dada. */
function drawQuestMark(context: CanvasRenderingContext2D, box: Box) {
  const scale = box.w / MARK.width;

  context.save();
  context.translate(box.x, box.y);
  context.scale(scale, scale);
  context.translate(-MARK.left, -MARK.top);

  context.strokeStyle = "#ffffff";
  context.fillStyle = "#ffffff";
  context.lineWidth = MARK_STROKE;
  context.lineCap = "butt";

  context.beginPath();
  context.arc(0, 0, MARK_RADIUS, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.arc(0, CRADLE_CENTER_Y, MARK_RADIUS, CRADLE_START, CRADLE_END, true);
  context.stroke();

  context.fillRect(152.5, -223.5, 54, 235);
  context.restore();
}

/** Encaja una caja de aspecto dado dentro de otra, centrada. */
function fitBox(container: Box, aspect: number): Box {
  let w = container.w;
  let h = w / aspect;
  if (h > container.h) {
    h = container.h;
    w = h * aspect;
  }
  return { x: container.x + (container.w - w) / 2, y: container.y + (container.h - h) / 2, w, h };
}

function measure(points: Point[]): { cumulative: number[]; length: number } {
  const cumulative = [0];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    cumulative.push(total);
  }
  return { cumulative, length: total };
}

function pointAt(trace: Trace, distance: number): Point {
  const { points, cumulative } = trace;
  if (distance <= 0) return points[0];
  if (distance >= trace.length) return points[points.length - 1];
  let i = 1;
  while (i < cumulative.length && cumulative[i] < distance) i++;
  const segment = cumulative[i] - cumulative[i - 1];
  const t = segment > 0 ? (distance - cumulative[i - 1]) / segment : 0;
  return {
    x: lerp(points[i - 1].x, points[i].x, t),
    y: lerp(points[i - 1].y, points[i].y, t),
  };
}

/** Traza ortogonal + diagonal a 45°, el mismo lenguaje del circuito de Mindware. */
function buildTrace(from: Point, to: Point, index: number, count: number): Trace {
  const span = to.x - from.x;
  const drop = to.y - from.y;
  const lead = span * (0.18 + (index % 3) * 0.06);
  const tail = span * (0.16 + ((count - index) % 3) * 0.05);
  const diagonal = Math.min(Math.abs(drop), Math.max(0, span - lead - tail));

  const kneeX = from.x + lead + diagonal;
  const kneeY = from.y + Math.sign(drop) * diagonal;

  const points: Point[] = [
    { x: from.x, y: from.y },
    { x: from.x + lead, y: from.y },
    { x: kneeX, y: kneeY },
  ];
  /* Si la diagonal a 45° no alcanza la altura destino, cierra en vertical. */
  if (Math.abs(to.y - kneeY) > 0.5) points.push({ x: kneeX, y: to.y });
  points.push({ x: to.x, y: to.y });

  const { cumulative, length } = measure(points);
  return {
    points,
    cumulative,
    length,
    reverse: index % 2 === 1,
    offset: (index / count) * 0.8,
    speed: 0.2 + (index % 3) * 0.045,
    bright: index % 2 === 0,
    introDelay: (index / count) * 0.35,
  };
}

type AllianceBridgeProps = {
  reduced: boolean;
  href: string;
  name: string;
  action: string;
};

export default function AllianceBridge({ reduced, href, name, action }: AllianceBridgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !host || !context) return;

    let disposed = false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;
    let lastTime = 0;
    let elapsed = 0;
    let visible = false;
    let introStart = 0;

    let brainSample: Sampled | null = null;
    let particles: Particle[] = [];
    let traces: Trace[] = [];
    let cqBox: Box = { x: 0, y: 0, w: 0, h: 0 };
    let brainBox: Box = { x: 0, y: 0, w: 0, h: 0 };

    const layout = () => {
      if (!width || !height) return;

      const padX = width * 0.06;
      const inner = { x: padX, y: height * 0.12, w: width - padX * 2, h: height * 0.76 };

      /* Reserva de aire arriba: el salto no debe recortarse contra el borde. */
      const headroom = inner.h * (BOUNCE_AMPLITUDE + 0.06);
      const midY = inner.y + inner.h / 2;
      const brainAspect = brainSample ? brainSample.width / brainSample.height : 1;

      cqBox = fitBox({ x: inner.x, y: inner.y, w: inner.w * 0.13, h: inner.h * 0.58 }, MARK_ASPECT);
      brainBox = fitBox(
        {
          x: inner.x + inner.w * 0.79,
          y: inner.y + headroom,
          w: inner.w * 0.21,
          h: (inner.h - headroom) * 0.7,
        },
        brainAspect,
      );

      /* Ambas marcas comparten eje: el circuito las une en horizontal limpia. */
      cqBox.y = midY - cqBox.h / 2;
      brainBox.y = Math.max(inner.y + headroom, midY - brainBox.h / 2);

      if (brainSample) {
        const scale = brainBox.w / brainSample.width;
        particles = brainSample.points.map((point, index) => {
          const hx = brainBox.x + point.x * scale;
          const hy = brainBox.y + point.y * scale;
          /* Dispersión determinista: sin Math.random el layout es estable
             entre resizes y no salta al recalcular. */
          const angle = ((index * 97) % 360) * (Math.PI / 180);
          const spread = brainBox.w * INTRO_SCATTER * (0.35 + ((index * 53) % 100) / 100);
          return {
            hx,
            hy,
            sx: hx + Math.cos(angle) * spread,
            sy: hy + Math.sin(angle) * spread * 0.7,
            x: hx + Math.cos(angle) * spread,
            y: hy + Math.sin(angle) * spread * 0.7,
            vx: 0,
            vy: 0,
            /* Rigidez desigual: las partículas rezagadas dibujan la estela del salto. */
            stiffness: 0.07 + ((index * 37) % 100) / 100 * 0.11,
            seed: ((index * 61) % 360) / 360 * Math.PI * 2,
            size: 1.1 + ((index * 13) % 5) / 5 * 0.9,
            tone: ((index * 29) % 100) / 100,
          };
        });
      }

      const originX = cqBox.x + cqBox.w;
      const targetX = brainBox.x;
      const count = 5;
      traces = [];
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const from = { x: originX + width * 0.015, y: cqBox.y + cqBox.h * lerp(0.22, 0.82, t) };
        const to = { x: targetX - width * 0.012, y: brainBox.y + brainBox.h * lerp(0.28, 0.78, t) };
        traces.push(buildTrace(from, to, i, count));
      }
    };

    const drawTrace = (trace: Trace, time: number, alpha: number, reveal: number) => {
      if (reveal <= 0) return;
      const revealed = reveal * trace.length;

      context.beginPath();
      context.moveTo(trace.points[0].x, trace.points[0].y);
      for (let i = 1; i < trace.points.length; i++) {
        if (trace.cumulative[i] > revealed) break;
        context.lineTo(trace.points[i].x, trace.points[i].y);
      }
      if (reveal < 1) {
        const tip = pointAt(trace, revealed);
        context.lineTo(tip.x, tip.y);
      }
      context.lineWidth = trace.bright ? 1.5 : 1.1;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.strokeStyle = trace.bright ? PALETTE.lineBright : PALETTE.line;
      context.globalAlpha = alpha * (trace.bright ? 0.7 : 0.45);
      context.stroke();

      /* Los pulsos arrancan recién cuando la traza terminó de dibujarse. */
      if (reveal < 1) return;

      const cycle = (time * trace.speed + trace.offset) % 1;
      const travel = trace.reverse ? 1 - cycle : cycle;
      const head = pointAt(trace, travel * trace.length);
      const tailPoint = pointAt(trace, clamp01(travel + (trace.reverse ? 0.09 : -0.09)) * trace.length);

      const gradient = context.createLinearGradient(tailPoint.x, tailPoint.y, head.x, head.y);
      gradient.addColorStop(0, "rgba(157, 92, 224, 0)");
      gradient.addColorStop(1, PALETTE.nodeCore);
      context.beginPath();
      context.moveTo(tailPoint.x, tailPoint.y);
      context.lineTo(head.x, head.y);
      context.strokeStyle = gradient;
      context.lineWidth = 2;
      context.globalAlpha = alpha;
      context.stroke();

      context.beginPath();
      context.arc(head.x, head.y, 2.4, 0, Math.PI * 2);
      context.fillStyle = PALETTE.nodeCore;
      context.shadowColor = PALETTE.lineBright;
      context.shadowBlur = 10;
      context.fill();
      context.shadowBlur = 0;
    };

    const draw = (time: number, delta: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const still = reduced;
      const intro = still ? 1 : easeOut(clamp01((time - introStart) / INTRO_DURATION));

      /* La marca entra desde la izquierda y se asienta. */
      context.globalAlpha = clamp01(intro * 1.6);
      drawQuestMark(context, { ...cqBox, x: cqBox.x - (1 - intro) * cqBox.w * 0.5 });

      for (const trace of traces) {
        const reveal = clamp01((intro - trace.introDelay) / (1 - trace.introDelay));
        drawTrace(trace, still ? 0.4 : time, intro, reveal);
      }

      /* Salto lento: media onda senoidal aplanada, con squash al aterrizar. */
      const phase = still ? 0 : (time % BOUNCE_PERIOD) / BOUNCE_PERIOD;
      const lift = still ? 0 : Math.pow(Math.sin(Math.PI * phase), 0.62);
      const bounceY = -lift * brainBox.h * BOUNCE_AMPLITUDE;
      const squash = 1 + lift * 0.035;
      const centerX = brainBox.x + brainBox.w / 2;
      const baseY = brainBox.y + brainBox.h;

      context.globalAlpha = 1;
      for (const particle of particles) {
        const homeX = centerX + (particle.hx - centerX) / squash;
        const homeY = baseY + (particle.hy - baseY) * squash + bounceY;
        const targetX = lerp(particle.sx, homeX, intro);
        const targetY = lerp(particle.sy, homeY, intro);

        if (still) {
          particle.x = particle.hx;
          particle.y = particle.hy;
        } else {
          const drift = Math.sin(time * 1.3 + particle.seed) * 0.6;
          particle.vx += (targetX + drift - particle.x) * particle.stiffness;
          particle.vy += (targetY - particle.y) * particle.stiffness;
          particle.vx *= 0.78;
          particle.vy *= 0.78;
          particle.x += particle.vx * Math.min(delta * 60, 2);
          particle.y += particle.vy * Math.min(delta * 60, 2);
        }

        context.fillStyle = particle.tone > 0.62 ? PALETTE.particleFar : PALETTE.particleNear;
        context.globalAlpha = (0.55 + particle.tone * 0.45) * clamp01(intro * 1.4);
        context.fillRect(particle.x, particle.y, particle.size, particle.size);
      }

      context.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (disposed) return;
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 1 / 20) : 1 / 60;
      lastTime = now;
      elapsed += delta;
      draw(elapsed, delta);
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frameId || reduced || disposed) return;
      lastTime = 0;
      frameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!frameId) return;
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      layout();
      draw(elapsed, 1 / 60);
    };

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && visible) start();
      else stop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        /* Rearma la entrada en cada llegada: subir y volver a bajar la reproduce. */
        if (visible) introStart = elapsed;
        if (visible && document.visibilityState === "visible") start();
        else stop();
      },
      { rootMargin: "120px" },
    );

    const load = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const image = new window.Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = src;
      });

    void load(MINDWARE_SRC).then((brainImage) => {
      if (disposed) return;

      if (brainImage) brainSample = sampleImage(brainImage, BRAIN_CROP);

      host.dataset.ready = "true";
      resize();
      observer.observe(host);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
    });

    return () => {
      disposed = true;
      stop();
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <LocalizedLink
      href={href}
      prefetch={false}
      className={styles.card}
      aria-label={`${action}: ${name}`}
    >
      <div ref={hostRef} className={styles.stage}>
        <canvas ref={canvasRef} aria-hidden className={styles.canvas} />
      </div>

      <div className={styles.footer}>
        <p className={styles.name}>{name}</p>
        <span className={styles.action}>
          {action}
          <Arrow className={styles.arrow} />
        </span>
      </div>
    </LocalizedLink>
  );
}
