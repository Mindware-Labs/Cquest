import type { CSSProperties } from "react";
import CapabilityCarousel from "./CapabilityCarousel";
import { SERVICE_PANEL_ID, type Service } from "./data";
import ServiceIcon from "./ServiceIcon";

type ServicePanelProps = {
  service: Service;
  ambient: boolean;
  reduced: boolean;
  selected: boolean;
};

export default function ServicePanel({
  service,
  ambient,
  reduced,
  selected,
}: ServicePanelProps) {
  const identityIcon =
    service.id === "call-center" ? "headset" : service.id === "bpo" ? "layers" : "code";

  return (
    <section
      id={`${SERVICE_PANEL_ID}-${service.id}-panel`}
      data-panel={service.id}
      aria-labelledby={`${SERVICE_PANEL_ID}-${service.id}-label`}
      className="cq-service-panel"
      style={{ "--svc": service.color, "--svc-glow": service.glow } as CSSProperties}
    >
      <span aria-hidden className="cq-panel-spine" />
      <div className="cq-panel-identity relative flex items-center gap-3">
        <span className="cq-panel-chip flex h-12 w-12 shrink-0 items-center justify-center">
          <ServiceIcon name={identityIcon} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="cq-panel-eyebrow">Business line</p>
          <p className="cq-panel-label mt-0.5 text-[.95rem] font-semibold text-foreground">
            {service.label}
          </p>
        </div>
      </div>
      <span aria-hidden className="cq-panel-label-rule relative mt-6 block" />
      <h2
        className="cq-panel-headline relative mt-7 font-heading text-[clamp(1.5rem,2.4vw,1.95rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-foreground"
        style={{ textWrap: "balance" }}
      >
        <span className="cq-panel-headline-inner">{service.shortLabel}</span>
      </h2>
      <div className="cq-panel-summary relative mt-7">
        <p className="cq-panel-strapline max-w-[46ch] text-[.95rem] leading-relaxed text-foreground/90">
          {service.strapline}
        </p>
        <p className="cq-panel-description mt-2 max-w-[48ch] text-sm">{service.description}</p>
      </div>
      <CapabilityCarousel
        service={service}
        ambient={ambient}
        reduced={reduced}
        selected={selected}
      />
    </section>
  );
}
