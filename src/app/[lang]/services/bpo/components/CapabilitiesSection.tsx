"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import {
  EASE_OUT,
  focusRiseVariants,
  groupVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { BPO, CAPABILITY_DETAIL } from "../data";
import styles from "./CapabilitiesSection.module.css";

const COPY = {
  en: {
    title: <>Six disciplines,<br />one standard</>,
    description: "Every discipline meets the same operating standard. Open one to see exactly what it covers — and the benefit it hands back to you.",
    groupLabel: "Operations disciplines",
    heldToOneSla: "Held to one SLA",
    rackHint: "Select a discipline to open its full spec. Every one runs under the same SLA.",
    whatItIncludes: "What it includes",
    clientBenefit: "Client benefit",
  },
  es: {
    title: <>Seis disciplinas,<br />un solo estándar</>,
    description: "Cada disciplina cumple el mismo estándar operativo. Abre una para ver exactamente qué cubre — y el beneficio que te entrega.",
    groupLabel: "Disciplinas de operaciones",
    heldToOneSla: "Bajo un solo SLA",
    rackHint: "Selecciona una disciplina para ver su ficha completa. Todas operan bajo el mismo SLA.",
    whatItIncludes: "Qué incluye",
    clientBenefit: "Beneficio para el cliente",
  },
};

// Two independent renderings share the same data: a horizontal rack of
// expanding slats above `lg` (mouse-driven, hover glides between them), and
// a plain vertical accordion below it (each discipline opens in place on
// tap — no hover state to fake, no fixed max-height to guess at).
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
          accentColor="var(--bp-teal)"
        />
        <div className="hidden lg:block">
          <DesktopCapabilities reduced={reduced} />
        </div>
        <div className="block lg:hidden">
          <MobileCapabilities reduced={reduced} />
        </div>
      </div>
    </section>
  );
}

function DesktopCapabilities({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
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
    <>
      <motion.div
        className={styles.rack}
        role="group"
        aria-label={t.groupLabel}
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={VIEWPORT}
        variants={groupVariants}
      >
          {BPO.details.map((item, index) => {
            const detail = CAPABILITY_DETAIL[item.id];
            const active = index === activeIndex;
            return (
              <motion.div
                key={item.id}
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
                  <span className={styles.slatTitle}>{item.title[lang]}</span>
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
                  aria-label={item.title[lang]}
                  aria-hidden={!active}
                >
                  <div className={styles.slatDetailInner}>
                    <span className={styles.slatKicker}>
                      <span className={styles.slatKickerDot} aria-hidden />
                      {t.heldToOneSla}
                    </span>
                    <span className={styles.slatName}>{item.title[lang]}</span>
                    <p className={styles.slatLead}>{item.description[lang]}</p>
                    <div className={styles.slatPanels}>
                      <div className={styles.slatIncludes}>
                        <span className={styles.slatLabel}>
                          {t.whatItIncludes}
                        </span>
                        <ul>
                          {detail.includes[lang].map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.slatBenefit}>
                        <span className={styles.slatLabel}>{t.clientBenefit}</span>
                        <p>{detail.benefit[lang]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </motion.div>
      <p className={styles.rackHint}>
        <span aria-hidden>—</span> {t.rackHint}
      </p>
    </>
  );
}

function MobileCapabilities({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.div
      className={styles.accordion}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      {BPO.details.map((item, index) => {
        const detail = CAPABILITY_DETAIL[item.id];
        const open = index === openIndex;
        const panelId = `bpo-accordion-panel-${index}`;

        return (
          <motion.div key={item.id} className={styles.accordionItem} data-active={open || undefined} variants={focusRiseVariants}>
            <button
              type="button"
              id={`bpo-accordion-header-${index}`}
              className={styles.accordionHeader}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex((current) => (current === index ? null : index))}
            >
              <span className={styles.accordionNumber}>0{index + 1}</span>
              <span className={styles.accordionIcon}><ServiceIcon name={item.icon} /></span>
              <span className={styles.accordionTitle}>{item.title[lang]}</span>
              <ChevronIcon open={open} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={`bpo-accordion-header-${index}`}
                  className={styles.accordionPanel}
                  initial={reduced ? undefined : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                >
                  <div className={styles.accordionPanelInner}>
                    <span className={styles.accordionKicker}>
                      <span className={styles.accordionKickerDot} aria-hidden />
                      {t.heldToOneSla}
                    </span>
                    <p className={styles.accordionLead}>{item.description[lang]}</p>
                    <div className={styles.accordionPanels}>
                      <div className={styles.accordionIncludes}>
                        <span className={styles.accordionLabel}>{t.whatItIncludes}</span>
                        <ul>{detail.includes[lang].map((line) => (<li key={line}>{line}</li>))}</ul>
                      </div>
                      <div className={styles.accordionBenefit}>
                        <span className={styles.accordionLabel}>{t.clientBenefit}</span>
                        <p>{detail.benefit[lang]}</p>
                      </div>
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
