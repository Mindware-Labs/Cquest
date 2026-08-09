"use client";

import { useEffect, useState } from "react";

export function useSectionSpy(hrefs: readonly string[], offsetPx: number) {
  const [active, setActive] = useState<string | null>(null);

  /* El array llega nuevo en cada render; la clave string es lo que evita que
     el efecto se reinicie sin que haya cambiado nada. */
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
