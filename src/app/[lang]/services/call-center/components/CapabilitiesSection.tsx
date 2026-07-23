"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Arrow from "@/components/services/Arrow";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import container from "@/components/services/Container.module.css";
import { EASE_OUT, focusRiseVariants, groupVariants, VIEWPORT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { CALL_CENTER, CAPABILITY_DETAIL, CAPABILITY_META, CHANNEL_ICON } from "../data";
import styles from "./CapabilitiesSection.module.css";

const COPY = {
  en: {
    title: <>Capabilities built around<br />the conversation</>,
    description: "A clear structure for presenting what each service includes, how it works, and the benefit it creates for the client.",
    tablistLabel: "Call Center capabilities",
    selectedCapability: "Selected capability",
    whatItIncludes: "What it includes",
    clientBenefit: "Client benefit",
    channels: "Channels / touchpoints",
  },
  es: {
    title: <>Capacidades construidas<br />alrededor de la conversación</>,
    description: "Una estructura clara para presentar qué incluye cada servicio, cómo funciona y el beneficio que crea para el cliente.",
    tablistLabel: "Capacidades de Call Center",
    selectedCapability: "Capacidad seleccionada",
    whatItIncludes: "Qué incluye",
    clientBenefit: "Beneficio para el cliente",
    channels: "Canales / puntos de contacto",
  },
};

// Two independent renderings share the same data, same as DesktopNav /
// MobileNav: a tab strip + shared detail panel above `md` (mouse-driven,
// scanning many titles at once reads fine as tabs), and a plain vertical
// accordion below it (each capability opens in place — no separate panel to
// reconcile with, no horizontal strip to discover by scrolling).
export default function CapabilitiesSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  return (
    <section id="capabilities" className={styles.capabilitiesSection}>
      <div className={container.container}>
        <SectionIntro
          title={t.title}
          description={t.description}
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
  const { lang } = useI18n();
  const t = COPY[lang];
  const [activeId, setActiveId] = useState(CALL_CENTER.details[0].id);
  const activeIndex = CALL_CENTER.details.findIndex((item) => item.id === activeId);
  const active = CALL_CENTER.details[activeIndex];
  const activeMeta = CAPABILITY_META[active.id];
  const activeDetail = CAPABILITY_DETAIL[active.id];
  const activeTabId = `capability-tab-${activeIndex}`;
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
    setActiveId(CALL_CENTER.details[nextIndex].id);
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
      <motion.div className={styles.capabilityIndex} role="tablist" aria-label={t.tablistLabel} aria-orientation="vertical" variants={focusRiseVariants}>
        {CALL_CENTER.details.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              id={`capability-tab-${index}`}
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
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => handleCapabilityKeyDown(event, index)}
            >
              {/* The active highlight is one shared element that glides from
                  tab to tab (layoutId), instead of switching on and off in
                  place. Under reduced motion it renders without the id and
                  simply appears. */}
              {selected && (
                <motion.span
                  aria-hidden
                  className={styles.tabInk}
                  layoutId={reduced ? undefined : "cc-capability-ink"}
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                />
              )}
              <span className={styles.tabNumber}>0{index + 1}</span><span className={styles.tabLabel}>{item.title[lang]}</span><Arrow className={styles.tabArrow} />
            </button>
          );
        })}
      </motion.div>

      <motion.div id="capability-panel" role="tabpanel" tabIndex={0} aria-labelledby={activeTabId} className={styles.capabilityPanel} variants={focusRiseVariants}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={active.id} initial={reduced ? false : { opacity: 0, x: 18, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={reduced ? undefined : { opacity: 0, x: -12, filter: "blur(3px)" }} transition={{ duration: reduced ? 0 : 0.36, ease: EASE_OUT }}>
            {/* The panel slides in as one sheet, but its blocks land on a
                cascade — heading first, then description, spec, channels —
                so a tab switch reads as content settling, not swapping. */}
            {[
              <div key="heading" className={styles.capabilityHeading}>
                <span className={styles.capabilityIcon}><ServiceIcon name={activeMeta.icon} /></span>
                <div><p>{t.selectedCapability}</p><h3>{active.title[lang]}</h3></div>
              </div>,
              <p key="description" className={styles.capabilityDescription}>{active.description[lang]}</p>,
              <div key="detail" className={styles.detailGrid}>
                <div>
                  <h4>{t.whatItIncludes}</h4>
                  <ul>{activeDetail.includes[lang].map((item) => (<li key={item}>{item}</li>))}</ul>
                </div>
                <div className={styles.clientBenefit}>
                  <h4>{t.clientBenefit}</h4>
                  <p>{activeDetail.benefit[lang]}</p>
                </div>
              </div>,
              <div key="channels" className={styles.channelRow}>
                <span>{t.channels}</span>
                <ul>{activeMeta.channels.map((channel) => (
                  <li key={channel.id}>
                    <span className={styles.channelIcon}><ServiceIcon name={CHANNEL_ICON[channel.id] ?? "messages"} /></span>
                    {channel.label[lang]}
                  </li>
                ))}</ul>
              </div>,
            ].map((block, order) => (
              <motion.div
                key={block.key}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay: reduced ? 0 : 0.05 + order * 0.06 }}
              >
                {block}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function MobileCapabilities({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const [openId, setOpenId] = useState<string | null>(CALL_CENTER.details[0].id);

  return (
    <motion.div
      className={styles.accordion}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      {CALL_CENTER.details.map((item, index) => {
        const meta = CAPABILITY_META[item.id];
        const detail = CAPABILITY_DETAIL[item.id];
        const open = item.id === openId;
        const panelId = `capability-accordion-panel-${index}`;

        return (
          <motion.div key={item.id} className={styles.accordionItem} data-active={open || undefined} variants={focusRiseVariants}>
            <button
              type="button"
              id={`capability-accordion-header-${index}`}
              className={styles.accordionHeader}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
            >
              <span className={styles.accordionNumber}>0{index + 1}</span>
              <span className={styles.accordionIcon}><ServiceIcon name={meta.icon} /></span>
              <span className={styles.accordionTitle}>{item.title[lang]}</span>
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
                    <p className={styles.capabilityDescription}>{item.description[lang]}</p>
                    <div className={styles.detailGrid}>
                      <div>
                        <h4>{t.whatItIncludes}</h4>
                        <ul>{detail.includes[lang].map((line) => (<li key={line}>{line}</li>))}</ul>
                      </div>
                      <div className={styles.clientBenefit}>
                        <h4>{t.clientBenefit}</h4>
                        <p>{detail.benefit[lang]}</p>
                      </div>
                    </div>
                    <div className={styles.channelRow}>
                      <span>{t.channels}</span>
                      <ul>{meta.channels.map((channel) => (
                        <li key={channel.id}>
                          <span className={styles.channelIcon}><ServiceIcon name={CHANNEL_ICON[channel.id] ?? "messages"} /></span>
                          {channel.label[lang]}
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
