"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/toc";
import styles from "./Article.module.css";

/* Marca el h2 más alto que siga visible. El margen inferior descarta los que
   ya pasaron por debajo del pliegue, que si no ganan al llegar al final. */
export default function ArticleToc({ entries, label }: { entries: TocEntry[]; label: string }) {
  const [active, setActive] = useState(entries[0]?.id ?? "");

  useEffect(() => {
    const targets = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // rootMargin solo acepta px o %: en rem el constructor lanza. 112px = 7rem.
      { rootMargin: "-112px 0px -55% 0px", threshold: 0 },
    );

    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav className={styles.toc} aria-label={label}>
      <span className={styles.asideTitle}>{label}</span>
      <ol className={styles.tocList}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              className={styles.tocLink}
              href={`#${entry.id}`}
              aria-current={active === entry.id ? "true" : undefined}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
