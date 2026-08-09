"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import { SERVICES } from "@/components/services/data";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n/format";
import CapabilityTags from "./CapabilityTags";
import ServiceCta from "./ServiceCta";
import SlideBackdrop from "./SlideBackdrop";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* Umbral de swipe en "potencia" (desplazamiento x velocidad), no en píxeles:
   un flick corto y rápido cuenta igual que un arrastre largo y lento. */
const SWIPE_THRESHOLD = 9000;
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity;

const BAND_DVH = 45;
/* La pista de scroll: un viewport pegado más una banda por servicio. */
const TRACK_DVH = 100 + SERVICES.length * BAND_DVH;

const BAND = 1 / SERVICES.length;

/* Histéresis: sin ella, parar el scroll justo en una frontera hace que el
   índice parpadee entre dos servicios. */
const HYSTERESIS = BAND * 0.12;

/* Márgenes de entrada/salida del escenario, en px y en fracción de banda: los
   px mandan en pantallas altas y la fracción en las bajas. */
const STAGE_LEAD_PX = 84;
const STAGE_TAIL_PX = 26;
const STAGE_TAIL_BAND = 0.035;

const STAGE_RELEASE_PX = 30;
const STAGE_RELEASE_BAND = 0.07;

const FIELD_LEAD_PX = 26;
const FIELD_DRIFT_PX = 38;

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

const pageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 110 : -110,
    opacity: 0,
    scale: 1.02,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -110 : 110,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.38, ease: EASE_OUT },
  }),
};

const stageVariants: Variants = {
  enter: {},
  center: { transition: { delayChildren: 0.14, staggerChildren: 0.07 } },
};
const stageItemVariants: Variants = {
  enter: { opacity: 0, y: 34 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: EASE_OUT },
  },
};

