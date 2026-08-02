"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./SpotlightCard.module.css";

/**
 * Magic UI-style "spotlight card": a soft glow that tracks the cursor across
 * the card surface via CSS custom properties, updated on the client with a
 * plain pointermove handler (no extra animation library — GSAP owns
 * scroll-driven motion elsewhere in About, this is a pointer-driven effect).
 * Skips the glow entirely under reduced motion, matching the rest of About's
 * reduced-motion contract.
 *
 * Measuring follows `useMagnetic`: the card's box is read once when the
 * pointer arrives and reused, and the custom-property writes are collapsed
 * into one rAF. A `getBoundingClientRect` per pointermove is a forced
 * synchronous layout, and these cards sit in a list of four — every one of
 * them was flushing layout on every move event. Scroll and resize drop the
 * cached box, and only while the pointer is actually on the card.
 */
export default function SpotlightCard({
  children,
  className,
  reduced,
  glowColor = "var(--ab-celeste)",
}: {
  children: ReactNode;
  className?: string;
  reduced: boolean;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);

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
    if (!node || !hovering.current) return;
    if (!rect.current) rect.current = node.getBoundingClientRect();
    const box = rect.current;
    node.style.setProperty("--spotlight-x", `${pointer.current.x - box.left}px`);
    node.style.setProperty("--spotlight-y", `${pointer.current.y - box.top}px`);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    pointer.current.x = event.clientX;
    pointer.current.y = event.clientY;
    if (!frame.current) frame.current = requestAnimationFrame(apply);
  }

  function handlePointerEnter() {
    if (reduced || !ref.current) return;
    hovering.current = true;
    rect.current = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--spotlight-opacity", "1");
  }

  function handlePointerLeave() {
    hovering.current = false;
    rect.current = null;
    if (!ref.current) return;
    ref.current.style.setProperty("--spotlight-opacity", "0");
  }

  return (
    <div
      ref={ref}
      className={[styles.spotlightCard, className].filter(Boolean).join(" ")}
      style={{ "--spotlight-color": glowColor } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {!reduced && <span aria-hidden className={styles.spotlightGlow} />}
      <div className={styles.spotlightContent}>{children}</div>
    </div>
  );
}
