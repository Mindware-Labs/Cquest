"use client";

import { motion, type Variants } from "motion/react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./ScreenPreview.module.css";

const ALT = {
  en: {
    contactCenter: "Yard report showing contacts, tickets, resolution rate and calls, plus call, ticket and manual-record activity charts and disposition, direction and priority breakdowns.",
    agentDashboard: "Marketing dashboard showing contact rate, total dispositions, SMS messages and calls per yard, with campaign performance, campaign options, SMS engagement and disposition-mix charts.",
    analytics: "Operations dashboard showing calls answered, average queue wait, average handle time and follow-ups due, with call volume, contact and missed-call insight, agent activity, and follow-up accountability panels.",
    reporting: "Campaign report showing customers reached, conversion rate, touches to convert and average resolution, a campaign activity chart, and a conversion funnel from universe to converted.",
  },
  es: {
    contactCenter: "Reporte de sede mostrando contactos, tickets, tasa de resolución y llamadas, además de gráficos de actividad de llamadas, tickets y registros manuales, y desgloses por disposición, dirección y prioridad.",
    agentDashboard: "Dashboard de marketing mostrando tasa de contacto, total de disposiciones, mensajes SMS y llamadas por sede, con gráficos de desempeño de campañas, opciones de campaña, interacción por SMS y mezcla de disposiciones.",
    analytics: "Dashboard de operaciones mostrando llamadas atendidas, espera promedio en cola, tiempo promedio de gestión y seguimientos pendientes, con paneles de volumen de llamadas, contacto y llamadas perdidas, actividad de agentes y responsabilidad de seguimiento.",
    reporting: "Reporte de campaña mostrando clientes contactados, tasa de conversión, contactos hasta convertir y resolución promedio, un gráfico de actividad de campaña, y un embudo de conversión desde el universo hasta convertidos.",
  },
};

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

const VIEWPORT = { once: true, margin: "-60px" } as const;

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
  const { lang } = useI18n();
  return (
    <Frame address="app.centerquest.do/operations/reports" ratio="1819 / 998" reduced={reduced} plain>
      <Image
        src="/rig-hut/system-011-redacted.png"
        alt={ALT[lang].contactCenter}
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
  const { lang } = useI18n();
  return (
    <Frame address="app.centerquest.do/operations/dashboard" ratio="1839 / 977" reduced={reduced} plain>
      <Image
        src="/rig-hut/system-012-redacted.png"
        alt={ALT[lang].agentDashboard}
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
  const { lang } = useI18n();
  return (
    <Frame address="app.centerquest.do/operations/analytics" ratio="1564 / 996" reduced={reduced} plain>
      <Image
        src="/rig-hut/system-013-redacted.png"
        alt={ALT[lang].analytics}
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
  const { lang } = useI18n();
  return (
    <Frame address="app.centerquest.do/operations/reports" ratio="1821 / 826" reduced={reduced} plain>
      <Image
        src="/rig-hut/system-014-redacted.png"
        alt={ALT[lang].reporting}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className={styles.shotImg}
      />
    </Frame>
  );
}
