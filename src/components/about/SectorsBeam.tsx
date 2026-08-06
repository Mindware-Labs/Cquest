"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import ServiceIcon from "@/components/services/ServiceIcon";
import { useI18n } from "@/i18n/I18nProvider";
import { ABOUT_SECTORS } from "./data";
import styles from "./SectorsBeam.module.css";

const COPY = {
  en: {
    choose: "Choose a sector",
    listLabel: "Center Quest sectors",
    protocol: "CQ · Sector protocol",
    demandLabel: "What the operation must handle",
    servicesLabel: "Services that answer it",
    standard: "People who know the rules. Process that gets measured. Reporting that hides nothing.",
    caption: (sector: string) =>
      `Interactive sector brief. ${sector} is selected; the panel describes its operational demands and relevant Center Quest services.`,
  },
  es: {
    choose: "Elige un sector",
    listLabel: "Sectores de Center Quest",
    protocol: "CQ · Protocolo sectorial",
    demandLabel: "Lo que la operación debe resolver",
    servicesLabel: "Servicios que lo atienden",
    standard: "Gente que conoce las reglas. Procesos que se miden. Reportes que no esconden nada.",
    caption: (sector: string) =>
      `Ficha sectorial interactiva. ${sector} está seleccionado; el panel describe sus exigencias operativas y los servicios relevantes de Center Quest.`,
  },
};

const SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const;
const SELECTOR_HEADER_REM = 3.5;
const SELECTOR_ROW_REM = 5.1;

export default function SectorsBeam({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const [activeIndex, setActiveIndex] = useState(0);
  const [compact, setCompact] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = useId();
  const tabId = useId();
  const active = ABOUT_SECTORS[activeIndex];

  useEffect(() => {
    const query = window.matchMedia("(max-width: 64rem)");
    const update = () => setCompact(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const selectAndFocus = (nextIndex: number) => {
    const normalized = (nextIndex + ABOUT_SECTORS.length) % ABOUT_SECTORS.length;
    setActiveIndex(normalized);
    tabRefs.current[normalized]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = ABOUT_SECTORS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectAndFocus(nextIndex);
  };

  return (
    <motion.figure
      className={styles.controlBoard}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      style={{
        "--port-offset": `${SELECTOR_HEADER_REM + SELECTOR_ROW_REM * (activeIndex + 0.5)}rem`,
      } as CSSProperties}
    >
      <div className={styles.selector}>
        <div className={styles.selectorHeader}>
          <span className={styles.selectorTitle}>{t.choose}</span>
          <span className={styles.selectorCount} aria-hidden>
            {String(ABOUT_SECTORS.length).padStart(2, "0")}
          </span>
        </div>

        <div
          className={styles.sectorList}
          role="tablist"
          aria-orientation={compact ? "horizontal" : "vertical"}
          aria-label={t.listLabel}
        >
          {ABOUT_SECTORS.map((sector, index) => {
            const selected = index === activeIndex;

            return (
              <button
                key={sector.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={`${tabId}-${sector.id}`}
                type="button"
                role="tab"
                tabIndex={selected ? 0 : -1}
                aria-selected={selected}
                aria-controls={panelId}
                className={styles.sectorButton}
                data-active={selected || undefined}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {selected && (
                  <motion.span
                    className={styles.activeSurface}
                    layoutId="sector-active-surface"
                    transition={reduced ? { duration: 0 } : SPRING}
                  />
                )}
                <span className={styles.sectorIcon} aria-hidden>
                  <ServiceIcon name={sector.icon} />
                </span>
                <span className={styles.sectorLabel}>{sector.label[lang]}</span>
                <span className={styles.sectorArrow} aria-hidden />
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.connector} aria-hidden>
        <span className={styles.connectorArrow} />
      </div>

      <section
        id={panelId}
        className={styles.detail}
        role="tabpanel"
        aria-labelledby={`${tabId}-${active.id}`}
        tabIndex={0}
      >
        <div className={styles.detailTopline}>
          <span className={styles.protocolLabel}>
            <span className={styles.liveDot} aria-hidden />
            {t.protocol}
          </span>
          <span className={styles.position} aria-hidden>
            {String(activeIndex + 1).padStart(2, "0")} / {String(ABOUT_SECTORS.length).padStart(2, "0")}
          </span>
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={active.id}
            className={styles.detailContent}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.detailHeading}>
              <span className={styles.detailIcon} aria-hidden>
                <ServiceIcon name={active.icon} />
              </span>
              <h3>{active.label[lang]}</h3>
            </div>

            <div className={styles.demand}>
              <span className={styles.detailLabel}>{t.demandLabel}</span>
              <p>{active.focus[lang]}</p>
            </div>

            <div className={styles.services}>
              <span className={styles.detailLabel}>{t.servicesLabel}</span>
              <ul>
                {active.services[lang].map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className={styles.standard}>{t.standard}</p>
      </section>

      <figcaption className={styles.caption}>{t.caption(active.label[lang])}</figcaption>
    </motion.figure>
  );
}
