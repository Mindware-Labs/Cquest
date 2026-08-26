"use client";

import { useRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceId } from "@/components/services/data";
import { dict } from "@/lib/dictionary";
import { SERVICE_CARDS } from "../data";
import shell from "./step.module.css";
import styles from "./StepService.module.css";
import { Check } from "./icons";

export default function StepService({
  value,
  onSelect,
}: {
  value: ServiceId | null;
  onSelect: (id: ServiceId) => void;
}) {
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = SERVICE_CARDS.findIndex((service) => service.id === value);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = SERVICE_CARDS.length;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % count;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null) return;
    event.preventDefault();
    onSelect(SERVICE_CARDS[next].id);
    cardRefs.current[next]?.focus();
  };

  return (
    <div className={shell.step}>
      <header className={shell.stepHead}>
        <p className={shell.eyebrow}>{dict.wizard.step1.eyebrow}</p>
        <h2 className={shell.stepTitle}>{dict.wizard.step1.title}</h2>
        <p className={shell.stepLead}>{dict.wizard.step1.lead}</p>
      </header>

      <div
        className={styles.serviceGrid}
        role="radiogroup"
        aria-label={dict.wizard.step1.ariaLabel}
      >
        {SERVICE_CARDS.map((service, index) => {
          const selected = value === service.id;
          return (
            <button
              key={service.id}
              type="button"
              role="radio"
              aria-checked={selected}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}

              tabIndex={selectedIndex === -1 ? (index === 0 ? 0 : -1) : selected ? 0 : -1}
              onClick={() => onSelect(service.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
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
