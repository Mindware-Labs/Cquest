"use client";

import { useRef, type CSSProperties } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import { useI18n } from "@/i18n/I18nProvider";
import AnimatedBeam from "./AnimatedBeam";
import { ABOUT_SECTORS } from "./data";
import styles from "./SectorsBeam.module.css";

const COPY = {
  en: { hub: "Center Quest", caption: "The five sectors Center Quest specializes in, each running into one shared operation." },
  es: { hub: "Center Quest", caption: "Los cinco sectores en los que Center Quest se especializa, cada uno confluyendo en una misma operación." },
};

const RING = [
  { className: styles.posTop },
  { className: styles.posRight },
  { className: styles.posBottomRight },
  { className: styles.posBottomLeft },
  { className: styles.posLeft },
] as const;

function SectorNode({
  nodeRef,
  icon,
  label,
  className,
}: {
  nodeRef: React.RefObject<HTMLDivElement | null>;
  icon: (typeof ABOUT_SECTORS)[number]["icon"];
  label: string;
  className: string;
}) {
  return (
    <div className={`${styles.node} ${className}`} ref={nodeRef}>
      <span aria-hidden className={styles.nodeIcon}>
        <ServiceIcon name={icon} />
      </span>
      <strong className={styles.nodeLabel}>{label}</strong>
    </div>
  );
}

export default function SectorsBeam({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const [health, banking, retail, telecom, tourism] = ABOUT_SECTORS;

  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);
  const bankingRef = useRef<HTMLDivElement>(null);
  const retailRef = useRef<HTMLDivElement>(null);
  const telecomRef = useRef<HTMLDivElement>(null);
  const tourismRef = useRef<HTMLDivElement>(null);

  const duration = 4;
  const beam = { containerRef, toRef: hubRef, duration, reduced, curvature: 0 };
  const delays = [0, 0.7, 1.3, 2.1, 2.8];

  return (
    <figure className={styles.beamFigure}>
      <div ref={containerRef} className={styles.beamStage}>
        <span aria-hidden className={styles.beamAmbient} />
        <SectorNode nodeRef={healthRef} icon={health.icon} label={health.label[lang]} {...RING[0]} />
        <SectorNode nodeRef={bankingRef} icon={banking.icon} label={banking.label[lang]} {...RING[1]} />
        <SectorNode nodeRef={retailRef} icon={retail.icon} label={retail.label[lang]} {...RING[2]} />
        <SectorNode nodeRef={telecomRef} icon={telecom.icon} label={telecom.label[lang]} {...RING[3]} />
        <SectorNode nodeRef={tourismRef} icon={tourism.icon} label={tourism.label[lang]} {...RING[4]} />

        <div ref={hubRef} className={styles.hub}>
          {/* One flash ring per incoming beam, timed to arrive right as that
              beam's travelling gradient reaches the hub (delay + duration),
              so the hub reads as reacting to each connection rather than
              pulsing on its own independent clock. */}
          {!reduced && delays.map((delay) => (
            <span
              key={delay}
              className={styles.hubPulse}
              aria-hidden
              style={{ "--pulse-delay": `${delay + duration}s` } as CSSProperties}
            />
          ))}
          <span className={styles.hubText}>{t.hub}</span>
        </div>

        <AnimatedBeam {...beam} fromRef={healthRef} delay={delays[0]} />
        <AnimatedBeam {...beam} fromRef={bankingRef} delay={delays[1]} />
        <AnimatedBeam {...beam} fromRef={retailRef} delay={delays[2]} />
        <AnimatedBeam {...beam} fromRef={telecomRef} delay={delays[3]} />
        <AnimatedBeam {...beam} fromRef={tourismRef} delay={delays[4]} />
      </div>
      <figcaption className={styles.beamCaption}>{t.caption}</figcaption>
    </figure>
  );
}
