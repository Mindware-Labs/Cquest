"use client";

import type { Service } from "@/components/services/data";
import BpoScene from "./scenes/BpoScene";
import CallCenterScene from "./scenes/CallCenterScene";
import SystemsScene from "./scenes/SystemsScene";

/* Each slide's living scene, themed to its business line and painted in its
   service colour (all layers read --svc/--svc-glow from the section).
   Rendered INSIDE the motion.article so the whole scene crossfades and
   travels with the page turn. Layer classes live in globals.css. */
export default function SlideBackdrop({ service }: { service: Service }) {
  return (
    <div aria-hidden className="cq-v2-layer">
      {/* Base ambient tint shared by every scene. */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(70% 55% at 50% 18%, color-mix(in srgb, var(--svc) 16%, transparent), transparent 70%),
            radial-gradient(60% 50% at 50% 108%, color-mix(in srgb, var(--svc-glow) 14%, transparent), transparent 72%)
          `,
        }}
      />

      {service.id === "call-center" && <CallCenterScene />}
      {service.id === "bpo" && <BpoScene />}
      {service.id === "systems" && <SystemsScene />}
    </div>
  );
}
