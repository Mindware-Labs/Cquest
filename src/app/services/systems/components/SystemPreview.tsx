"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./SystemPreview.module.css";

/* ── System previews ──────────────────────────────────────────────────────
   Each of the four systems is shown AS its product: a synthetic, image-free
   interface drawn in CSS/SVG inside the same dark window chrome as the hero.
   The window arrives with its row (the parent's softRise), then the interface
   populates itself — records land, KPIs count into place, a rule fires down
   its branches, the assistant answers. Motion is inherited from the capability
   row: these variants carry no initial/animate of their own, so they wait for
   the row to enter the viewport and then orchestrate on their own clocks. */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

const pvGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
};
const pvGroupTight: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const pvRise: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT } },
};
const pvPop: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE_SPRING } },
};
const pvGrow: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.75, ease: EASE_OUT } },
};
// Connectors carry their draw timing on the component's transition prop (so
// each branch can be sequenced), so the variant itself stays timing-free —
// a per-variant transition would override that prop.
const pvDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

/* ── Monoline icons (viewBox 0 0 24 24, currentColor stroke) ────────────── */
const I = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  rule: <><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10.5 20a2 2 0 0 0 3 0" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 5-5" /></>,
  spark: <path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3Z" />,
  send: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></>,
} as const;

function Ico({ d }: { d: ReactNode }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

function Bar({ dots, label }: { dots?: boolean; label: string }) {
  return (
    <div className={styles.pvBar}>
      {dots !== false && (
        <span className={styles.pvDots} aria-hidden>
          <span /><span /><span />
        </span>
      )}
      <span className={styles.pvBarLabel}>{label}</span>
    </div>
  );
}

/* 1 · CRMs — a case list. Records land in sequence; one is the open case,
   marked with the accent rail. */
function CrmPreview() {
  const rows = [
    { code: "Case #4821", tag: "AR", tone: "var(--sy-sky)", status: "New", active: false },
    { code: "Case #4818", tag: "MJ", tone: "var(--sy-blue)", status: "Open", active: true },
    { code: "Case #4813", tag: "LP", tone: "var(--pv-green)", status: "Won", active: false },
    { code: "Case #4807", tag: "DT", tone: "var(--sy-blue)", status: "Open", active: false },
  ] as const;
  return (
    <>
      <Bar label="crm · cases" />
      <motion.div className={styles.pvScreen} variants={pvGroup}>
        <motion.div className={styles.crmToolbar} variants={pvRise}>
          <span className={styles.crmSearch}><Ico d={I.search} />Search cases</span>
          <span className={styles.crmNew}><Ico d={I.plus} />New</span>
        </motion.div>
        <motion.div className={styles.crmList} variants={pvGroupTight}>
          {rows.map((r) => (
            <motion.div key={r.code} className={styles.crmRow} data-active={r.active} variants={pvRise}>
              <span className={styles.crmAvatar} style={{ "--a": r.tone } as CSSProperties}>{r.tag}</span>
              <span className={styles.crmLines}>
                <span className={styles.crmName}>{r.code}</span>
                <span className={styles.crmSub} />
              </span>
              <span className={styles.crmPill} style={{ "--t": r.tone } as CSSProperties}>{r.status}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}

/* 2 · Dashboards — live KPIs. Tiles settle in, then the bars grow from their
   baseline; the peak is called out and a live pulse keeps time. */
function DashboardPreview() {
  const tiles = [
    { label: "SLA", value: "98%" },
    { label: "AHT", value: "4:12" },
    { label: "CSAT", value: "4.8" },
  ] as const;
  const bars = [46, 63, 54, 72, 60, 84, 71, 96, 68] as const;
  const peak = Math.max(...bars);
  return (
    <>
      <Bar label="dashboard · realtime" />
      <motion.div className={styles.pvScreen} variants={pvGroup}>
        <motion.div className={styles.dashHead} variants={pvRise}>
          <span className={styles.dashLive}><i aria-hidden />Live</span>
        </motion.div>
        <motion.div className={styles.dashTiles} variants={pvGroupTight}>
          {tiles.map((t) => (
            <motion.div key={t.label} className={styles.dashTile} variants={pvRise}>
              <span className={styles.dashTileLabel}>{t.label}</span>
              <span className={styles.dashTileValue}>{t.value}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.div className={styles.dashChart} variants={pvGroupTight}>
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className={styles.dashBar}
              data-peak={h === peak}
              style={{ height: `${h}%` }}
              variants={pvGrow}
            />
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}

/* 3 · Operations automation — a rule builder. The trigger reaches a rule,
   which branches to two actions; the connectors draw, the nodes pop, and a
   signal keeps flowing down the branches. */
function AutomationPreview() {
  const nodes = [
    { x: 15, y: 50, label: "Trigger", icon: I.bolt, color: "var(--sy-sky)" },
    { x: 49, y: 50, label: "Rule", icon: I.rule, color: "var(--sy-blue)" },
    { x: 82, y: 22, label: "Notify", icon: I.bell, color: "var(--pv-green)" },
    { x: 82, y: 78, label: "Update", icon: I.check, color: "var(--sy-sky)" },
  ] as const;
  const conns = [
    { d: "M21 50 L43 50", fd: "0s" },
    { d: "M55 50 C66 50 68 22 76 22", fd: "0.7s" },
    { d: "M55 50 C66 50 68 78 76 78", fd: "0.7s" },
  ] as const;
  return (
    <>
      <Bar label="workflows · rules" />
      <motion.div className={styles.pvScreen} variants={pvGroup}>
        <motion.div className={styles.autoStage} variants={pvGroupTight}>
          <svg className={styles.autoSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {conns.map((c, i) => (
              <motion.path
                key={`c${i}`}
                className={styles.autoConn}
                d={c.d}
                variants={pvDraw}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 + i * 0.16 }}
              />
            ))}
            {conns.map((c, i) => (
              <path key={`p${i}`} className={styles.autoPulse} d={c.d} pathLength={100} style={{ "--fd": c.fd } as CSSProperties} />
            ))}
          </svg>
          {nodes.map((n) => (
            <motion.span
              key={n.label}
              className={styles.autoNode}
              style={{ left: `${n.x}%`, top: `${n.y}%`, "--n": n.color } as CSSProperties}
              variants={pvPop}
            >
              <Ico d={n.icon} />{n.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}

/* 4 · AI Implementation — an agent console. A prompt, the assistant's reply,
   and a live typing indicator over a ready input line. */
function AiPreview() {
  return (
    <>
      <Bar label="assistant · console" />
      <motion.div className={styles.pvScreen} variants={pvGroup}>
        <motion.div className={styles.aiMsg} data-role="user" variants={pvRise}>
          <span className={styles.aiBubble}>
            <span className={styles.aiLine} style={{ width: "8rem" }} />
            <span className={styles.aiLine} style={{ width: "5rem" }} />
          </span>
        </motion.div>
        <motion.div className={styles.aiMsg} data-role="ai" variants={pvRise}>
          <span className={styles.aiAvatar}><Ico d={I.spark} /></span>
          <span className={styles.aiBubble}>
            <span className={styles.aiLine} style={{ width: "9rem" }} />
            <span className={styles.aiLine} style={{ width: "7rem" }} />
            <span className={styles.aiLine} style={{ width: "4rem" }} />
          </span>
        </motion.div>
        <motion.div className={styles.aiTyping} variants={pvPop} aria-hidden>
          <span /><span /><span />
        </motion.div>
        <motion.div className={styles.aiInput} variants={pvRise}>
          <span className={styles.aiInputText}>Ask the assistant<span className={styles.aiCaret} /></span>
          <span className={styles.aiSend}><Ico d={I.send} /></span>
        </motion.div>
      </motion.div>
    </>
  );
}

const PREVIEWS: Record<string, () => ReactElement> = {
  CRMs: CrmPreview,
  Dashboards: DashboardPreview,
  "Operations automation": AutomationPreview,
  "AI Implementation": AiPreview,
};

export default function SystemPreview({ title }: { title: string }) {
  const Preview = PREVIEWS[title];
  return Preview ? <Preview /> : null;
}
