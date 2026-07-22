"use client";

import { motion, type Variants } from "motion/react";
import Image from "next/image";
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
  plain,
  children,
}: {
  address: string;
  ratio?: string;
  reduced: boolean;
  plain?: boolean;
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
      <div className={styles.screen} data-plain={plain || undefined}>{children}</div>
    </motion.figure>
  );
}

/* 1 · Contact Center — the platform's executive dashboard: KPI rollups and
   the calls/tickets trend. A real product screenshot, cropped to the
   generic KPI rows and de-branded — no client or company names in frame. */
export function ContactCenterScreen({ reduced }: { reduced: boolean }) {
  return (
    <Frame address="app.centerquest.do/operations/reports" ratio="1819 / 998" reduced={reduced} plain>
      <Image
        src="/rig-hut/system-011-redacted.png"
        alt="Yard report showing contacts, tickets, resolution rate and calls, plus call, ticket and manual-record activity charts and disposition, direction and priority breakdowns."
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className={styles.shotImg}
      />
    </Frame>
  );
}

/* 2 · Marketing dashboard — contact rate, dispositions and campaign
   performance. A real product screenshot, with the site-address labels on
   the campaign chart redacted (no site locations in frame). */
export function AgentDashboardScreen({ reduced }: { reduced: boolean }) {
  return (
    <Frame address="app.centerquest.do/operations/dashboard" ratio="1839 / 977" reduced={reduced} plain>
      <Image
        src="/rig-hut/system-012-redacted.png"
        alt="Marketing dashboard showing contact rate, total dispositions, SMS messages and calls per yard, with campaign performance, campaign options, SMS engagement and disposition-mix charts."
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className={styles.shotImg}
      />
    </Frame>
  );
}

/* 3 · Analytics — call volume, contact-rate insights and agent activity.
   A real product screenshot, with the agent-name labels on the "Agent
   activity" chart redacted (no employee names in frame). */
export function AnalyticsScreen({ reduced }: { reduced: boolean }) {
  return (
    <Frame address="app.centerquest.do/operations/analytics" ratio="1564 / 996" reduced={reduced} plain>
      <Image
        src="/rig-hut/system-013-redacted.png"
        alt="Operations dashboard showing calls answered, average queue wait, average handle time and follow-ups due, with call volume, contact and missed-call insight, agent activity, and follow-up accountability panels."
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className={styles.shotImg}
      />
    </Frame>
  );
}

/* 4 · Per-site reporting — campaign performance rollup with export actions.
   A real product screenshot, with the campaign name and yard identifier
   redacted (no client or site names in frame). */
export function ReportingScreen({ reduced }: { reduced: boolean }) {
  return (
    <Frame address="app.centerquest.do/operations/reports" ratio="1821 / 826" reduced={reduced} plain>
      <Image
        src="/rig-hut/system-014-redacted.png"
        alt="Campaign report showing customers reached, conversion rate, touches to convert and average resolution, a campaign activity chart, and a conversion funnel from universe to converted."
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className={styles.shotImg}
      />
    </Frame>
  );
}
