"use client";

import ServiceIcon from "@/components/services/ServiceIcon";
import type { Service } from "@/components/services/data";

/* Capabilities as quiet tags. Deliberately STATIC — the living backdrop
   already carries this slide's motion, so the tags spend no boldness of
   their own: they borrow the hero CTA's rectangular language (2px radius,
   hairline, a 1px light catch along the top) at readout scale, tinted by
   the service colour, and simply ride the page turn with the rest of the
   copy. Each tag keeps its capability description as a native tooltip. */
export default function CapabilityTags({ service }: { service: Service }) {
  return (
    <ul className="mt-9 flex max-w-xl flex-wrap items-center justify-center gap-2 sm:gap-2.5">
      {service.details.map((detail) => (
        <li key={detail.title} title={detail.description} className="cq-cap">
          <ServiceIcon name={detail.icon} />
          <span>{detail.title}</span>
        </li>
      ))}
    </ul>
  );
}
