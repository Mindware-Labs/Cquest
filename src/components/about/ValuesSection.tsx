"use client";

import { motion } from "motion/react";
import { useEffect, useRef, type PointerEvent } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import SpotlightCard from "@/components/ui/SpotlightCard";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, ruleXVariants, stepVariants, VIEWPORT } from "@/components/services/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { gsap } from "@/lib/gsap";
import { ABOUT_VALUES } from "./data";
import { SCRUB, useIsomorphicLayoutEffect } from "./motion";
import styles from "./ValuesSection.module.css";

const COPY = {
  en: { heading: "How we operate", description: "The four commitments every account gets, regardless of size — read top to bottom, in the order they get built into an operation." },
  es: { heading: "Cómo operamos", description: "Los cuatro compromisos que recibe cada cuenta, sin importar el tamaño — en el orden en que se construyen dentro de una operación." },
};

// Icon follows the cursor a few pixels inside its circle — a restrained
// magnetic-pull micro-interaction, quickTo'd for a spring feel without
// re-triggering a full tween on every pointermove.
//
// Measuring follows `useMagnetic`: the circle's box is read once on arrival
// and reused, and the quickTo calls are collapsed into one rAF. Reading it
// per move event forced a synchronous layout on every one of the hundred-odd
// events a trackpad emits a second — and the icon is transformed by that very
// tween, so the read was flushing work the tween had just queued. quickTo
// renders on the GSAP ticker regardless, so one call per frame is identical.
// Each card sits in its real 2x2 grid cell from the start, then GSAP pulls
// it toward the center of the deck with xPercent/yPercent — relative to the
// card's own size, so the fan holds up at any breakpoint — plus a tilt and
// a slight downscale, so the four overlap like a shuffled hand of cards.
// Scrubbed (not a one-shot reveal): the fan only unwinds as far as the user
// has actually scrolled the section past, and reverses just as readily on
// scroll-up.
const CARD_FAN: ReadonlyArray<{ xPercent: number; yPercent: number; rotate: number; scale: number }> = [
  { xPercent: 46, yPercent: 40, rotate: -9, scale: 0.95 },
  { xPercent: -42, yPercent: 46, rotate: 6, scale: 0.94 },
  { xPercent: 40, yPercent: -38, rotate: -5, scale: 0.96 },
  { xPercent: -44, yPercent: -42, rotate: 8, scale: 0.97 },
];

function MagneticIcon({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const moveRef = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  const rect = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);

  useEffect(() => {
    if (reduced || !ref.current) return;
    moveRef.current = {
      x: gsap.quickTo(ref.current, "x", { duration: 0.4, ease: "power3" }),
      y: gsap.quickTo(ref.current, "y", { duration: 0.4, ease: "power3" }),
    };
  }, [reduced]);

  /* Only meaningful while the pointer is inside — the icon moves under a
     stationary cursor when the page scrolls, so the cached box goes stale. */
  useEffect(() => {
    const invalidate = () => {
      if (hovering.current) rect.current = null;
    };
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  function apply() {
    frame.current = 0;
    const node = ref.current;
    if (!node || !hovering.current || !moveRef.current) return;
    if (!rect.current) rect.current = node.getBoundingClientRect();
    const box = rect.current;
    moveRef.current.x((pointer.current.x - box.left - box.width / 2) * 0.35);
    moveRef.current.y((pointer.current.y - box.top - box.height / 2) * 0.35);
  }

  function handlePointerEnter() {
    if (reduced || !ref.current) return;
    hovering.current = true;
    rect.current = ref.current.getBoundingClientRect();
  }

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    if (reduced || !ref.current || !moveRef.current) return;
    if (!hovering.current) handlePointerEnter();
    pointer.current.x = event.clientX;
    pointer.current.y = event.clientY;
    if (!frame.current) frame.current = requestAnimationFrame(apply);
  }

  function handlePointerLeave() {
    hovering.current = false;
    rect.current = null;
    if (reduced || !moveRef.current) return;
    moveRef.current.x(0);
    moveRef.current.y(0);
  }

  return (
    <span
      ref={ref}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={styles.magneticIcon}
    >
      {children}
    </span>
  );
}

export default function ValuesSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<Array<HTMLLIElement | null>>([]);

  /* The blobs keep their own slow CSS drift (and its tab-visibility pause);
     this parallaxes the layer they live in, so scrolling adds depth without
     GSAP and the CSS keyframes fighting over the same transform. Result: the
     backdrop moves slower than the manifesto rows in front of it, which is
     what makes the section read as having a back wall at all. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !backdropRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: SCRUB,
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  /* The fan-to-grid unwind: each card starts pulled toward the deck's center
     (see CARD_FAN) and eases back to its resting transform as the list
     itself scrolls through the middle of the viewport — tied to scroll
     position via scrub, not a discrete on/off reveal, so it tracks the
     scrollbar directly in both directions. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !listRef.current) return;
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((el, index) => {
        if (!el) return;
        const fan = CARD_FAN[index % CARD_FAN.length];
        gsap.fromTo(
          el,
          { xPercent: fan.xPercent, yPercent: fan.yPercent, rotate: fan.rotate, scale: fan.scale },
          {
            xPercent: 0,
            yPercent: 0,
            rotate: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: listRef.current,
              start: "top 85%",
              end: "top 30%",
              scrub: SCRUB,
            },
          },
        );
      });
    }, listRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="values" ref={sectionRef} className={styles.valuesSection}>
      {/* Ambient backdrop only — its drift pauses with the rest of the page's
          always-on motion via #about[data-ambient-active="false"], and never
          renders at all under reduced motion. */}
      {!reduced && (
        <div ref={backdropRef} aria-hidden className={styles.valuesBackdrop}>
          <span className={`${styles.blob} ${styles.blobA}`} />
          <span className={`${styles.blob} ${styles.blobB}`} />
          <span className={styles.grain} />
        </div>
      )}
      <div className={container.container}>
        <motion.div
          className={styles.valuesHeading}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.div className={styles.valuesHeadingCopy} variants={stepVariants}>
            <motion.span className={styles.valuesRule} aria-hidden variants={ruleXVariants} />
            <motion.h2 variants={focusRiseVariants}>{t.heading}</motion.h2>
          </motion.div>
          <motion.p variants={focusRiseVariants}>{t.description}</motion.p>
        </motion.div>

        <ol ref={listRef} className={styles.valueList}>
          {ABOUT_VALUES.map((value, index) => (
            <li
              key={value.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              style={{ zIndex: index + 1 }}
            >
              <SpotlightCard className={styles.valueCard} reduced={reduced} glowColor={index % 2 === 0 ? "var(--ab-verde)" : "var(--ab-celeste)"}>
                <span className={styles.valueIndex} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.valueIcon} data-accent={index % 2 === 0 ? "verde" : "celeste"}>
                  <MagneticIcon reduced={reduced}>
                    <ServiceIcon name={value.icon} />
                  </MagneticIcon>
                </span>
                <span className={styles.valueCopy}>
                  <h3>{value.title[lang]}</h3>
                  <p>{value.description[lang]}</p>
                </span>
              </SpotlightCard>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
