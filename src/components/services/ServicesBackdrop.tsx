import { motion, type MotionValue } from "motion/react";

type ServicesBackdropProps = {
  ambientY: MotionValue<string>;
  gridOpacity: MotionValue<number>;
};

export default function ServicesBackdrop({
  ambientY,
  gridOpacity,
}: ServicesBackdropProps) {
  return (
    <>
      <motion.div
        aria-hidden
        style={{ y: ambientY }}
        className="pointer-events-none absolute -inset-y-[9%] -inset-x-[8%] overflow-hidden"
      >
        <div className="cq-services-mesh absolute -inset-[12%]" />
        <div className="cq-orb left-[-12rem] top-[-13rem] h-[36rem] w-[36rem] bg-celeste/35" style={{ animation: "cq-float-a 22s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb bottom-[-15rem] right-[-10rem] h-[34rem] w-[34rem] bg-petroleo/20" style={{ animation: "cq-float-b 26s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb left-[42%] top-[32%] h-[24rem] w-[24rem] bg-verde/12" style={{ animation: "cq-float-c 20s cubic-bezier(0.45, 0, 0.55, 1) infinite" }} />
        <div className="cq-orb cq-orb-svc right-[4%] top-[16%] h-[28rem] w-[28rem]" style={{ animation: "cq-float-b 24s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse" }} />
        <div className="cq-services-tint absolute inset-0" />
      </motion.div>
      <motion.div aria-hidden style={{ opacity: gridOpacity }} className="cq-services-grid pointer-events-none absolute inset-0" />
      <div aria-hidden className="cq-noise pointer-events-none absolute inset-0" />
    </>
  );
}
