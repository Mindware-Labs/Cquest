"use client";

import { useRef } from "react";
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

  const beam = { containerRef, toRef: hubRef, duration: 4, reduced, curvature: 0 };

  return (
    <figure className={styles.beamFigure}>
      <div ref={containerRef} className={styles.beamStage}>
        <SectorNode nodeRef={healthRef} icon={health.icon} label={health.label[lang]} {...RING[0]} />
        <SectorNode nodeRef={bankingRef} icon={banking.icon} label={banking.label[lang]} {...RING[1]} />
        <SectorNode nodeRef={retailRef} icon={retail.icon} label={retail.label[lang]} {...RING[2]} />
        <SectorNode nodeRef={telecomRef} icon={telecom.icon} label={telecom.label[lang]} {...RING[3]} />
        <SectorNode nodeRef={tourismRef} icon={tourism.icon} label={tourism.label[lang]} {...RING[4]} />

        <div ref={hubRef} className={styles.hub}>
          <span className={styles.hubPulse} aria-hidden />
          <span className={styles.hubText}>{t.hub}</span>
        </div>

        <AnimatedBeam {...beam} fromRef={healthRef} delay={0} />
        <AnimatedBeam {...beam} fromRef={bankingRef} delay={0.7} />
        <AnimatedBeam {...beam} fromRef={retailRef} delay={1.3} />
        <AnimatedBeam {...beam} fromRef={telecomRef} delay={2.1} />
        <AnimatedBeam {...beam} fromRef={tourismRef} delay={2.8} />
      </div>
      <figcaption className={styles.beamCaption}>{t.caption}</figcaption>
    </figure>
  );
}
