"use client";

import type { Service } from "@/components/services/data";
import BpoScene from "./scenes/BpoScene";
import CallCenterScene from "./scenes/CallCenterScene";
import SystemsScene from "./scenes/SystemsScene";

export default function SlideBackdrop({
  service,
  active,
}: {
  service: Service;
  active: boolean;
}) {
  return (
    <div aria-hidden className="cq-v2-layer">

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(70% 55% at 50% 18%, color-mix(in srgb, var(--svc) 16%, transparent), transparent 70%),
            radial-gradient(60% 50% at 50% 108%, color-mix(in srgb, var(--svc-glow) 14%, transparent), transparent 72%)
          `,
        }}
      />

      {service.id === "call-center" && <CallCenterScene active={active} />}
      {service.id === "bpo" && <BpoScene />}
      {service.id === "systems" && <SystemsScene />}
    </div>
  );
}
