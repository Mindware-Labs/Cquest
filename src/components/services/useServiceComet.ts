import { useCallback, useRef, useState } from "react";
import { SERVICES, type ServiceId } from "./data";

export type ServiceComet = {
  key: number;
  xs: number[];
  ys: number[];
  color: string;
};

export function useServiceComet(reduced: boolean) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cometKey = useRef(0);
  const lastService = useRef<ServiceId>("call-center");
  const [comet, setComet] = useState<ServiceComet | null>(null);

  const launchComet = useCallback(
    (next: ServiceId) => {
      const previous = lastService.current;
      lastService.current = next;
      const stage = stageRef.current;
      if (reduced || previous === next || !stage) return;

      const box = stage.getBoundingClientRect();
      const fromRing = stage.querySelector(
        `[data-service-label="${previous}"] .cq-service-ring`,
      );
      const toRing = stage.querySelector(
        `[data-service-label="${next}"] .cq-service-ring`,
      );
      if (!fromRing || !toRing) return;

      const from = fromRing.getBoundingClientRect();
      const to = toRing.getBoundingClientRect();
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      const fromX = from.left + from.width / 2 - box.left;
      const fromY = from.top + from.height / 2 - box.top;
      const toX = to.left + to.width / 2 - box.left;
      const toY = to.top + to.height / 2 - box.top;
      const startAngle = Math.atan2(fromY - centerY, fromX - centerX);
      let endAngle = Math.atan2(toY - centerY, toX - centerX);

      if (endAngle - startAngle > Math.PI) endAngle -= 2 * Math.PI;
      if (startAngle - endAngle > Math.PI) endAngle += 2 * Math.PI;

      const radius =
        (Math.hypot(fromX - centerX, fromY - centerY) +
          Math.hypot(toX - centerX, toY - centerY)) /
        2;
      const xs: number[] = [];
      const ys: number[] = [];

      for (let step = 0; step <= 10; step++) {
        const progress = step / 10;
        const eased =
          progress < 0.5
            ? 4 * progress ** 3
            : 1 - (-2 * progress + 2) ** 3 / 2;
        const angle = startAngle + (endAngle - startAngle) * eased;
        xs.push(centerX + Math.cos(angle) * radius);
        ys.push(centerY + Math.sin(angle) * radius);
      }

      cometKey.current += 1;
      const color =
        SERVICES.find((service) => service.id === next)?.color ?? SERVICES[0].color;
      setComet({ key: cometKey.current, xs, ys, color });
    },
    [reduced],
  );

  return { stageRef, comet, launchComet, clearComet: () => setComet(null) };
}
