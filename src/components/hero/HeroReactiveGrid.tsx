"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroReactiveGrid.module.css";

const GRID_SIZE = 46;

/* Subdivisión dentro de la zona deformada, en px CSS. A 40 el error de
   muestreo del domo es ~0.09px: por debajo del grosor del filete que dibuja. */
const SAMPLE_SIZE = 40;
const MAX_DPR = 1.5;

/* Polinomio (1-t²)³ en vez de gaussiana: llega a cero EXACTO en el borde, así
   que todo lo de fuera del disco se dibuja como un tramo recto de dos puntos. */
const FALLOFF_SPAN = 2.6;

type Point = {
  x: number;
  y: number;
  lift: number;
  vx: number;
  vy: number;
  vl: number;
};

function spring(
  value: number,
  velocity: number,
  target: number,
  delta: number,
  stiffness = 135,
  damping = 22,
) {
  const acceleration = (target - value) * stiffness - velocity * damping;
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

  /* Refs y motor montado UNA vez: cuando `ambient` era dependencia, cada flip
     reconstruía el motor entero (observer, resize, redibujado) en pleno scroll. */
  const ambientRef = useRef(ambient);
  const reducedRef = useRef(reduced);

  const relaxRef = useRef<(() => void) | null>(null);

  const swellRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const was = ambientRef.current;
    ambientRef.current = ambient;
    reducedRef.current = reduced;
    if (ambient && !was) swellRef.current?.();
    relaxRef.current?.();
  }, [ambient, reduced]);

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

    /* Cuarto de resolución: la máscara es solo gradientes suaves, no hay
       frecuencia que sobreviva al escalado, y ocupa 1/16 de memoria. */
    const MASK_SCALE = 0.25;
    let mask: HTMLCanvasElement | null = null;

    /* Posición de la lámpara, 0..1 de esta caja. Se lee de las mismas custom
       properties que usan los gradientes del campo, así no pueden divergir. */
    let keyX = 0.5;
    let keyY = 0.62;

    const readKey = () => {
      const styles = getComputedStyle(canvas);
      const parse = (name: string, fallback: number) => {
        const value = Number.parseFloat(styles.getPropertyValue(name));
        return Number.isFinite(value) ? value / 100 : fallback;
      };
      keyX = parse("--hero-key-x", 0.5);
      keyY = parse("--hero-key-y", 0.62);
    };

    /* La máscara: dónde puede existir la grilla. Lleva la caída de la lámpara
       dentro, así la grilla es material iluminado y no una calca a alfa fijo. */
    const buildMask = (compact: boolean) => {
      const maskWidth = Math.max(1, Math.round(width * MASK_SCALE));
      const maskHeight = Math.max(1, Math.round(height * MASK_SCALE));
      if (!mask) mask = document.createElement("canvas");
      mask.width = maskWidth;
      mask.height = maskHeight;
      const maskContext = mask.getContext("2d");
      if (!maskContext) {
        mask = null;
        return;
      }

      /* 0.78 del diagonal deja la columna de copy a ~0.58 y las esquinas en el
         suelo. Más corto (0.62) hunde el copy a ~0.35 y aplana medio hero. */
      const reach = Math.hypot(maskWidth, maskHeight) * 0.78;
      const lamp = maskContext.createRadialGradient(
        keyX * maskWidth,
        keyY * maskHeight,
        0,
        keyX * maskWidth,
        keyY * maskHeight,
        reach,
      );
      lamp.addColorStop(0, "rgba(0,0,0,1)");
      lamp.addColorStop(0.42, "rgba(0,0,0,0.86)");
      lamp.addColorStop(1, `rgba(0,0,0,${compact ? 0.5 : 0.42})`);
      maskContext.fillStyle = lamp;
      maskContext.fillRect(0, 0, maskWidth, maskHeight);

      maskContext.globalCompositeOperation = "destination-in";
      const down = maskContext.createLinearGradient(0, 0, 0, maskHeight);
      down.addColorStop(0, "rgba(0,0,0,0)");
      down.addColorStop(compact ? 0.12 : 0.1, `rgba(0,0,0,${compact ? 0.8 : 0.68})`);
      down.addColorStop(0.42, `rgba(0,0,0,${compact ? 0.85 : 0.76})`);
      down.addColorStop(compact ? 0.68 : 0.66, "rgba(0,0,0,1)");
      down.addColorStop(compact ? 0.94 : 0.98, "rgba(0,0,0,0)");
      maskContext.fillStyle = down;
      maskContext.fillRect(0, 0, maskWidth, maskHeight);

      if (!compact) {
        const across = maskContext.createLinearGradient(0, 0, maskWidth, 0);
        across.addColorStop(0, "rgba(0,0,0,0)");
        across.addColorStop(0.08, "rgba(0,0,0,1)");
        across.addColorStop(0.92, "rgba(0,0,0,1)");
        across.addColorStop(1, "rgba(0,0,0,0)");
        maskContext.fillStyle = across;
        maskContext.fillRect(0, 0, maskWidth, maskHeight);
      }

      maskContext.globalCompositeOperation = "source-over";
    };

    const applyFade = () => {
      if (!mask) return;
      context.globalCompositeOperation = "destination-in";

      context.drawImage(mask, 0, 0, width, height);
      context.globalCompositeOperation = "source-over";
    };

    const current: Point = { x: 0, y: 0, lift: 0, vx: 0, vy: 0, vl: 0 };
    const target = { x: 0, y: 0, lift: 0 };

    let outX = 0;
    let outY = 0;

    /* Escribe en outX/outY en vez de devolver: a decenas de miles de llamadas
       por segundo, un {x,y} por muestra es basura pura para el recolector. */
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

    /* Subdivide SOLO el tramo que el domo toca de verdad. Con el puntero quieto
       cada línea es un segmento y la grilla entera cuesta unos sesenta. */
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
      minorAlpha = 1,
    ) => {
      if (minorAlpha < 1) context.globalAlpha = minorAlpha;
      context.strokeStyle = minorStyle;
      context.lineWidth = highlighted ? 0.85 : 0.65;
      context.stroke(paths.minor);
      if (minorAlpha < 1) context.globalAlpha = 1;

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
        "rgba(116, 195, 213, 0.075)",
        "rgba(202, 237, 244, 0.137)",
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

        context.save();
        context.beginPath();
        context.arc(current.x, current.y, radius + 24, 0, Math.PI * 2);
        context.clip();

        strokeGrid(paths, lineReflection, lineReflection, true, 0.55);
        context.restore();
      }

      applyFade();
    };

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000 || 1 / 60, 1 / 30);
      lastTime = time;

      [current.x, current.vx] = spring(current.x, current.vx, target.x, delta);
      [current.y, current.vy] = spring(current.y, current.vy, target.y, delta);

      /* Asimétrico: sube con el spring tenso y SUELTA con uno más blando —
         los materiales ceden rápido y se asientan despacio. */
      const releasing = target.lift < current.lift;
      [current.lift, current.vl] = spring(
        current.lift,
        current.vl,
        target.lift,
        delta,
        releasing ? 62 : 135,
        releasing ? 17 : 22,
      );
      draw();

      const moving =
        Math.abs(current.x - target.x) > 0.08 ||
        Math.abs(current.y - target.y) > 0.08 ||
        Math.abs(current.lift - target.lift) > 0.002 ||
        Math.abs(current.vx) > 0.08 ||
        Math.abs(current.vy) > 0.08 ||
        Math.abs(current.vl) > 0.002;

      /* No se corta por `ambient`: un domo a medio levantar se congelaría en el
         bitmap y el lector lo encontraría al volver hacia arriba. */
      frame = moving && !reducedRef.current ? requestAnimationFrame(animate) : 0;
    };

    const requestDraw = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    };

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    relaxRef.current = () => {
      if (ambientRef.current || target.lift === 0) return;
      target.lift = 0;
      requestDraw();
    };

    let swellTimer = 0;
    let swelled = false;
    swellRef.current = () => {
      if (finePointer || reducedRef.current || swelled) return;
      swelled = true;

      target.x = keyX * width;
      target.y = keyY * height;
      target.lift = 1;
      requestDraw();
      swellTimer = window.setTimeout(() => {
        target.lift = 0;
        requestDraw();
      }, 620);
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

      readKey();
      buildMask(compact);
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
      if (!ambientRef.current || reducedRef.current) return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    };

    const onPointerLeave = () => {
      if (target.lift === 0) return;
      target.lift = 0;
      requestDraw();
    };

    const invalidateRect = () => {
      rectStale = true;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", invalidateRect, { passive: true });
      window.addEventListener("resize", invalidateRect, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      relaxRef.current = null;
      swellRef.current = null;

      mask = null;
      if (swellTimer) window.clearTimeout(swellTimer);
      if (frame) cancelAnimationFrame(frame);
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", invalidateRect);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />;
}
