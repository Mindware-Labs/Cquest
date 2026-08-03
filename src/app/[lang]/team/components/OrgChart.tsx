"use client";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import ServiceIcon from "@/components/services/ServiceIcon";
import container from "@/components/services/Container.module.css";
import { EASE_OUT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { DEPARTMENTS, TEAM_HEADCOUNT, type Department } from "../data";
import styles from "./OrgChart.module.css";

const COPY = {
  en: {
    eyebrow: "Org chart",
    root: "Center Quest",
    rootMeta: "people across the operation",
    chartLabel: "Organisation chart by department",
    peopleLabel: "people",
    person: "Person",
    openHint: "Select a department to see its people",
    placeholderNotice:
      "Placeholder structure — departments, headcount and profiles are illustrative and pending definition.",
    avatarAlt: "Placeholder portrait",
  },
  es: {
    eyebrow: "Organigrama",
    root: "Center Quest",
    rootMeta: "personas en toda la operación",
    chartLabel: "Organigrama por departamentos",
    peopleLabel: "personas",
    person: "Persona",
    openHint: "Selecciona un departamento para ver su personal",
    placeholderNotice:
      "Estructura de referencia — los departamentos, la cantidad de personal y los perfiles son ilustrativos y están pendientes de definir.",
    avatarAlt: "Retrato de ejemplo",
  },
};

/* The stand-in portrait. A head and a pair of shoulders, filled rather than
   monoline: at this size the site's 1.7px icon stroke reads as a pictogram of
   a person, and what this has to read as is the ABSENCE of a photograph —
   the shape a real headshot will occupy. Kept in the same 64-box across every
   card so the roster stays a grid of equal weights while the photos are
   missing. */
function Silhouette() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={styles.avatarArt}>
      <circle cx="32" cy="25" r="11.5" />
      <path d="M32 40c-11.6 0-21 7.6-21 17v3h42v-3c0-9.4-9.4-17-21-17Z" />
    </svg>
  );
}

function PersonCard({ member, index }: { member: Department["members"][number]; index: number }) {
  const { lang } = useI18n();
  return (
    <motion.li
      className={styles.person}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.06 + index * 0.045 }}
    >
      <span className={styles.avatar}>
        <Silhouette />
      </span>
      <span className={styles.personName}>{member.name[lang]}</span>
      <span className={styles.personRole}>{member.role[lang]}</span>
      <span className={styles.personBio}>{member.bio[lang]}</span>
    </motion.li>
  );
}

