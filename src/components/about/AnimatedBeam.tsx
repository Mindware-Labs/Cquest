"use client";

import { useEffect, useId, useState, type CSSProperties, type RefObject } from "react";
import styles from "./AnimatedBeam.module.css";

interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;

  hubRef: RefObject<HTMLElement | null>;

  spokeRefs: readonly RefObject<HTMLElement | null>[];

  activeIndex: number | null;

  onMeasure?: () => void;
}

interface Segment {
  d: string;

  length: number;
}

/* Distancia del centro al borde de la caja en la dirección (ux,uy): así el
   haz arranca en el borde real de cada nodo y no en su centro. */
function edgeDistance(halfWidth: number, halfHeight: number, ux: number, uy: number) {
  const byWidth = Math.abs(ux) < 1e-6 ? Infinity : halfWidth / Math.abs(ux);
  const byHeight = Math.abs(uy) < 1e-6 ? Infinity : halfHeight / Math.abs(uy);
  return Math.min(byWidth, byHeight);
}

export default function AnimatedBeam({
  containerRef,
  hubRef,
  spokeRefs,
  activeIndex,
  onMeasure,
}: AnimatedBeamProps) {
  const id = useId();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const hub = hubRef.current;
    if (!container || !hub) return;

  /* Se mide con offsetLeft/Top y no con getBoundingClientRect: el contenedor
     puede estar transformado por el scroll y el rect vendría ya escalado. */
    const measure = () => {
      setBox({ width: container.offsetWidth, height: container.offsetHeight });

      const hubRadius = hub.offsetWidth / 2 + 2;
      const hubX = hub.offsetLeft;
      const hubY = hub.offsetTop;

      const next: Segment[] = [];
      for (const spokeRef of spokeRefs) {
        const node = spokeRef.current;
        if (!node) continue;

        const nodeX = node.offsetLeft;
        const nodeY = node.offsetTop;

        const dx = nodeX - hubX;
        const dy = nodeY - hubY;
        const distance = Math.hypot(dx, dy);
        if (distance === 0) continue;

        const ux = dx / distance;
        const uy = dy / distance;
        const trimEnd = edgeDistance(node.offsetWidth / 2, node.offsetHeight / 2, ux, uy) + 2;

        const length = Math.max(distance - hubRadius - trimEnd, 0);
        const startX = hubX + ux * hubRadius;
        const startY = hubY + uy * hubRadius;

        next.push({
          d: `M ${startX},${startY} L ${startX + ux * length},${startY + uy * length}`,
          length,
        });
      }

      setSegments(next);
      onMeasure?.();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(hub);
    for (const spokeRef of spokeRefs) {
      if (spokeRef.current) observer.observe(spokeRef.current);
    }
    measure();

    return () => observer.disconnect();
  }, [containerRef, hubRef, spokeRefs, onMeasure]);

  return (
    <svg
      aria-hidden
      fill="none"
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      className={styles.beamSvg}
      data-dimmed={activeIndex === null ? undefined : ""}
    >
      {segments.map((segment, index) => (
        <g key={`${id}-${index}`}>
          <path
            d={segment.d}
            className={styles.spoke}
            strokeLinecap="round"
            data-spoke=""
            data-index={index}
            data-active={activeIndex === index ? "" : undefined}

            style={{ "--spoke-length": `${segment.length}px` } as CSSProperties}
          />

          <path
            d={segment.d}
            className={styles.spokeLight}
            strokeLinecap="round"
            data-light=""
            data-index={index}
            style={{ "--spoke-length": `${segment.length}px` } as CSSProperties}
          />
        </g>
      ))}
    </svg>
  );
}
