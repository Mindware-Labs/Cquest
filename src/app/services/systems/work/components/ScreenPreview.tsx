"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import styles from "./ScreenPreview.module.css";

/* ── Case-study screen previews ───────────────────────────────────────────
   The four "Shot" placeholders this case study used to reserve are replaced
   with synthetic, image-free interfaces — the same move the Systems service
   page makes with SystemPreview.tsx: show the product AS the product, drawn
   live in CSS/SVG inside the hero's browser-chrome frame, rather than a gray
   box waiting for a screenshot. Content is deliberately generic (synthetic
   ids, skeleton lines, no invented client names) — the shape of the software
   is real, the data in frame is not. */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const frameVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE_OUT } },
};
const spGroupTight: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const spRise: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(5px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE_OUT } },
};
const spGrow: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};

const VIEWPORT = { once: true, margin: "-60px" } as const;

/* ── Monoline glyphs (viewBox 0 0 24 24, currentColor stroke) ── */
const I = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  download: <><path d="M12 4v11" /><path d="m7.5 11.5 4.5 4.5 4.5-4.5" /><path d="M4.5 19.5h15" /></>,
  call: <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4.7c0-.6.4-1 1-1h3.3c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z" />,
} as const;

function Ico({ d, className }: { d: ReactNode; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {d}
    </svg>
  );
}

/* Shared browser-chrome frame — three dots + a mono route label, matching
   the hero's product window one level down in scale. */
function Frame({
  address,
  ratio = "16 / 9",
  reduced,
  children,
}: {
  address: string;
  ratio?: string;
  reduced: boolean;
  children: ReactNode;
}) {
  return (
    <motion.figure
      className={styles.frame}
      style={{ "--ratio": ratio } as CSSProperties}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={frameVariants}
    >
      <div className={styles.bar}>
        <span className={styles.dots} aria-hidden><span /><span /><span /></span>
        <span className={styles.address}>{address}</span>
      </div>
      <div className={styles.screen}>{children}</div>
    </motion.figure>
  );
}

/* 1 · Contact Center — calls, tickets & manual records in one queue. */
export function ContactCenterScreen({ reduced }: { reduced: boolean }) {
  const rows = [
    { id: "Call #2461", tag: "live", sub: "62%", tone: "var(--wp-sky)", status: "Active", live: true },
    { id: "Call #2458", tag: "42%", sub: "80%", tone: "var(--wp-green)", status: "Resolved", live: false },
    { id: "Tkt #0117", tag: "35%", sub: "55%", tone: "var(--wp-amber)", status: "Promise to pay", live: false },
    { id: "Call #2452", tag: "58%", sub: "38%", tone: "var(--wp-muted)", status: "No answer", live: false },
    { id: "Call #2449", tag: "48%", sub: "70%", tone: "var(--wp-green)", status: "Resolved", live: false },
  ] as const;
  return (
    <Frame address="app.centerquest.do/operations/contact-center" reduced={reduced}>
      <motion.div className={styles.ccTabs} variants={spRise}>
        <span data-active="true">Calls</span>
        <span>Tickets</span>
        <span>Manual records</span>
      </motion.div>
      <motion.div className={styles.ccToolbar} variants={spRise}>
        <span className={styles.ccSearch}><Ico d={I.search} className={styles.icoSky} />Search calls, customers…</span>
        <span className={styles.ccSchedule}><Ico d={I.calendar} />Schedule call</span>
      </motion.div>
      <motion.div className={styles.ccList} variants={spGroupTight}>
        {rows.map((r) => (
          <motion.div key={r.id} className={styles.ccRow} data-live={r.live || undefined} variants={spRise}>
            <span className={styles.ccDirection} aria-hidden><Ico d={I.call} /></span>
            <span className={styles.ccLines}>
              <span className={styles.ccId}>{r.id}</span>
              <span className={styles.ccBar} style={{ width: r.tag }} />
            </span>
            <span className={styles.ccBarTrack}><span className={styles.ccBarFill} style={{ width: r.sub }} /></span>
            <span className={styles.ccPill} style={{ "--t": r.tone } as CSSProperties}>{r.status}</span>
          </motion.div>
        ))}
      </motion.div>
    </Frame>
  );
}