export default function ServicesCarousel() {
  const { dict, lang } = useI18n();
  const reduced = useReducedMotion() ?? false;

  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);

  const tabVisible = useTabVisibility();
  const service = SERVICES[index];
  const sectionRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  const [approaching, setApproaching] = useState(false);

  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const node = sheetRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setOnScreen(true);
      setApproaching(true);
      return;
    }
    const ambientIo = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "0px 0px -55% 0px", threshold: 0 },
    );

    const promoteIo = new IntersectionObserver(
      ([entry]) => setApproaching(entry.isIntersecting),
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    ambientIo.observe(node);
    promoteIo.observe(node);
    return () => {
      ambientIo.disconnect();
      promoteIo.disconnect();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const { scrollYProgress: approach } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  const indexRef = useRef(0);
  const sceneReadyRef = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const current = indexRef.current;

    const shouldRunScene =
      current === 0 && progress >= STAGE_TAIL_BAND && progress < BAND + HYSTERESIS;
    if (shouldRunScene !== sceneReadyRef.current) {
      sceneReadyRef.current = shouldRunScene;
      setSceneReady(shouldRunScene);
    }

    let next = current;

    while (next < SERVICES.length - 1 && progress >= (next + 1) * BAND + HYSTERESIS) {
      next += 1;
    }
    while (next > 0 && progress < next * BAND - HYSTERESIS) {
      next -= 1;
    }
    if (next === current) return;
    indexRef.current = next;
    setPage([next, next > current ? 1 : -1]);
  });

  const bandFill = useTransform(
    scrollYProgress,
    [index * BAND, (index + 1) * BAND],
    [0, 1],
    { clamp: true },
  );

  const stageY = useTransform([approach, scrollYProgress], (values: number[]) => {
    const [entering = 0, pinned = 0] = values;
    if (entering < 1) {
      return STAGE_LEAD_PX - (STAGE_LEAD_PX - STAGE_TAIL_PX) * easeOutQuint(entering);
    }
    const settling = STAGE_TAIL_PX * (1 - easeOutQuint(clamp01(pinned / STAGE_TAIL_BAND)));
    const leaving = clamp01((pinned - (1 - STAGE_RELEASE_BAND)) / STAGE_RELEASE_BAND);
    return settling - STAGE_RELEASE_PX * leaving * leaving;
  });

  const fieldY = useTransform([approach, bandFill], (values: number[]) => {
    const [entering = 0, filled = 0] = values;
    if (entering < 1) return FIELD_LEAD_PX * (1 - easeOutQuint(entering));
    return -FIELD_DRIFT_PX * filled;
  });

  const scrollToIndex = useCallback((next: number) => {
    const section = sectionRef.current;
    if (!section) return;

    requestAnimationFrame(() => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const budget = Math.max(1, section.offsetHeight - window.innerHeight);

      const target = top + ((next + 0.5) * BAND) * budget;
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(target, { duration: 0.85 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    });
  }, []);

  const paginate = (dir: number) => {
    const next = Math.min(SERVICES.length - 1, Math.max(0, index + dir));
    if (next !== index) scrollToIndex(next);
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-roledescription="carousel"
      aria-label={dict.carousel.ariaLabel}
      style={{ height: `${TRACK_DVH}dvh` } as CSSProperties}
      className="cq-carousel-track relative w-full"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") paginate(1);
        if (event.key === "ArrowLeft") paginate(-1);
      }}
    >

      <div
        ref={sheetRef}

        data-ambient-active={tabVisible && onScreen && !reduced}

        data-promote={approaching && !reduced}
        className="cq-carousel-sheet sticky top-0 isolate h-dvh w-full overflow-hidden text-foreground"
      >

        <AnimatePresence initial={false} custom={direction}>
          <motion.article
            key={service.id}
            aria-label={format(dict.carousel.slideAriaLabel, { index: index + 1, total: SERVICES.length, label: service.label[lang] })}
            custom={direction}

            style={{ "--svc": service.color, "--svc-glow": service.glow } as CSSProperties}
            variants={reduced ? undefined : pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              const power = swipePower(info.offset.x, info.velocity.x);
              if (power < -SWIPE_THRESHOLD) paginate(1);
              else if (power > SWIPE_THRESHOLD) paginate(-1);
            }}
            className="absolute inset-0 flex cursor-grab touch-pan-y items-center justify-center active:cursor-grabbing"
          >

            <motion.div
              aria-hidden
              style={reduced ? undefined : { y: fieldY }}
              className="cq-carousel-scroll-layer pointer-events-none absolute inset-x-0 -inset-y-12"
            >
              <SlideBackdrop service={service} active={sceneReady} />
            </motion.div>

            <motion.div
              style={reduced ? undefined : { y: stageY }}
              variants={reduced ? undefined : stageVariants}
              className="cq-carousel-scroll-layer relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center sm:px-10"
            >
              <motion.p
                variants={reduced ? undefined : stageItemVariants}
                className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--svc)_62%,var(--foreground))]"
              >
                {dict.carousel.businessLinePrefix} · 0{index + 1}
              </motion.p>
              <motion.h2
                variants={reduced ? undefined : stageItemVariants}
                className="mt-3 font-heading text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.03em]"
              >
                {service.label[lang]}
              </motion.h2>
              <motion.p
                variants={reduced ? undefined : stageItemVariants}
                className="mt-4 max-w-[38ch] text-balance font-heading text-[clamp(1.05rem,2vw,1.35rem)] font-medium leading-snug text-foreground/90"
              >
                {service.shortLabel[lang]}
              </motion.p>
              <motion.p
                variants={reduced ? undefined : stageItemVariants}
                className="mt-5 max-w-[52ch] text-pretty text-[.95rem] leading-relaxed text-[var(--text-secondary)] sm:text-base"
              >
                {service.strapline[lang]} {service.description[lang]}
              </motion.p>

              <CapabilityTags service={service} reduced={reduced} />

              <motion.div variants={reduced ? undefined : stageItemVariants}>
                <ServiceCta service={service} />
              </motion.div>
            </motion.div>
          </motion.article>
        </AnimatePresence>

        <div aria-hidden className="cq-noise pointer-events-none absolute inset-0" />

        <nav
          aria-label={dict.carousel.chooseServiceAriaLabel}
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5"
        >
          {SERVICES.map((entry, dotIndex) => {
            const isCurrent = dotIndex === index;
            return (
              <button
                key={entry.id}
                type="button"
                aria-label={entry.label[lang]}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => scrollToIndex(dotIndex)}
                className="relative h-2 overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petroleo"
                style={{
                  width: isCurrent ? "1.75rem" : "0.5rem",
                  backgroundColor: isCurrent
                    ? "color-mix(in srgb, var(--foreground) 12%, transparent)"
                    : "color-mix(in srgb, var(--foreground) 18%, transparent)",
                }}
              >
                {isCurrent ? (
                  <motion.span
                    aria-hidden
                    style={{ scaleX: bandFill, backgroundColor: entry.color }}
                    className="absolute inset-0 origin-left rounded-full"
                  />
                ) : null}
              </button>
            );
          })}
          <span className="ml-2 text-[0.68rem] font-semibold tabular-nums tracking-[0.16em] text-foreground/50">
            0{index + 1} / 0{SERVICES.length}
          </span>
        </nav>
      </div>
    </section>
  );
}
