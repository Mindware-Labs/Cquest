import type { CSSProperties, PointerEvent } from "react";
import { motion, type MotionValue } from "motion/react";
import { nodeVariants } from "./animation";
import { ORBIT, SERVICE_PANEL_ID, type Service } from "./data";
import ServiceIcon from "./ServiceIcon";

type OrbitNodeProps = {
  service: Service;
  index: number;
  counterAngle: MotionValue<number>;
  reduced: boolean;
  selected: boolean;
};

export default function OrbitNode({
  service,
  index,
  counterAngle,
  reduced,
  selected,
}: OrbitNodeProps) {
  const orbit = ORBIT[index];
  const icon =
    service.id === "call-center" ? "headset" : service.id === "bpo" ? "layers" : "code";

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        transform: `rotate(${orbit.angle}deg) translateY(calc(${orbit.radius} * -1)) rotate(${-orbit.angle}deg)`,
        transformOrigin: "0 0",
      }}
    >
      <motion.div
        className="cq-service-orbit-counter"
        style={{ rotate: counterAngle, transformOrigin: "0 0" }}
        custom={index}
        variants={nodeVariants}
      >
        {/* Controlled so the scroll journey can drive :checked (and with it
            the whole CSS panel choreography); the change event still bubbles
            to the fieldset, which owns selection handling. */}
        <input
          id={`${SERVICE_PANEL_ID}-${service.id}-control`}
          className="cq-service-control sr-only"
          type="radio"
          name="center-quest-service"
          value={service.id}
          checked={selected}
          onChange={() => {}}
          data-service-control={service.id}
          aria-label={service.label}
        />
        <label
          id={`${SERVICE_PANEL_ID}-${service.id}-label`}
          htmlFor={`${SERVICE_PANEL_ID}-${service.id}-control`}
          data-service-label={service.id}
          style={{ "--svc": service.color, "--oi": index } as CSSProperties}
          className="cq-service-node group relative flex -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation flex-col items-center gap-2 text-center"
          onPointerMove={(event) => moveNode(event, reduced)}
          onPointerLeave={(event) => resetNode(event)}
        >
          <span aria-hidden className="cq-service-ring">
            <ServiceIcon name={icon} />
          </span>
          <span className="cq-service-name">
            {service.id === "systems" ? "Systems" : service.label}
          </span>
        </label>
      </motion.div>
    </div>
  );
}

function moveNode(event: PointerEvent<HTMLLabelElement>, reduced: boolean) {
  if (reduced || event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
  event.currentTarget.style.setProperty("--mx", `${x.toFixed(1)}px`);
  event.currentTarget.style.setProperty("--my", `${y.toFixed(1)}px`);
}

function resetNode(event: PointerEvent<HTMLLabelElement>) {
  event.currentTarget.style.setProperty("--mx", "0px");
  event.currentTarget.style.setProperty("--my", "0px");
}
