"use client";

import { motion } from "motion/react";
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import {
  groupVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { BPO, CAPABILITY_DETAIL } from "../data";
import styles from "./CapabilitiesSection.module.css";

export default function CapabilitiesSection({ reduced }: { reduced: boolean }) {
  const total = BPO.details.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const slatRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Arrow keys move between the discipline spines (APG accordion pattern:
  // Tab reaches each header, arrows travel the set, Home/End jump to ends).
  const handleSlatKey = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % total;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + total) % total;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = total - 1;
    if (next === null) return;
    event.preventDefault();
    setActiveIndex(next);
    slatRefs.current[next]?.focus();
  };

  return (
    <section id="capabilities" className={styles.capabilitiesSection}>
      <div className={container.container}>
        <SectionIntro
          title={
            <>
              Six disciplines,
              <br />
              one standard
            </>
          }
          description="Every discipline meets the same operating standard. Open one to see exactly what it covers — and the benefit it hands back to you."
          reduced={reduced}
          accentColor="var(--bp-teal)"
        />
        <motion.div
          className={styles.rack}
          role="group"
          aria-label="BPO disciplines"
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {BPO.details.map((item, index) => {
            const detail = CAPABILITY_DETAIL[item.title];
            const active = index === activeIndex;
            return (
              <motion.div
                key={item.title}
                className={styles.slat}
                data-active={active || undefined}
                variants={softRiseVariants}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <button
                  ref={(node) => {
                    slatRefs.current[index] = node;
                  }}
                  type="button"
                  id={`bpo-tab-${index}`}
                  className={styles.slatSpine}
                  aria-expanded={active}
                  aria-controls={`bpo-panel-${index}`}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleSlatKey(event, index)}
                >
                  <span className={styles.slatNumber} aria-hidden>
                    0{index + 1}
                  </span>
                  <span className={styles.slatIcon} aria-hidden>
                    <ServiceIcon name={item.icon} />
                  </span>
                  <span className={styles.slatTitle}>{item.title}</span>
                  <svg
                    className={styles.slatChevron}
                    aria-hidden
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 8 5 5 5-5" />
                  </svg>
                </button>
                <div
                  className={styles.slatDetail}
                  id={`bpo-panel-${index}`}
                  role="region"
                  aria-label={item.title}
                  aria-hidden={!active}
                >
                  <div className={styles.slatDetailInner}>
                    <span className={styles.slatKicker}>
                      <span className={styles.slatKickerDot} aria-hidden />
                      Held to one SLA
                    </span>
                    <span className={styles.slatName}>{item.title}</span>
                    <p className={styles.slatLead}>{item.description}</p>
                    <div className={styles.slatPanels}>
                      <div className={styles.slatIncludes}>
                        <span className={styles.slatLabel}>
                          What it includes
                        </span>
                        <ul>
                          {detail.includes.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.slatBenefit}>
                        <span className={styles.slatLabel}>Client benefit</span>
                        <p>{detail.benefit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        <p className={styles.rackHint}>
          <span aria-hidden>—</span> Select a discipline to open its full spec.
          Every one runs under the same SLA.
        </p>
      </div>
    </section>
  );
}
