"use client";

import type { CSSProperties } from "react";

export default function BpoScene() {
  return (
    <>

      <div className="cq-v2-lattice" />

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
