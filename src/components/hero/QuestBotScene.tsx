"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { TransitionLink } from "@/components/TransitionLink";
import { dict } from "@/lib/dictionary";
import { INTRO_TAIL_MS, SCENE, sceneAt } from "./animation";
import styles from "./QuestBotScene.module.css";

/* Ritmo humano: un metrónomo fijo se lee como una máquina imprimiendo una
   cadena. El jitter se genera en un efecto, nunca en SSR (hidratación). */
const CHAR_MIN_MS = 38;
const CHAR_JITTER_MS = 54;
const WORD_PAUSE_MS = 155;
const WORD_PAUSE_JITTER_MS = 80;

function keystrokeDelay(previousChar: string): number {
  return previousChar === " "
    ? WORD_PAUSE_MS + Math.random() * WORD_PAUSE_JITTER_MS
    : CHAR_MIN_MS + Math.random() * CHAR_JITTER_MS;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function QuestBotScene({
  reduced,
  ambient,
  onIntroDone,
  onReplayStart,
  pinnedQuestionIndex = null,
}: {
  reduced: boolean;

  ambient: boolean;

  onIntroDone?: () => void;

  onReplayStart?: () => void;

  pinnedQuestionIndex?: number | null;
}) {
  const questions = dict.hero.questions;
  const [runId, setRunId] = useState(0);

  /* Solo al terminar de montarse empieza a seguir el puntero: una mirada que
     pelea con la entrada se lee como un glitch. */
  const [settled, setSettled] = useState(false);

  const [said, setSaid] = useState(false);
  const [replayReady, setReplayReady] = useState(false);

  /* Aparte de `settled`: la burbuja llega a 2.85s y el montaje acaba a 3.4s —
     medio segundo con un link invisible ya tabulable. */
  const [sayReady, setSayReady] = useState(false);

  const [inFrame, setInFrame] = useState(true);

  const [cycling, setCycling] = useState(false);

  const [displayIndex, setDisplayIndex] = useState(0);
  const lastIndexRef = useRef(0);

  /* Ref y no estado: el loop del ciclo no debe reiniciarse (ni cancelar su
     timer en vuelo) en cada cambio de hover. */
  const pinnedRef = useRef<number | null>(pinnedQuestionIndex);

  const jumpToRef = useRef<(index: number) => void>(() => {});
  const resumeRef = useRef<() => void>(() => {});
  const stageRef = useRef<HTMLDivElement>(null);
  const typedLineRef = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  const introDoneRef = useRef(onIntroDone);
  useEffect(() => {
    introDoneRef.current = onIntroDone;
  }, [onIntroDone]);

  /* Mirada: springs y no tweens porque el puntero es una entrada continua e
     interrumpible — la velocidad tiene que sobrevivir a un cambio de dirección. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const gazeSpring = { stiffness: 110, damping: 20, mass: 0.9 } as const;
  const smoothX = useSpring(pointerX, gazeSpring);
  const smoothY = useSpring(pointerY, gazeSpring);

  /* Dos profundidades: la cabeza va delante y el cuerpo detrás, para que la
     mascota se lea como un objeto con masa y no como una calca deslizándose. */
  const gazeX = useTransform(smoothX, [-1, 1], [-9, 9]);
  const gazeY = useTransform(smoothY, [-1, 1], [-6, 6]);
  const leanX = useTransform(smoothX, [-1, 1], [-4.5, 4.5]);
  const leanY = useTransform(smoothY, [-1, 1], [-2.5, 2.5]);

  const dilate = useMotionValue(1);
  const dilateSpring = useSpring(dilate, { stiffness: 260, damping: 22 });

  const beginRun = useCallback(() => {
    startedRef.current = true;
    setSettled(false);
    setSaid(false);
    setReplayReady(false);
    setSayReady(false);
    setCycling(false);
    setDisplayIndex(0);
    lastIndexRef.current = 0;
    if (typedLineRef.current) typedLineRef.current.textContent = "";
    setRunId((id) => id + 1);
  }, []);

  const replay = useCallback(() => {
    if (!replayReady) return;
    onReplayStart?.();
    beginRun();
  }, [beginRun, onReplayStart, replayReady]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      if (!startedRef.current) beginRun();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        setInFrame(entry.isIntersecting);

        if (entry.intersectionRatio >= 0.24 && !startedRef.current) beginRun();
      },
      { threshold: [0, 0.25] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [beginRun]);

  const alive = ambient && inFrame;

  useEffect(() => {
    if (runId === 0) return;
    const timers: number[] = [];
    if (reduced) {
      timers.push(window.setTimeout(() => setSayReady(true), 0));
      timers.push(window.setTimeout(() => setSettled(true), 0));
    } else {
      timers.push(window.setTimeout(() => setSayReady(true), sceneAt(SCENE.say)));
      timers.push(window.setTimeout(() => setSettled(true), sceneAt(SCENE.settled)));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [runId, reduced]);

  useEffect(() => {
    if (!settled || reduced || !alive) return;
    const node = stageRef.current;
    if (!node) return;

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    /* Medir en cada pointermove forzaría un layout síncrono decenas de veces
       por segundo. El rect se cachea y solo se relee dentro de un rAF. */
    let frame = 0;
    let stale = true;
    let rect: DOMRect | null = null;
    let clientX = 0;
    let clientY = 0;

    const invalidate = () => {
      stale = true;
    };

    const apply = () => {
      frame = 0;
      if (stale || !rect) {
        rect = node.getBoundingClientRect();
        stale = false;
      }
      if (!rect.width || !rect.height) return;
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((clientY - rect.top) / rect.height) * 2 - 1;
      pointerX.set(Math.max(-1.4, Math.min(1.4, nx)));
      pointerY.set(Math.max(-1.4, Math.min(1.4, ny)));
    };

    const onMove = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [settled, reduced, alive, pointerX, pointerY]);

  useEffect(() => {
    if (runId === 0) return;
    const line = questions[0];

    const timers: number[] = [];

    if (reduced) {
      timers.push(
        window.setTimeout(() => {
          if (typedLineRef.current) typedLineRef.current.textContent = line;
          setSaid(true);
          setReplayReady(true);
          introDoneRef.current?.();
        }, 0),
      );
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    const type = (i: number) => {
      if (typedLineRef.current) {
        typedLineRef.current.textContent = line.slice(0, i);
      }
      if (i < line.length) {
        timers.push(window.setTimeout(() => type(i + 1), keystrokeDelay(line[i - 1] ?? "")));
        return;
      }

      setSaid(true);
      timers.push(
        window.setTimeout(() => {
          setReplayReady(true);
          introDoneRef.current?.();

          setCycling(true);
        }, INTRO_TAIL_MS),
      );
    };

    timers.push(window.setTimeout(() => type(0), sceneAt(SCENE.type)));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [runId, reduced, questions]);

  useEffect(() => {
    pinnedRef.current = pinnedQuestionIndex;
    if (pinnedQuestionIndex !== null) jumpToRef.current(pinnedQuestionIndex);
    else resumeRef.current();
  }, [pinnedQuestionIndex]);

  useEffect(() => {
    if (!cycling || reduced || !alive) return;

    let disposed = false;
    let timer = 0;
    let shown = lastIndexRef.current;

    /* Una pausa pudo dejar el DOM a medio borrar o a medio teclear. Se redibuja
       la última pregunta buena antes de nada, para reanudar desde algo conocido. */
    if (typedLineRef.current) typedLineRef.current.textContent = questions[shown];

    const ERASE_MS = 26;
    const HOLD_MS = 2400;
    const GAP_MS = 380;

    const typeQuestion = (index: number) => {
      shown = index;
      lastIndexRef.current = index;
      setDisplayIndex(index);
      const q = questions[index];
      const step = (i: number) => {
        if (disposed) return;
        if (typedLineRef.current) typedLineRef.current.textContent = q.slice(0, i);
        if (i < q.length) {
          timer = window.setTimeout(() => step(i + 1), keystrokeDelay(q[i - 1] ?? ""));
          return;
        }
        timer = window.setTimeout(settle, HOLD_MS);
      };
      step(0);
    };

    const eraseThen = (next: () => void) => {
      const step = () => {
        if (disposed) return;
        const text = typedLineRef.current?.textContent ?? "";
        if (!text.length) {
          timer = window.setTimeout(next, GAP_MS);
          return;
        }
        if (typedLineRef.current) typedLineRef.current.textContent = text.slice(0, -1);
        timer = window.setTimeout(step, ERASE_MS);
      };
      step();
    };

    const advance = () => {
      if (disposed) return;
      eraseThen(() => typeQuestion((shown + 1) % questions.length));
    };

    const settle = () => {
      if (disposed || pinnedRef.current !== null) return;
      advance();
    };

    jumpToRef.current = (index) => {
      if (disposed || index === shown) return;
      window.clearTimeout(timer);
      eraseThen(() => typeQuestion(index));
    };
    resumeRef.current = () => {
      if (disposed) return;
      window.clearTimeout(timer);
      advance();
    };

    timer = window.setTimeout(settle, HOLD_MS);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      jumpToRef.current = () => {};
      resumeRef.current = () => {};
    };
  }, [cycling, reduced, alive, questions]);

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      data-replay-ready={replayReady ? "true" : "false"}
    >
      <div
        key={runId}
        className={cx(styles.robot, runId > 0 && styles.run)}
        data-ambient={alive ? "on" : "off"}
        data-said={said ? "true" : "false"}
      >

        <svg
          className={styles.svgScene}
          viewBox="-40 0 1200 432"
          aria-hidden
          onClick={replay}
        >
          <defs>
            <radialGradient id="qbLensGrad" cx="34%" cy="30%" r="72%">
              <stop offset="0%" stopColor="#F2FFFE" />
              <stop offset="34%" stopColor="#7FE9E4" />
              <stop offset="100%" stopColor="#0C5C6B" />
            </radialGradient>
            <radialGradient id="qbShadowGrad">
              <stop offset="0%" stopColor="#01080F" stopOpacity=".9" />
              <stop offset="100%" stopColor="#01080F" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="qbHalo">
              <stop offset="0%" stopColor="#7FE9E4" stopOpacity=".34" />
              <stop offset="52%" stopColor="#3080A2" stopOpacity=".14" />
              <stop offset="100%" stopColor="#3080A2" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="qbFlash">
              <stop offset="0%" stopColor="#9BF3EE" stopOpacity=".55" />
              <stop offset="100%" stopColor="#9BF3EE" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="qbFloor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3080A2" stopOpacity="0" />
              <stop offset="48%" stopColor="#63B6D6" stopOpacity=".5" />
              <stop offset="100%" stopColor="#3080A2" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect x="90" y="379" width="1020" height="1.6" fill="url(#qbFloor)" />

          <g className={styles.travel} aria-hidden="true">
            <g transform="translate(-52,368)">
              <circle className={cx(styles.puff, styles.p1)} r="12" fill="#63B6D6" opacity="0" />
              <circle className={cx(styles.puff, styles.p2)} cx="-15" cy="4" r="8" fill="#7FE9E4" opacity="0" />
              <circle className={cx(styles.puff, styles.p3)} cx="9" cy="6" r="10" fill="#63B6D6" opacity="0" />
              <circle className={cx(styles.puff, styles.p4)} cx="-26" cy="-2" r="6" fill="#7FE9E4" opacity="0" />
              <circle className={cx(styles.puff, styles.p5)} cx="20" cy="2" r="7.5" fill="#63B6D6" opacity="0" />
            </g>
          </g>

          <g className={styles.travel}>
            <g transform="translate(0,305)">
              <ellipse className={styles.shadow} cx="0" cy="75" rx="80" ry="13" fill="url(#qbShadowGrad)" />
              <ellipse className={styles.floorFlash} cx="0" cy="75" rx="165" ry="26" fill="url(#qbFlash)" opacity="0" />
              <ellipse
                className={styles.impact}
                cx="0"
                cy="75"
                rx="52"
                ry="10"
                fill="none"
                stroke="#7FE9E4"
                strokeWidth="2.6"
                opacity="0"
              />

              <g className={styles.rise}>
                <path
                  className={styles.cradle}
                  d="M -56.4 59.7 A 65.2 65.2 0 1 0 56.4 59.7"
                  fill="none"
                  stroke="#3080a2"
                  strokeWidth="19.6"
                  strokeLinecap="butt"
                />

                <g className={styles.cradleDetail} transform="translate(0,92.3)">
                  <g stroke="#04101A" strokeOpacity=".26" strokeWidth="3.2">
                    <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(180)" />
                    <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(135)" />
                    <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(90)" />
                    <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(45)" />
                    <line x1="55.4" y1="0" x2="75" y2="0" />
                  </g>
                  <path
                    d="M -63 -16.9 A 65.2 65.2 0 0 0 -56.5 32.6"
                    fill="none"
                    stroke="#fff"
                    strokeOpacity=".17"
                    strokeWidth="7"
                    strokeLinecap="round"
                    pointerEvents="none"
                  />
                  <circle className={cx(styles.footlight, styles.fl)} cx="-56.5" cy="-32.6" r="4.4" fill="#7FE9E4" />
                  <circle className={cx(styles.footlight, styles.fr)} cx="56.5" cy="-32.6" r="4.4" fill="#7FE9E4" />
                </g>

                <g className={styles.idle}>
                  <g className={styles.bob}>

                    <motion.g style={{ x: leanX, y: leanY }}>
                      <circle className={styles.halo} cx="0" cy="0" r="132" fill="url(#qbHalo)" opacity="0" />

                      <g className={styles.stem}>
                        <rect x="55.4" y="-81.2" width="19.6" height="87" fill="#3080a2" />
                        <circle className={styles.tip} cx="65.2" cy="-79" r="7" fill="#FFB84D" opacity="0" />
                      </g>

                      <g className={styles.spin}>
                        <circle cx="0" cy="0" r="65.2" fill="none" stroke="#3080a2" strokeWidth="19.6" />
                        <g stroke="#04101A" strokeOpacity=".26" strokeWidth="3.2">
                          <line x1="55.4" y1="0" x2="75" y2="0" />
                          <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(60)" />
                          <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(120)" />
                          <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(180)" />
                          <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(240)" />
                          <line x1="55.4" y1="0" x2="75" y2="0" transform="rotate(300)" />
                        </g>
                        <circle className={styles.pip} cx="0" cy="-65.2" r="5" fill="#7FE9E4" />
                      </g>

                      <path
                        d="M -46 -46 A 65.2 65.2 0 0 1 6 -65"
                        fill="none"
                        stroke="#fff"
                        strokeOpacity=".18"
                        strokeWidth="7"
                        strokeLinecap="round"
                        pointerEvents="none"
                      />

                      <motion.g style={{ x: gazeX, y: gazeY }}>
                        <motion.g
                          className={styles.coreDilate}
                          style={{ scale: dilateSpring }}
                        >
                          <g className={styles.core}>
                            <circle cx="2" cy="-2" r="24" fill="#06202C" opacity=".55" />
                            <circle cx="2" cy="-2" r="21" fill="none" stroke="#3080a2" strokeOpacity=".7" strokeWidth="2.4" />
                            <circle className={styles.lens} cx="2" cy="-2" r="16" fill="url(#qbLensGrad)" opacity=".12" />
                            <circle cx="-3" cy="-8" r="4.6" fill="#fff" opacity=".85" />
                          </g>
                        </motion.g>
                      </motion.g>
                    </motion.g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>

        <div className={styles.say}>
          <TransitionLink
            href="/quote"
            aria-label={`${questions[displayIndex]} ${dict.hero.sayCtaSuffix}`}
            className={styles.sayBox}
            inert={!sayReady}

            onPointerEnter={() => {
              if (!reduced && settled) dilate.set(1.06);
            }}
            onPointerLeave={() => dilate.set(1)}
            onFocus={() => {
              if (reduced || !settled) return;
              dilate.set(1.06);
              pointerX.set(0.55);
              pointerY.set(-0.7);
            }}
            onBlur={() => {
              dilate.set(1);
              pointerX.set(0);
              pointerY.set(0);
            }}
          >

            <div aria-hidden className={styles.sayEyebrow}>
              <span className={styles.presence} />
              {dict.hero.onlineLabel}
            </div>
            <div aria-hidden className={styles.sayLine}>
              <span ref={typedLineRef} />
              <span className={styles.caret} />
            </div>
          </TransitionLink>
        </div>
      </div>

      {/* La mascota es decorativa (aria-hidden), así que su click-para-repetir
          era inalcanzable por teclado. Este es el control real. */}
      <button
        type="button"
        onClick={replay}
        inert={!replayReady}
        className={styles.replay}
        aria-label={dict.hero.replayLabel}
      >
        <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M13.5 8a5.5 5.5 0 1 1-1.7-3.97" />
          <path d="M13.6 2.2v2.9h-2.9" />
        </svg>
      </button>
    </div>
  );
}
