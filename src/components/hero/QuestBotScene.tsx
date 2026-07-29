"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./QuestBotScene.module.css";

const TYPE_SPEED_MS = 58;
const TYPE_START_DELAY_MS = 3000;

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function QuestBotScene({ reduced }: { reduced: boolean }) {
  const { dict } = useI18n();
  const line = dict.hero.typedLine;
  const [runId, setRunId] = useState(0);
  const [typed, setTyped] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const hasPlayedRef = useRef(false);

  const replay = () => {
    hasPlayedRef.current = true;
    setRunId((id) => id + 1);
  };

  useEffect(() => {
    if (hasPlayedRef.current) return;

    const node = stageRef.current;
    if (reduced || !node || !("IntersectionObserver" in window)) {
      const id = window.setTimeout(replay, 0);
      return () => window.clearTimeout(id);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          replay();
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (runId === 0) return;

    if (reduced) {
      const id = window.setTimeout(() => setTyped(line), 0);
      return () => window.clearTimeout(id);
    }

    const timers: number[] = [window.setTimeout(() => setTyped(""), 0)];
    function type(i: number) {
      setTyped(line.slice(0, i));
      if (i < line.length) {
        timers.push(window.setTimeout(() => type(i + 1), TYPE_SPEED_MS));
      }
    }
    timers.push(window.setTimeout(() => type(1), TYPE_START_DELAY_MS));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [runId, reduced, line]);

  return (
    <div ref={stageRef} className={styles.stage}>
      <div key={runId} className={cx(styles.robot, runId > 0 && styles.run)}>
        <svg
          className={styles.svgScene}
          viewBox="-40 0 1200 470"
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
            </g>
          </g>

          <g className={styles.travel}>
            <g transform="translate(0,305)">
              <ellipse className={styles.shadow} cx="0" cy="75" rx="80" ry="13" fill="url(#qbShadowGrad)" />

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

                    <g className={styles.core}>
                      <circle cx="2" cy="-2" r="24" fill="#06202C" opacity=".55" />
                      <circle cx="2" cy="-2" r="21" fill="none" stroke="#3080a2" strokeOpacity=".7" strokeWidth="2.4" />
                      <circle className={styles.lens} cx="2" cy="-2" r="16" fill="url(#qbLensGrad)" opacity=".12" />
                      <circle cx="-3" cy="-8" r="4.6" fill="#fff" opacity=".85" />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>

        <div className={styles.say}>
          <div className={styles.sayBox}>
            <div className={styles.sayEyebrow}>{dict.hero.onlineLabel}</div>
            <div className={styles.sayLine}>
              {typed}
              <span className={styles.caret} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