/* 2 · Agent dashboard — live status + follow-up accountability. */
export function AgentDashboardScreen({ reduced }: { reduced: boolean }) {
  const tiles = [
    { label: "Live calls", value: "6" },
    { label: "Due today", value: "14" },
    { label: "SLA", value: "97%" },
  ] as const;
  const followUps = [
    { id: "TCK-041", tone: "var(--wp-red)", time: "Overdue" },
    { id: "TCK-038", tone: "var(--wp-amber)", time: "Due in 2h" },
    { id: "TCK-032", tone: "var(--wp-green)", time: "Due in 5h" },
  ] as const;
  return (
    <Frame address="app.centerquest.do/operations/dashboard" reduced={reduced}>
      <motion.div className={styles.dashHead} variants={spRise}>
        <span className={styles.dashLive}><i aria-hidden />Live</span>
      </motion.div>
      <motion.div className={styles.dashTiles} variants={spGroupTight}>
        {tiles.map((t) => (
          <motion.div key={t.label} className={styles.dashTile} variants={spRise}>
            <span className={styles.dashTileLabel}>{t.label}</span>
            <span className={styles.dashTileValue}>{t.value}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div className={styles.followLabel} variants={spRise}>Follow-up accountability</motion.div>
      <motion.div className={styles.followList} variants={spGroupTight}>
        {followUps.map((f) => (
          <motion.div key={f.id} className={styles.followRow} variants={spRise}>
            <span className={styles.followDot} style={{ "--t": f.tone } as CSSProperties} aria-hidden />
            <span className={styles.followId}>{f.id}</span>
            <span className={styles.followBar} />
            <span className={styles.followTime}>{f.time}</span>
          </motion.div>
        ))}
      </motion.div>
    </Frame>
  );
}

/* 3 · Analytics — KPI tiles over a call-volume bar chart. */
export function AnalyticsScreen({ reduced }: { reduced: boolean }) {
  const tiles = [
    { label: "Calls answered", value: "1,247" },
    { label: "Avg handle time", value: "1m 52s" },
    { label: "Contact rate", value: "84%" },
  ] as const;
  const bars = [46, 63, 54, 72, 60, 84, 71, 96, 68] as const;
  const peak = Math.max(...bars);
  return (
    <Frame address="app.centerquest.do/operations/analytics" ratio="16 / 10" reduced={reduced}>
      <motion.div className={styles.dashHead} variants={spRise}>
        <span className={styles.rangeChip}><Ico d={I.calendar} />Monthly</span>
      </motion.div>
      <motion.div className={styles.dashTiles} variants={spGroupTight}>
        {tiles.map((t) => (
          <motion.div key={t.label} className={styles.dashTile} variants={spRise}>
            <span className={styles.dashTileLabel}>{t.label}</span>
            <span className={styles.dashTileValue}>{t.value}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div className={styles.dashChart} variants={spGroupTight}>
        {bars.map((h, i) => (
          <motion.span key={i} className={styles.dashBar} data-peak={h === peak || undefined} style={{ height: `${h}%` }} variants={spGrow} />
        ))}
      </motion.div>
    </Frame>
  );
}

/* 4 · Per-site reporting — rollups with one-click PDF / Excel export. */
export function ReportingScreen({ reduced }: { reduced: boolean }) {
  const sites = [
    { name: "58%", campaign: "38%", sla: "96%" },
    { name: "44%", campaign: "50%", sla: "91%" },
    { name: "62%", campaign: "30%", sla: "98%" },
    { name: "50%", campaign: "44%", sla: "89%" },
  ] as const;
  return (
    <Frame address="app.centerquest.do/operations/reports" ratio="16 / 10" reduced={reduced}>
      <motion.div className={styles.repHead} variants={spRise}>
        <span className={styles.repLabel}>Per-site reporting</span>
        <span className={styles.repExports}>
          <span className={styles.repChip}><Ico d={I.download} />PDF</span>
          <span className={styles.repChip}><Ico d={I.download} />XLSX</span>
        </span>
      </motion.div>
      <motion.div className={styles.repList} variants={spGroupTight}>
        {sites.map((s, i) => (
          <motion.div key={i} className={styles.repRow} variants={spRise}>
            <span className={styles.repLines}>
              <span className={styles.repBar} style={{ width: s.name }} />
              <span className={styles.repSub} style={{ width: s.campaign }} />
            </span>
            <span className={styles.repSlaTrack}><span className={styles.repSlaFill} style={{ width: s.sla }} /></span>
            <span className={styles.repSlaValue}>{s.sla}</span>
          </motion.div>
        ))}
      </motion.div>
    </Frame>
  );
}
