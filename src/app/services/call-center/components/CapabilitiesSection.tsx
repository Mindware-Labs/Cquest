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

// Two independent renderings share the same data, same as DesktopNav /
// MobileNav: a tab strip + shared detail panel above `md` (mouse-driven,
// scanning many titles at once reads fine as tabs), and a plain vertical
// accordion below it (each capability opens in place — no separate panel to
// reconcile with, no horizontal strip to discover by scrolling).
export default function CapabilitiesSection({ reduced }: { reduced: boolean }) {
  return (
    <section id="capabilities" className={styles.capabilitiesSection}>
      <div className={container.container}>
        <SectionIntro
          title={<>Capabilities built around<br />the conversation</>}
          description="A clear structure for presenting what each service includes, how it works, and the benefit it creates for the client."
          reduced={reduced}
          accentColor="var(--cc-sky)"
        />
        <div className="hidden md:block">
          <DesktopCapabilities reduced={reduced} />
        </div>
        <div className="block md:hidden">
          <MobileCapabilities reduced={reduced} />
        </div>
      </div>
    </section>
  );
}

function DesktopCapabilities({ reduced }: { reduced: boolean }) {
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
  );
}

function MobileCapabilities({ reduced }: { reduced: boolean }) {
  const [openCapability, setOpenCapability] = useState<string | null>(CALL_CENTER.details[0].title);

  return (
    <motion.div
      className={styles.accordion}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      {CALL_CENTER.details.map((item, index) => {
        const meta = CAPABILITY_META[item.title];
        const detail = CAPABILITY_DETAIL[item.title];
        const open = item.title === openCapability;
        const panelId = `capability-accordion-panel-${index}`;

        return (
          <motion.div key={item.title} className={styles.accordionItem} data-active={open || undefined} variants={focusRiseVariants}>
            <button
              type="button"
              id={`capability-accordion-header-${index}`}
              className={styles.accordionHeader}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenCapability((current) => (current === item.title ? null : item.title))}
            >
              <span className={styles.accordionNumber}>0{index + 1}</span>
              <span className={styles.accordionIcon}><ServiceIcon name={meta.icon} /></span>
              <span className={styles.accordionTitle}>{item.title}</span>
              <ChevronIcon open={open} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={`capability-accordion-header-${index}`}
                  className={styles.accordionPanel}
                  initial={reduced ? undefined : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                >
                  <div className={styles.accordionPanelInner}>
                    <p className={styles.capabilityDescription}>{item.description}</p>
                    <div className={styles.detailGrid}>
                      <div>
                        <h4>What it includes</h4>
                        <ul>{detail.includes.map((line) => (<li key={line}>{line}</li>))}</ul>
                      </div>
                      <div className={styles.clientBenefit}>
                        <h4>Client benefit</h4>
                        <p>{detail.benefit}</p>
                      </div>
                    </div>
                    <div className={styles.channelRow}>
                      <span>Channels / touchpoints</span>
                      <ul>{meta.channels.map((channel) => (
                        <li key={channel}>
                          <span className={styles.channelIcon}><ServiceIcon name={CHANNEL_ICON[channel] ?? "messages"} /></span>
                          {channel}
                        </li>
                      ))}</ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={styles.accordionChevron}
      data-open={open || undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}
