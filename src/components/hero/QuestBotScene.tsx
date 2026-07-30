"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { INTRO_TAIL_MS, SCENE, sceneAt } from "./animation";
import styles from "./QuestBotScene.module.css";

/* Human typing rhythm. A fixed 58ms metronome reads as a machine printing a
   string; real typing clusters and then breathes at word boundaries. The
   jitter is generated in an effect, so it never runs during SSR and can't
   cause a hydration mismatch. */
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
}: {
  reduced: boolean;
  /** False when the hero is off-screen or the tab is hidden — parks the loops. */
  ambient: boolean;
  /**
   * Fired once, a beat after the mascot lands its last keystroke — the real
   * end of the intro. The keystroke delays are jittered, so the duration
   * cannot be predicted from the score; the scene has to report it.
   */
  onIntroDone?: () => void;
}) {
  const { dict } = useI18n();
  const line = dict.hero.typedLine;
  const [runId, setRunId] = useState(0);
  const [typed, setTyped] = useState("");
  /* True once the mascot has finished assembling. Only then does it start
     tracking the pointer — a gaze that fights the roll-in reads as a glitch. */
  const [settled, setSettled] = useState(false);
  /* True once the speech bubble has popped, which is when its link becomes
     real. Tracked separately from `settled` because the bubble arrives at
     2.85s and the assembly only finishes at 3.4s — half a second in which an
     invisible link would already be tabbable. */
  const [sayReady, setSayReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  /* Held in a ref so a new callback identity from the parent can't restart
     the typing effect — and so replaying the mascot never re-fires it. */
  const introDoneRef = useRef(onIntroDone);
  useEffect(() => {
    introDoneRef.current = onIntroDone;
  }, [onIntroDone]);

  /* ── Pointer gaze ──────────────────────────────────────────────────────
     Normalised -1..1 across the stage, run through a soft, slightly
     under-damped spring so the mascot's attention *drifts* to the cursor
     rather than snapping to it. Springs (not tweens) because the pointer is
     a continuous, interruptible input: velocity has to carry across a change
     of direction, which a fixed-duration transition cannot do. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const gazeSpring = { stiffness: 110, damping: 20, mass: 0.9 } as const;
  const smoothX = useSpring(pointerX, gazeSpring);
  const smoothY = useSpring(pointerY, gazeSpring);
  /* Two depths, so the head leads and the body follows — the mascot reads as
     an object with mass instead of a decal sliding around. Values are SVG
     user units (viewBox is 1240 wide), so they scale with the stage. */
  const gazeX = useTransform(smoothX, [-1, 1], [-9, 9]);
  const gazeY = useTransform(smoothY, [-1, 1], [-6, 6]);
  const leanX = useTransform(smoothX, [-1, 1], [-4.5, 4.5]);
  const leanY = useTransform(smoothY, [-1, 1], [-2.5, 2.5]);

  const replay = useCallback(() => {
    startedRef.current = true;
    setSettled(false);
    setSayReady(false);
    setTyped("");
    setRunId((id) => id + 1);
  }, []);

  /* One observer does both jobs: kick off the first run when the mascot comes
     into view, and keep reporting so we know when to park the idle loops. */
  useEffect(() => {
    const node = stageRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      if (!startedRef.current) replay();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) replay();
      },
      { threshold: 0.25 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [replay]);

  /* Arm the bubble's link when the bubble appears, and hand the mascot over
     to the pointer once the assembly has resolved. Under reduced motion the
     scene is already assembled and the bubble already visible, so the link is
     live immediately and there is no gaze to wait for. */
  useEffect(() => {
    if (runId === 0) return;
    const timers: number[] = [];
    if (reduced) {
      timers.push(window.setTimeout(() => setSayReady(true), 0));
    } else {
      timers.push(window.setTimeout(() => setSayReady(true), sceneAt(SCENE.say)));
      timers.push(window.setTimeout(() => setSettled(true), sceneAt(SCENE.settled)));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [runId, reduced]);

  useEffect(() => {
    if (!settled || reduced) return;
    const node = stageRef.current;
    if (!node) return;
    /* Touch devices have no hovering pointer to track, and a stray tap would
       leave the mascot staring off into a corner. */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    /* Measuring the stage on every pointermove would force a synchronous
       layout dozens of times a second. Instead the rect is cached and only
       re-read when scroll or resize has invalidated it, and the whole read
       happens inside one rAF — so at most one measurement per frame, and
       none at all while the pointer is still. */
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

    /* Listening on the window (not the stage) means the mascot notices the
       cursor approaching from across the hero, before it arrives. */
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
  }, [settled, reduced, pointerX, pointerY]);

  useEffect(() => {
    if (runId === 0) return;

    const timers: number[] = [];

    /* Reduced motion has no intro to wait out — release the page at once. */
    if (reduced) {
      timers.push(window.setTimeout(() => introDoneRef.current?.(), 0));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    const type = (i: number) => {
      setTyped(line.slice(0, i));
      if (i < line.length) {
        timers.push(window.setTimeout(() => type(i + 1), keystrokeDelay(line[i - 1] ?? "")));
        return;
      }
      /* Last keystroke has landed. This is the end of act one. */
      timers.push(window.setTimeout(() => introDoneRef.current?.(), INTRO_TAIL_MS));
    };
    /* type(0) writes the empty string first, so the line clears on the exact
       frame typing begins rather than eagerly during this render. */
    timers.push(window.setTimeout(() => type(0), sceneAt(SCENE.type)));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [runId, reduced, line]);

  /* Reduced motion skips the typewriter entirely — the greeting is simply
     there. Derived rather than pushed into state, so no cascading render. */
  const shown = reduced ? line : typed;

  return (
    <div ref={stageRef} className={styles.stage}>
      <div
        key={runId}
        className={cx(styles.robot, runId > 0 && styles.run)}
        data-ambient={ambient ? "on" : "off"}
      >
        {/* viewBox height trimmed from 470 to 432. The lowest thing the scene
            ever draws is the ground flash at its widest — absolute y ≈ 410 —
            so the old box carried 60 units of pure emptiness under the mascot
            that the layout then had to sit around. 432 keeps ~22 units of
            headroom. `.say` compensates via its `top` %; see the module CSS. */}
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
                    {/* Body lean — the slower of the two gaze depths. */}
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

                      {/* Eye — leads the body, so the head arrives first. */}
                      <motion.g style={{ x: gazeX, y: gazeY }}>
                        <g className={styles.core}>
                          <circle cx="2" cy="-2" r="24" fill="#06202C" opacity=".55" />
                          <circle cx="2" cy="-2" r="21" fill="none" stroke="#3080a2" strokeOpacity=".7" strokeWidth="2.4" />
                          <circle className={styles.lens} cx="2" cy="-2" r="16" fill="url(#qbLensGrad)" opacity=".12" />
                          <circle cx="-3" cy="-8" r="4.6" fill="#fff" opacity=".85" />
                        </g>
                      </motion.g>
                    </motion.g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>

        {/* The bubble is the mascot's ask, so it doubles as the route to the
            form that answers it. A real link, not a click handler: it has to
            survive middle-click, "open in new tab" and keyboard traversal.
            `inert` until the bubble has actually popped — before that it is a
            fully-transparent link lying across the mascot, which is exactly
            the sort of thing a keyboard user tabs into and cannot see. */}
        <div className={styles.say}>
          <LocalizedLink
            href="/quote"
            aria-label={dict.hero.sayCtaLabel}
            className={styles.sayBox}
            inert={!sayReady}
          >
            {/* aria-hidden: the accessible name comes from the label above.
                Mid-typing this line is a fragment ("dame tu mi"), which is
                worse than useless read aloud. */}
            <div aria-hidden className={styles.sayEyebrow}>{dict.hero.onlineLabel}</div>
            <div aria-hidden className={styles.sayLine}>
              {shown}
              <span className={styles.caret} />
            </div>
          </LocalizedLink>
        </div>
      </div>

      {/* The mascot itself is decorative and aria-hidden, so its click-to-replay
          was unreachable by keyboard and invisible to assistive tech. This is
          the real control; the click on the SVG survives as a redundant
          shortcut for people who discover it. */}
      <button
        type="button"
        onClick={replay}
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
