"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./SpotlightCard.module.css";

/**
 * Magic UI-style "spotlight card": a soft glow that tracks the cursor across
 * the card surface via CSS custom properties, updated on the client with a
 * plain pointermove handler (no extra animation library — GSAP owns
 * scroll-driven motion elsewhere in About, this is a pointer-driven effect).
 * Skips the glow entirely under reduced motion, matching the rest of About's
 * reduced-motion contract.
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

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    ref.current.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  function handlePointerEnter() {
    if (reduced || !ref.current) return;
    ref.current.style.setProperty("--spotlight-opacity", "1");
  }

  function handlePointerLeave() {
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
