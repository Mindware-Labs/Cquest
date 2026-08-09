"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { cancelFrame, frame } from "motion/react";

const SCAN_PERIOD = 13;
const SCAN_START_REM = -24;
const SCAN_OVERSHOOT_REM = 8;
const SCAN_BRIGHT_LINE_REM = 0.55 * 20;

const GRID_CELL_REM = 3.4;

export default function SystemsScene() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const lastSize = { width: 0, height: 0 };

    const doMeasure = () => {
      const box = layer.getBoundingClientRect();

      if (box.width === 0 || box.height === 0) return null;
      if (box.width === lastSize.width && box.height === lastSize.height) return null;
      lastSize.width = box.width;
      lastSize.height = box.height;

      const rem =
        Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const cell = GRID_CELL_REM * rem;
      const halfCell = cell / 2;
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      const beamBrightStart = (SCAN_START_REM + SCAN_BRIGHT_LINE_REM) * rem;

      const beamTravel =
        window.innerWidth + (SCAN_OVERSHOOT_REM - SCAN_START_REM) * rem;

      return Array.from(layer.querySelectorAll<HTMLElement>(".cq-v2-node")).map((node) => {
        const targetX = (Number.parseFloat(node.dataset.x ?? "50") / 100) * box.width;
        const targetY = (Number.parseFloat(node.dataset.y ?? "50") / 100) * box.height;
        const gridBaseX = centerX - halfCell;
        const gridBaseY = centerY - halfCell;
        const x = gridBaseX + Math.round((targetX - gridBaseX) / cell) * cell;
        const y = gridBaseY + Math.round((targetY - gridBaseY) / cell) * cell;
        const crossing = (SCAN_PERIOD * (x - beamBrightStart)) / beamTravel;
        return { node, x, y, nd: crossing - SCAN_PERIOD };
      });
    };

    const measure = () => {
      const updates = doMeasure();
      if (!updates) return;
      frame.render(() => {
        for (const { node, x, y, nd } of updates) {
          node.style.left = `${x.toFixed(1)}px`;
          node.style.top = `${y.toFixed(1)}px`;
          node.style.setProperty("--nd", `${nd.toFixed(2)}s`);
        }

        layer.dataset.synced = "true";
      });
    };

    const queue = () => frame.read(measure);

    queue();
    window.addEventListener("resize", queue, { passive: true });

    const observer = new ResizeObserver(queue);
    observer.observe(layer);

    return () => {
      cancelFrame(measure);
      window.removeEventListener("resize", queue);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={layerRef} data-synced="false" className="cq-v2-systems absolute inset-0">

      <div className="cq-v2-grid" />

      <span className="cq-v2-scan" />

      <span className="cq-v2-node" data-x="12" data-y="22" />
      <span className="cq-v2-node" data-x="22" data-y="80" />
      <span className="cq-v2-node" data-x="38" data-y="12" />
      <span className="cq-v2-node" data-x="66" data-y="88" />
      <span className="cq-v2-node" data-x="84" data-y="18" />
      <span className="cq-v2-node" data-x="90" data-y="66" />
      <span
        className="cq-v2-orb cq-v2-orb--sys-a left-[-11rem] top-[26%] h-[32rem] w-[32rem]"
        style={{ "--orb": "color-mix(in srgb, var(--svc) 26%, transparent)" } as CSSProperties}
      />
      <span
        className="cq-v2-orb cq-v2-orb--sys-b right-[-12rem] bottom-[-11rem] h-[34rem] w-[34rem]"
        style={{ "--orb": "color-mix(in srgb, var(--svc-glow) 22%, transparent)" } as CSSProperties}
      />
    </div>
  );
}
