"use client";

import type { CSSProperties } from "react";

/* BPO's throughput field: a marching lattice frames the reading column while
   data streams run in safe bands at the very top and bottom — volume made
   visible, never across the text. */
export default function BpoScene() {
  return (
    <>
      {/* Volume, ordered: the marching lattice frames the field (its
          mask keeps the whole reading column dot-free). */}
      <div className="cq-v2-lattice" />
      {/* Data streams confined to safe bands at the very top and
          bottom — throughput made visible, never across the text. */}
      <span className="cq-v2-stream top-[7%]" />
      <span
        className="cq-v2-stream top-[13%]"
        style={{ animationDelay: "-7s", animationDuration: "15s" }}
      />
      <span
        className="cq-v2-stream top-[84%]"
        style={{ animationDelay: "-3s", animationDuration: "10s" }}
      />
      <span
        className="cq-v2-stream top-[89%]"
        style={{ animationDelay: "-9s", animationDuration: "13s" }}
      />
      <span
        className="cq-v2-orb cq-v2-orb--bpo-a left-[-12rem] bottom-[-12rem] h-[34rem] w-[34rem]"
        style={{ "--orb": "color-mix(in srgb, var(--svc) 26%, transparent)" } as CSSProperties}
      />
      <span
        className="cq-v2-orb cq-v2-orb--bpo-b right-[-10rem] top-[-11rem] h-[30rem] w-[30rem]"
        style={{ "--orb": "color-mix(in srgb, var(--svc-glow) 18%, transparent)" } as CSSProperties}
      />
    </>
  );
}
