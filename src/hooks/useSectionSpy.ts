"use client";

import { useEffect, useState } from "react";

/**
 * Reports which of a set of `#hash` targets is the one currently being read,
 * so a nav built out of in-page anchors can mark its own place.
 *
 * Picks the *last section whose top edge has crossed the header line* rather
 * than the most-visible one: with sections of wildly different heights (a
 * 27rem capability panel next to a 13rem metrics band) "most visible" makes
 * the marker jump backwards the moment a short section is fully on screen,
 * which reads as a glitch. "Topmost passed" only ever moves forward as you
 * scroll down, which is what a reader expects of a place marker.
 *
 * Driven by a rAF-throttled scroll listener instead of IntersectionObserver:
 * IO only fires on threshold crossings, so between them the marker would sit
 * stale through long stretches of a tall section.
 */
export function useSectionSpy(hrefs: readonly string[], offsetPx: number) {
  const [active, setActive] = useState<string | null>(null);
  // hrefs is rebuilt every render by getServiceNavLinks(), so its identity is
  // never stable — key the effect on the content instead.
  const key = hrefs.join("|");

  useEffect(() => {
    const sections = key
      .split("|")
      .filter((href) => href.startsWith("#"))
      .map((href) => document.getElementById(href.slice(1)))
      .filter((element): element is HTMLElement => element !== null);

    let queued = false;
    const update = () => {
      queued = false;
      // +1 so a section resting exactly on the line counts as reached. With
      // no sections the loop leaves `current` null, which is also how a nav
      // with no in-page anchors clears a stale marker after a route change.
      const line = offsetPx + 1;
      let current: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = `#${section.id}`;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    // Deferred rather than called inline: it keeps the first measurement out
    // of the commit phase (no forced synchronous layout) and keeps setState
    // out of the effect body.
    const initial = requestAnimationFrame(update);
    if (sections.length === 0) return () => cancelAnimationFrame(initial);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key, offsetPx]);

  return active;
}
