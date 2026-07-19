"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import ServiceOrbit from "@/components/services/ServiceOrbit";
import ServicePanel from "@/components/services/ServicePanel";
import ServicesBackdrop from "@/components/services/ServicesBackdrop";
import ServicesHeader from "@/components/services/ServicesHeader";
import { SERVICES, type Service, type ServiceId } from "@/components/services/data";

export default function ServicesExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(sectionRef, { amount: 0.08 });
  const panelsRevealed = useInView(panelsRef, { once: true, amount: 0.2 });
  const [tabVisible, setTabVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceId>("call-center");
  const activeIndex = Math.max(
    0,
    SERVICES.findIndex((service) => service.id === selectedService),
  );
  const activeService = SERVICES[activeIndex];

  // Desktop + motion-safe = the sheet is pinned and vertical scroll drives
  // the lateral journey (mirrors the CSS media gate on .cq-services-sheet).
  const pinned = isDesktop && !reduced;
  // While a click-triggered scroll is in flight, scroll-zone syncing holds
  // until it reaches the clicked service, so passing over the middle zone
  // doesn't flash an unwanted selection (and comet) mid-travel.
  const scrollLock = useRef<ServiceId | null>(null);
  const scrollLockTimer = useRef<number | undefined>(undefined);

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

  // Journey progress: 0 → 1 across the pinned phase of the tall track. Each
  // service owns an equal zone; crossing a boundary advances the selection,
  // which plays the exact same choreography a click does (comet included).
  const { scrollYProgress: journeyProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(journeyProgress, "change", (progress) => {
    if (!pinned) return;
    const index = Math.min(
      SERVICES.length - 1,
      Math.max(0, Math.floor(progress * SERVICES.length)),
    );
    const next = SERVICES[index].id;
    if (scrollLock.current) {
      if (next === scrollLock.current) scrollLock.current = null;
      return;
    }
    setSelectedService((current) => (current === next ? current : next));
  });

  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const syncVisibility = () => setTabVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => () => window.clearTimeout(scrollLockTimer.current), []);

  // Selecting a service while pinned means travelling there: scroll to the
  // middle of its zone and let the journey sync do the switching. Outside
  // the pinned journey (mobile, reduced motion) it switches in place.
  const handleSelect = (id: ServiceId) => {
    const section = sectionRef.current;
    if (!pinned || !section) {
      setSelectedService(id);
      return;
    }
    const index = SERVICES.findIndex((service) => service.id === id);
    const top = section.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(0, section.offsetHeight - window.innerHeight);
    const target = top + ((index + 0.5) / SERVICES.length) * distance;

    scrollLock.current = id;
    window.clearTimeout(scrollLockTimer.current);
    scrollLockTimer.current = window.setTimeout(() => {
      scrollLock.current = null;
    }, 1400);
    setSelectedService(id);

    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(target, { duration: 1.05 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  const ambientActive = !reduced && inView && tabVisible;

  return (
    <section
      ref={sectionRef}
      id="services"
      data-ambient-active={ambientActive}
      data-revealed={panelsRevealed ? "" : undefined}
      style={
        {
          "--svc-active": activeService.color,
          "--active-i": activeIndex,
        } as CSSProperties
      }
      className="cq-services relative isolate text-foreground"
    >
      <div className="cq-services-sheet isolate overflow-hidden">
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
              selected={selectedService}
              onSelect={handleSelect}
            />
            <motion.div
              ref={panelsRef}
              style={{ y: panelY }}
              className="cq-service-panels min-h-[17rem] py-4 lg:py-10"
            >
              {SERVICES.map((service, index) => {
                const selected = service.id === selectedService;
                return (
                  <ServicePanel
                    key={service.id}
                    service={service}
                    index={index}
                    ambient={ambientActive && selected}
                    reduced={reduced}
                    selected={selected}
                  />
                );
              })}
            </motion.div>
          </div>
          {pinned && (
            <JourneyRail
              progress={journeyProgress}
              activeId={selectedService}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* Journey instrument: three service-tinted segments that fill as the
   pinned scroll travels through each zone — the horizontal map of a journey
   the page takes sideways. Each stop is also a shortcut. */
function JourneyRail({
  progress,
  activeId,
  onSelect,
}: {
  progress: MotionValue<number>;
  activeId: ServiceId;
  onSelect: (id: ServiceId) => void;
}) {
  return (
    <nav
      aria-label="Service journey"
      className="cq-journey-rail relative mt-8 hidden items-center justify-center gap-7 lg:flex"
    >
      {SERVICES.map((service, index) => (
        <RailStop
          key={service.id}
          service={service}
          index={index}
          progress={progress}
          active={service.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}

function RailStop({
  service,
  index,
  progress,
  active,
  onSelect,
}: {
  service: Service;
  index: number;
  progress: MotionValue<number>;
  active: boolean;
  onSelect: (id: ServiceId) => void;
}) {
  const count = SERVICES.length;
  const fill = useTransform(progress, [index / count, (index + 1) / count], [0, 1]);
  const shortName = service.id === "systems" ? "Systems" : service.label;

  return (
    <button
      type="button"
      onClick={() => onSelect(service.id)}
      aria-current={active ? "true" : undefined}
      className="group flex cursor-pointer items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petroleo"
    >
      <span
        className={`text-[0.62rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ${
          active ? "text-foreground" : "text-foreground/40 group-hover:text-foreground/70"
        }`}
      >
        0{index + 1} · {shortName}
      </span>
      <span className="relative h-[2px] w-14 overflow-hidden rounded-full bg-foreground/10">
        <motion.span
          aria-hidden
          style={{ scaleX: fill, backgroundColor: service.color }}
          className="absolute inset-0 origin-left rounded-full"
        />
      </span>
    </button>
  );
}
