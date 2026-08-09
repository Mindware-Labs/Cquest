"use client";

import type { CSSProperties } from "react";
import { useIsPresent } from "motion/react";

const CALL_ROUTES = [
  { d: "M50 50 Q 26 46 14 22", x: 14, y: 22, delay: "0s" },
  { d: "M50 50 Q 76 42 86 18", x: 86, y: 18, delay: "-2.2s" },
  { d: "M50 50 Q 28 62 7 58", x: 7, y: 58, delay: "-4.7s" },
  { d: "M50 50 Q 72 64 93 62", x: 93, y: 62, delay: "-7s" },
  { d: "M50 50 Q 36 72 28 84", x: 28, y: 84, delay: "-9.3s" },
  { d: "M50 50 Q 66 74 72 88", x: 72, y: 88, delay: "-11.8s" },
] as const;

export default function CallCenterScene({ active }: { active: boolean }) {
  const isPresent = useIsPresent();
  const running = active && isPresent;
  return (
    <div className="absolute inset-0">

      <span className="cq-v2-halo" />

      <span className="cq-v2-ring" />
      <span className="cq-v2-ring" style={{ animationDelay: "-3.5s" }} />

      <div className="cq-v2-net" data-running={running ? "true" : "false"}>
        <svg viewBox="0 0 100 100" aria-hidden>

          <defs>
            <radialGradient id="cqNetGraticule" gradientUnits="userSpaceOnUse" cx="50" cy="50" r="50">
              <stop offset="0.54" stopColor="color-mix(in srgb, var(--svc) 30%, transparent)" stopOpacity="0" />
              <stop offset="0.76" stopColor="color-mix(in srgb, var(--svc) 30%, transparent)" stopOpacity="1" />
            </radialGradient>
            <radialGradient id="cqNetRoute" gradientUnits="userSpaceOnUse" cx="50" cy="50" r="50">
              <stop offset="0.54" stopColor="color-mix(in srgb, var(--svc) 45%, transparent)" stopOpacity="0" />
              <stop offset="0.76" stopColor="color-mix(in srgb, var(--svc) 45%, transparent)" stopOpacity="1" />
            </radialGradient>
            <radialGradient id="cqNetComet" gradientUnits="userSpaceOnUse" cx="50" cy="50" r="50">
              <stop offset="0.54" stopColor="var(--svc)" stopOpacity="0" />
              <stop offset="0.76" stopColor="var(--svc)" stopOpacity="1" />
            </radialGradient>
          </defs>
          <circle className="cq-v2-graticule" cx="50" cy="50" r="36" strokeDasharray="2 4.5" />
          <circle
            className="cq-v2-graticule"
            cx="50"
            cy="50"
            r="44"
            strokeDasharray="0.5 3.4"
            style={{ animationDirection: "reverse", animationDuration: "200s" }}
          />
          {CALL_ROUTES.map((route) => (
            <g key={route.d} style={{ "--cd": route.delay } as CSSProperties}>
              <path className="cq-v2-route" d={route.d} pathLength={1} />
              <path className="cq-v2-comet" d={route.d} pathLength={1} />
            </g>
          ))}
        </svg>
        {CALL_ROUTES.map((route) => (
          <span
            key={route.d}
            className="cq-v2-ping"
            style={
              { left: `${route.x}%`, top: `${route.y}%`, "--cd": route.delay } as CSSProperties
            }
          />
        ))}
      </div>
      <span
        className="cq-v2-orb cq-v2-orb--cc-a left-[-11rem] top-[-10rem] h-[34rem] w-[34rem]"
        style={{ "--orb": "color-mix(in srgb, var(--svc) 30%, transparent)" } as CSSProperties}
      />
      <span
        className="cq-v2-orb cq-v2-orb--cc-b bottom-[-13rem] right-[-10rem] h-[32rem] w-[32rem]"
        style={{ "--orb": "color-mix(in srgb, var(--svc-glow) 26%, transparent)" } as CSSProperties}
      />
    </div>
  );
}
