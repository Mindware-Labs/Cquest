import type { Metadata } from "next";
import Link from "next/link";
import ServiceIcon from "@/components/services/ServiceIcon";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Case study | Center Quest",
  description: "This Center Quest systems case study is being prepared.",
  robots: { index: false, follow: true },
};

export default function WorkCaseStudyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/services/systems#work" className={styles.back}>
          <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 10H4M8.5 5.5 4 10l4.5 4.5" />
          </svg>
          Back to Systems
        </Link>

        <header className={styles.head}>
          <span className={styles.chip}><ServiceIcon name="layout" />Case study · CRM</span>
          <h1 className={styles.title}>In curation</h1>
          <p className={styles.lede}>
            This case study is being prepared. The full build — the challenge, the system we shipped, and
            the number it moved — will live here soon.
          </p>
        </header>

        <div className={styles.frame}>
          <div className={styles.slot}>
            <span className={styles.slotIcon}><ServiceIcon name="layout" /></span>
            <span className={styles.slotLabel}>Case study content</span>
            <span className={styles.slotMeta}>Coming soon</span>
          </div>
          <span className={styles.tick} data-c="tl" aria-hidden />
          <span className={styles.tick} data-c="tr" aria-hidden />
          <span className={styles.tick} data-c="bl" aria-hidden />
          <span className={styles.tick} data-c="br" aria-hidden />
        </div>

        <div className={styles.actions}>
          <Link href="/services/systems#contact" className={styles.primary}>
            Request a quote
            <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
            </svg>
          </Link>
          <Link href="/services/systems#work" className={styles.secondary}>Back to Systems</Link>
        </div>
      </div>
    </main>
  );
}
