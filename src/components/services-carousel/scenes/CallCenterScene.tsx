"use client";

import type { CSSProperties } from "react";

/* Call Center's connection map. Six flight-routes radiate from the glow
   behind the message; on a shared 14s clock a light streak (the call)
   departs the halo, rides its route and lands on a customer point that
   blooms exactly on arrival. Each route's --cd phase-shifts BOTH its
   streak and its landing ping, and the ping keyframes hold until the
   streak's 14%-of-cycle arrival — the sync is a CSS constant shared by
   construction, so no JS measurement is needed (the radar predecessor
   had to measure angles at runtime). The SVG viewBox and the square
   .cq-v2-net stage share the same 0–100 space, which lets each route's
   endpoint coords double as its ping's left/top percentages. Routes bow
   OUTWARD (around the reading column) and the SVG's radial mask fades
   them toward the origin, so every call visibly materializes leaving the
   glow and lands in the margins. Delays are slightly irregular on
   purpose — departures read as traffic, not a metronome. */
const CALL_ROUTES = [
  { d: "M50 50 Q 26 46 14 22", x: 14, y: 22, delay: "0s" },
  { d: "M50 50 Q 76 42 86 18", x: 86, y: 18, delay: "-2.2s" },
  { d: "M50 50 Q 28 62 7 58", x: 7, y: 58, delay: "-4.7s" },
  { d: "M50 50 Q 72 64 93 62", x: 93, y: 62, delay: "-7s" },
  { d: "M50 50 Q 36 72 28 84", x: 28, y: 84, delay: "-9.3s" },
  { d: "M50 50 Q 66 74 72 88", x: 72, y: 88, delay: "-11.8s" },
] as const;

export default function CallCenterScene() {
  return (
    <div className="absolute inset-0">
      {/* The exchange's heart: a bloom breathing on the half clock (7s),
          the origin every streak visibly departs from. */}
      <span className="cq-v2-halo" />
      {/* Emission rings leaving the heart every 3.5 seconds. */}
      <span className="cq-v2-ring" />
      <span className="cq-v2-ring" style={{ animationDelay: "-3.5s" }} />
      {/* The map: crawling meridians, the standing route network, the
          calls in flight, and their landing points. */}
      <div className="cq-v2-net">
        <svg viewBox="0 0 100 100" aria-hidden>
          {/* ── The origin fade ────────────────────────────────────────
              What used to be a CSS mask on this <svg>. The comets animate
              stroke-dashoffset, which repaints the whole SVG every frame,
              and a mask on the same element made the browser re-multiply
              alpha across the entire ~960px stage on each of those frames.
              Carried in the strokes instead: one radial ramp per paint,
              centred on the hub, going transparent at 54% of the half-box
              and fully opaque by 76% — the exact radii the mask used, so
              routes and streaks still materialize out of the glow and only
              reach full strength out in the margins.

              gradientUnits="userSpaceOnUse" pins the ramp to the viewBox
              (r=50 is half the 0–100 box), so it is the geometry that
              decides the fade, not each path's own bounding box. */}
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
            <radialGradient id="cqNetCometGlow" gradientUnits="userSpaceOnUse" cx="50" cy="50" r="50">
              <stop offset="0.54" stopColor="color-mix(in srgb, var(--svc-glow) 45%, transparent)" stopOpacity="0" />
              <stop offset="0.76" stopColor="color-mix(in srgb, var(--svc-glow) 45%, transparent)" stopOpacity="1" />
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
              <path className="cq-v2-comet cq-v2-comet-glow" d={route.d} pathLength={1} />
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
