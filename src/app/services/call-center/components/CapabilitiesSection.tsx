"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Arrow from "@/components/services/Arrow";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, focusRiseVariants, groupVariants, VIEWPORT } from "@/components/services/motion";
import { CALL_CENTER, CAPABILITY_DETAIL, CAPABILITY_META, CHANNEL_ICON } from "../data";
import styles from "./CapabilitiesSection.module.css";

// Capability tabs own their own selection state, isolated from the rest of
// the page — clicking a tab only re-renders this section, not the hero,
// process timeline, metrics or footer.
export default function CapabilitiesSection({ reduced }: { reduced: boolean }) {
  const [activeCapability, setActiveCapability] = useState(CALL_CENTER.details[0].title);
  const active = CALL_CENTER.details.find((item) => item.title === activeCapability)!;
  const activeMeta = CAPABILITY_META[active.title];
  const capabilityTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // ARIA APG Tabs pattern: arrow keys move focus AND selection (roving
  // tabindex — only the active tab sits in the normal Tab order).
  const handleCapabilityKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = CALL_CENTER.details.length;
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % count;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + count) % count;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = count - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    setActiveCapability(CALL_CENTER.details[nextIndex].title);
    capabilityTabRefs.current[nextIndex]?.focus();
  };

  return (
    <section id="capabilities" className={styles.capabilitiesSection}>
      <div className={container.container}>
        <SectionIntro
          title={<>Capabilities built around<br />the conversation</>}
          description="A clear structure for presenting what each service includes, how it works, and the benefit it creates for the client."
          reduced={reduced}
          accentColor="var(--cc-sky)"
        />
        <motion.div
          className={styles.capabilityLayout}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div className={styles.capabilityIndex} role="tablist" aria-label="Call Center capabilities" variants={focusRiseVariants}>
            {CALL_CENTER.details.map((item, index) => {
              const selected = item.title === activeCapability;
              return (
                <button
                  key={item.title}
                  ref={(node) => {
                    capabilityTabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="capability-panel"
                  tabIndex={selected ? 0 : -1}
                  className={styles.capabilityTab}
                  data-active={selected || undefined}
                  onClick={() => setActiveCapability(item.title)}
                  onKeyDown={(event) => handleCapabilityKeyDown(event, index)}
                >
                  <span className={styles.tabNumber}>0{index + 1}</span><span className={styles.tabLabel}>{item.title}</span><Arrow className={styles.tabArrow} />
                </button>
              );
            })}
          </motion.div>

          <motion.div id="capability-panel" role="tabpanel" className={styles.capabilityPanel} variants={focusRiseVariants}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active.title} initial={reduced ? false : { opacity: 0, x: 18, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={reduced ? undefined : { opacity: 0, x: -12, filter: "blur(3px)" }} transition={{ duration: reduced ? 0 : 0.36, ease: EASE_OUT }}>
                <div className={styles.capabilityHeading}>
                  <span className={styles.capabilityIcon}><ServiceIcon name={activeMeta.icon} /></span>
                  <div><p>Selected capability</p><h3>{active.title}</h3></div>
                </div>
                <p className={styles.capabilityDescription}>{active.description}</p>
                <div className={styles.detailGrid}>
                  <div>
                    <h4>What it includes</h4>
                    <ul>{CAPABILITY_DETAIL[active.title].includes.map((item) => (<li key={item}>{item}</li>))}</ul>
                  </div>
                  <div className={styles.clientBenefit}>
                    <h4>Client benefit</h4>
                    <p>{CAPABILITY_DETAIL[active.title].benefit}</p>
                  </div>
                </div>
                <div className={styles.channelRow}>
                  <span>Channels / touchpoints</span>
                  <ul>{activeMeta.channels.map((channel) => (
                    <li key={channel}>
                      <span className={styles.channelIcon}><ServiceIcon name={CHANNEL_ICON[channel] ?? "messages"} /></span>
                      {channel}
                    </li>
                  ))}</ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