export default function OrgChart({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  /* One department open at a time, and one open from the start. An org chart
     that lands entirely collapsed shows the reader a row of closed boxes and
     asks them to guess what is behind one; landing with the first already
     expanded shows the answer and teaches the interaction in the same beat.
     Clicking the open one closes it, so nothing is trapped. */
  const [activeId, setActiveId] = useState<string | null>(DEPARTMENTS[0]?.id ?? null);
  /* Gates the connector draw. The lines are pseudo-elements, which no variant
     tree can reach — CSS transitions keyed off this attribute can. */
  const [drawn, setDrawn] = useState(reduced);

  const active = DEPARTMENTS.find((department) => department.id === activeId) ?? null;

  return (
    <section id="chart" className={styles.chartSection}>
      <div className={container.container}>
        {/* ── The stage ──────────────────────────────────────────────────
            Master left, detail right. The chart used to run horizontally
            across the full width, which forced the roster underneath it and
            put the people below the fold — you had to scroll to see what
            clicking had done. An indented tree is tall and narrow instead, so
            it fits in a column and hands the rest of the viewport to the
            content the page exists for. */}
        <div className={styles.stage}>
          <div className={styles.index}>
            {/* The section's own axis, announced before the tree draws under
                it. An h2 — the panel's department name is the h3 beside it. */}
            <motion.h2
              className={styles.eyebrow}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.55, ease: EASE_OUT }}
            >
              {t.eyebrow}
              <span className={styles.eyebrowRule} aria-hidden />
            </motion.h2>

            <motion.div
              className={styles.chart}
              data-drawn={drawn}
              onViewportEnter={() => setDrawn(true)}
              viewport={{ once: true, margin: "-120px" }}
            >
              {/* ── The root ──────────────────────────────────────────── */}
              <motion.div
                className={styles.rootNode}
                initial={reduced ? false : { opacity: 0, y: -14 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                <span className={styles.rootName}>{t.root}</span>
                <span className={styles.rootMeta}>
                  <strong>{TEAM_HEADCOUNT}</strong> {t.rootMeta}
                </span>
              </motion.div>

              {/* ── The spine ───────────────────────────────────────────
                  One stem, from the root's underside down to the head of the
                  rail the departments hang off. Collinear with that rail, so
                  it needs no junction where the two meet. */}
              <div className={styles.spine} aria-hidden>
                <span className={styles.stem} />
              </div>

              {/* ── The departments ───────────────────────────────────── */}
              {/* A list of disclosures, NOT `role="tree"`. A tree role
                  promises arrow-key navigation between items, and promising
                  an interaction that isn't implemented leaves a screen-reader
                  user pressing keys that do nothing — worse than the plain
                  list this actually is. aria-expanded/aria-controls describe
                  the real behaviour. */}
              <ul className={styles.deptRow} aria-label={t.chartLabel}>
                {DEPARTMENTS.map((department, index) => {
                  const isActive = department.id === activeId;
                  return (
                    <li
                      key={department.id}
                      className={styles.deptCell}
                      /* The cell owns the state, not just the button: the rail
                         branch and its junction are the cell's own pseudo-
                         elements, and they are what marks the open department
                         now that the side tab is gone. */
                      data-active={isActive}
                      /* Feeds the connector's transition-delay — the branches
                         draw down the rail in turn, not all at once. */
                      style={{ "--i": index } as CSSProperties}
                    >
                      <motion.button
                        type="button"
                        aria-expanded={isActive}
                        aria-controls="org-panel"
                        data-active={isActive}
                        onClick={() => setActiveId(isActive ? null : department.id)}
                        className={styles.deptNode}
                        /* Blur and opacity only, deliberately. This card owns
                           a CSS `transform` for the hover slide, and a Motion
                           animation on x leaves an inline transform behind
                           that would silently outrank it forever after. */
                        initial={reduced ? false : { opacity: 0, filter: "blur(5px)" }}
                        whileInView={reduced ? undefined : { opacity: 1, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-120px" }}
                        transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.5 + index * 0.06 }}
                      >
                        <span className={styles.deptIcon}>
                          <ServiceIcon name={department.icon} />
                        </span>
                        <span className={styles.deptLabel}>{department.label[lang]}</span>
                        <span className={styles.deptCount}>
                          <strong>{department.members.length}</strong>
                          {t.peopleLabel}
                        </span>
                        {/* Crosses the gutter into the roster, and only while
                            open — the chart says which branch you are looking
                            at, and says it by being joined to it. */}
                        <span aria-hidden className={styles.deptStem} />
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            <p className={styles.notice}>{t.placeholderNotice}</p>
          </div>

          {/* ── The roster ────────────────────────────────────────────────
              Swaps in place on a focus-pull rather than a rise: it now sits
              beside the chart rather than under it, and a vertical entrance
              would imply the content arrived from a direction nothing is
              coming from. Exit is deliberately half the entrance — with
              `mode="wait"` the two run end to end, and a symmetric pair makes
              picking a department feel like waiting for a door. */}
          <div id="org-panel" className={styles.panelSlot}>
            <AnimatePresence mode="wait" initial={false}>
              {active ? (
                <motion.div
                  key={active.id}
                  className={styles.panel}
                  initial={reduced ? false : { opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={
                    reduced
                      ? undefined
                      : { opacity: 0, filter: "blur(4px)", transition: { duration: 0.18, ease: EASE_OUT } }
                  }
                  transition={{ duration: 0.36, ease: EASE_OUT }}
                  aria-live="polite"
                >
                  <header className={styles.panelHead}>
                    <span className={styles.panelLetter} aria-hidden>
                      {active.letter}
                    </span>
                    <span className={styles.panelHeadCopy}>
                      <h3>{active.label[lang]}</h3>
                      <p>{active.summary[lang]}</p>
                    </span>
                    {/* The header's right-hand counterweight — the same figure
                        the closed card shows, restated where the roster
                        begins. */}
                    <span className={styles.panelCount}>
                      <strong>{active.members.length}</strong>
                      <span>{t.peopleLabel}</span>
                    </span>
                  </header>
                  <ul className={styles.roster}>
                    {active.members.map((member, index) => (
                      <PersonCard key={member.id} member={member} index={index} />
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  className={styles.hint}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.24, ease: EASE_OUT }}
                >
                  {t.openHint}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
