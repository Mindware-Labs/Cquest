"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import ServiceOrbit from "@/components/services/ServiceOrbit";
import ServicePanel from "@/components/services/ServicePanel";
import ServicesBackdrop from "@/components/services/ServicesBackdrop";
import ServicesHeader from "@/components/services/ServicesHeader";
import { SERVICES, type ServiceId } from "@/components/services/data";

export default function ServicesExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(sectionRef, { amount: 0.08 });
  const panelsRevealed = useInView(panelsRef, { once: true, amount: 0.2 });
  const [tabVisible, setTabVisible] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceId>("call-center");
  const activeService =
    SERVICES.find((service) => service.id === selectedService) ?? SERVICES[0];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 28,
    restDelta: 0.001,
  });
  const scrollVelocity = useVelocity(scrollYProgress);
  const ambientY = useTransform(
    smoothProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["-7%", "7%"],
  );
  const gridOpacity = useTransform(smoothProgress, [0, 0.28, 0.72, 1], [0, 0.5, 0.5, 0]);
  const stageY = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    reduced ? [0, 0, 0] : [30, 0, -26],
  );
  const stageScale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    reduced ? [1, 1, 1] : [0.94, 1, 0.975],
  );
  const panelY = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    reduced ? [0, 0, 0] : [44, 0, -16],
  );

  useEffect(() => {
    const syncVisibility = () => setTabVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const ambientActive = !reduced && inView && tabVisible;

  return (
    <section
      ref={sectionRef}
      id="services"
      data-ambient-active={ambientActive}
      data-revealed={panelsRevealed ? "" : undefined}
      style={{ "--svc-active": activeService.color } as CSSProperties}
      className="cq-services relative isolate overflow-hidden py-16 text-foreground sm:py-20 lg:py-24"
    >
      <ServicesBackdrop ambientY={ambientY} gridOpacity={gridOpacity} />
      <div className="relative mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12">
        <ServicesHeader reduced={reduced} />
        <div className="cq-services-grid-cols relative mt-8 grid items-center gap-7 lg:mt-9 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,1fr)] lg:gap-10">
          <span aria-hidden className="cq-services-bridge hidden lg:block" />
          <ServiceOrbit
            ambientActive={ambientActive}
            reduced={reduced}
            stageY={stageY}
            stageScale={stageScale}
            scrollVelocity={scrollVelocity}
            onSelect={setSelectedService}
          />
          <motion.div
            ref={panelsRef}
            style={{ y: panelY }}
            className="cq-service-panels min-h-[17rem] py-4 lg:py-10"
          >
            {SERVICES.map((service) => {
              const selected = service.id === selectedService;
              return (
                <ServicePanel
                  key={service.id}
                  service={service}
                  ambient={ambientActive && selected}
                  reduced={reduced}
                  selected={selected}
                />
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
