"use client";

import type { CSSProperties } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceId } from "@/components/services/data";
import { SERVICE_CARDS } from "../data";
import styles from "../wizard.module.css";
import { Check } from "./icons";

/* Step 1 — pick a business line. Three large radio cards, each carrying its own
   service colour (--svc) so hover/selection lights up in that line's identity,
   the same tint the rest of the wizard then adopts. */
export default function StepService({
  value,
  onSelect,
}: {
  value: ServiceId | null;
  onSelect: (id: ServiceId) => void;
}) {
  return (
    <div className={styles.step}>
      <header className={styles.stepHead}>
        <p className={styles.eyebrow}>Step 1 · Service</p>
        <h2 className={styles.stepTitle}>What can we help you with?</h2>
        <p className={styles.stepLead}>
          Pick the line of work closest to what you need — you&rsquo;ll refine
          the specifics next.
        </p>
      </header>

      <div
        className={styles.serviceGrid}
        role="radiogroup"
        aria-label="Business line"
      >
        {SERVICE_CARDS.map((service) => {
          const selected = value === service.id;
          return (
            <button
              key={service.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(service.id)}
              className={styles.serviceCard}
              data-selected={selected || undefined}
              style={
                {
                  "--svc": service.color,
                  "--svc-glow": service.glow,
                } as CSSProperties
              }
            >
              <span className={styles.serviceIcon} aria-hidden>
                <ServiceIcon name={service.leadIcon} />
              </span>
              <span className={styles.serviceLabel}>{service.label}</span>
              <span className={styles.serviceStrapline}>
                {service.strapline}
              </span>
              <span className={styles.serviceMark} aria-hidden>
                <Check className={styles.serviceCheck} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
