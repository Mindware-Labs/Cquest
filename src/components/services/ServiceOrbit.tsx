import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  EASE_OUT,
  guideRingVariants,
  sealVariants,
} from "./animation";
import { SERVICES, type ServiceId } from "./data";
import OrbitNode from "./OrbitNode";
import { useServiceComet } from "./useServiceComet";

type ServiceOrbitProps = {
  ambientActive: boolean;
  reduced: boolean;
  stageY: MotionValue<number>;
  stageScale: MotionValue<number>;
  scrollVelocity: MotionValue<number>;
  selected: ServiceId;
  onSelect: (service: ServiceId) => void;
};

export default function ServiceOrbit({
  ambientActive,
  reduced,
  stageY,
  stageScale,
  scrollVelocity,
  selected,
  onSelect,
}: ServiceOrbitProps) {
  const [stageHover, setStageHover] = useState(false);
  const [armed, setArmed] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const orbitAngle = useMotionValue(0);
  const counterAngle = useTransform(orbitAngle, (value) => -value);
  const { stageRef, comet, launchComet, clearComet } = useServiceComet(reduced);
  const prevSelected = useRef<ServiceId | null>(null);

  // React to selection from ANY source — orbit clicks, journey-rail stops or
  // the scroll journey itself — with the same ceremony: arm the crown pulse,
  // ping the seal and send the comet along the arc to the new sphere.
  useEffect(() => {
    const previous = prevSelected.current;
    prevSelected.current = selected;
    if (previous === null || previous === selected) return;
    setArmed(true);
    setPulseKey((key) => key + 1);
    launchComet(selected);
  }, [selected, launchComet]);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, filter: "blur(10px)" },
        show: {
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 0.85, ease: EASE_OUT },
        },
      }}
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.16 }}
      style={{ y: stageY, scale: stageScale }}
      className="relative mx-auto w-full max-w-[29rem]"
      onPointerEnter={(event) => event.pointerType === "mouse" && setStageHover(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setStageHover(false)}
    >
      {ambientActive && !reduced && (
        <OrbitAnimator
          orbitAngle={orbitAngle}
          scrollVelocity={scrollVelocity}
          slowed={stageHover}
        />
      )}
      <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[24rem]">
        {["inset-[8%] border-petroleo/60", "inset-[20%] border-celeste/80", "inset-[35%] border-petroleo/50"].map((className, index) => (
          <motion.div
            key={className}
            aria-hidden
            custom={index}
            variants={guideRingVariants}
            className={`absolute rounded-full border border-[1.5px] ${className}`}
          />
        ))}
        <div aria-hidden className="cq-ring inset-[19%]" />
        <div aria-hidden className="cq-ring inset-[19%]" style={{ animationDelay: "-5.1s" }} />

        <motion.fieldset
          className="cq-service-orbit absolute inset-0 z-10 m-0 border-0 p-0"
          style={{ rotate: orbitAngle }}
          data-armed={armed || undefined}
          onChange={(event) => {
            if (!(event.target instanceof HTMLInputElement)) return;
            onSelect(event.target.value as ServiceId);
          }}
        >
          <legend className="sr-only">Center Quest business lines</legend>
          {SERVICES.map((service, index) => (
            <OrbitNode
              key={service.id}
              service={service}
              index={index}
              counterAngle={counterAngle}
              reduced={reduced}
              selected={service.id === selected}
            />
          ))}
        </motion.fieldset>

        <div className="absolute left-1/2 top-1/2 z-20 flex h-[5.6rem] w-[5.6rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 p-3 shadow-[0_12px_34px_-16px_rgba(15,57,73,.6),0_2px_6px_-3px_rgba(15,57,73,.2),0_0_0_1.5px_rgba(63,115,141,0.2),0_0_20px_2px_rgba(116,195,213,0.25)] ring-1 ring-inset ring-petroleo/30 backdrop-blur-md sm:h-[7rem] sm:w-[7rem] sm:p-3.5">
          <motion.div variants={sealVariants} className="flex items-center justify-center">
            <motion.div
              key={pulseKey}
              animate={pulseKey > 0 && !reduced ? { scale: [1, 1.05, 1] } : undefined}
              transition={{ duration: 0.55, ease: EASE_OUT }}
              className="flex items-center justify-center"
            >
              <Image src="/logo.png" alt="Center Quest" width={206} height={152} className="h-auto w-[4.3rem] sm:w-[5.2rem]" />
            </motion.div>
          </motion.div>
        </div>

        {comet && (
          <motion.span
            key={comet.key}
            aria-hidden
            className="cq-comet z-[15]"
            style={{ "--comet": comet.color } as CSSProperties}
            initial={{ x: comet.xs[0], y: comet.ys[0], opacity: 0, scale: 0.4 }}
            animate={{
              x: comet.xs,
              y: comet.ys,
              opacity: [0, 1, 1, 1, 0],
              scale: [0.4, 1, 1, 1, 0.5],
            }}
            transition={{ duration: 0.5, ease: "linear" }}
            onAnimationComplete={clearComet}
          />
        )}
      </div>
    </motion.div>
  );
}

function OrbitAnimator({
  orbitAngle,
  scrollVelocity,
  slowed,
}: {
  orbitAngle: MotionValue<number>;
  scrollVelocity: MotionValue<number>;
  slowed: boolean;
}) {
  const speed = useRef(1);

  useAnimationFrame((_, delta) => {
    const stir = Math.min(Math.abs(scrollVelocity.get()) * 1.3, 1.1);
    const target = (slowed ? 0.45 : 1) + stir;
    speed.current += (target - speed.current) * Math.min(1, delta / 320);
    orbitAngle.set((orbitAngle.get() + (360 / 38000) * delta * speed.current) % 360);
  });

  return null;
}
