"use client";

import type { CSSProperties } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceId } from "@/components/services/data";
import { useI18n } from "@/i18n/I18nProvider";
import { SERVICE_CARDS } from "../data";
import shell from "./step.module.css";
import styles from "./StepService.module.css";
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
  const { dict, lang } = useI18n();
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
              <span className={styles.serviceLabel}>{service.label[lang]}</span>
              <span className={styles.serviceStrapline}>
                {service.strapline[lang]}
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
