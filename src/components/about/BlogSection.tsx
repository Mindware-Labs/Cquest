"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import {
  groupVariants,
  ruleXVariants,
  settleVariants,
  stepVariants,
  VIEWPORT,
} from "@/components/services/motion";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./BlogSection.module.css";

export type HomePost = {
  slug: string;
  title: string;
  coverUrl: string | null;
  coverAlt: string | null;
  categoryName: string | null;
  publishedAt: string;
  readingMinutes: number;
};

export type BlogTeaser = {
  latest: HomePost | null;
  postCount: number;
  categoryCount: number;
};

/* El blog es monolingüe en inglés, pero el cromo del home todavía se traduce
   mientras la estructura [lang] siga en pie. */
const COPY = {
  en: {
    eyebrow: "Blog",
    heading: "What the operation taught us",
    lead: "Service levels, back-office throughput and the systems we build around them — written by the people who run them, not by a marketing desk.",
    cta: "Read the blog",
    latest: "Latest",
    read: "min read",
    articles: "Articles",
    topics: "Topics",
  },
  es: {
    eyebrow: "Blog",
    heading: "Lo que nos enseñó la operación",
    lead: "Niveles de servicio, rendimiento de back office y los sistemas que construimos alrededor, escrito por quienes los operan y no por un área de marketing.",
    cta: "Leer el blog",
    latest: "Lo último",
    read: "min de lectura",
    articles: "Artículos",
    topics: "Temas",
  },
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

function ImageMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden="true">
      <rect x="2.2" y="3.2" width="11.6" height="9.6" />
      <path d="m2.2 10.6 3-2.6 3.2 2.8 2.4-2 3 2.4" strokeLinejoin="round" />
      <circle cx="5.8" cy="6.2" r="0.9" />
    </svg>
  );
}

export default function BlogSection({ teaser, reduced }: { teaser: BlogTeaser; reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const { latest, postCount, categoryCount } = teaser;

  // Sin nada publicado no hay sección: un bloque vacío en el home resta.
  if (!latest) return null;

  const motionProps = reduced
    ? {}
    : ({
        initial: "hidden",
        whileInView: "visible",
        viewport: VIEWPORT,
        variants: groupVariants,
      } as const);

  return (
    <section id="blog" className={styles.blogSection}>
      <div className={container.container}>
        <motion.div className={styles.layout} {...motionProps}>
          <div>
            <motion.span
              className={styles.rule}
              aria-hidden
              variants={reduced ? undefined : ruleXVariants}
            />
            <motion.span className={styles.eyebrow} variants={reduced ? undefined : settleVariants}>
              {t.eyebrow}
            </motion.span>
            <motion.h2 className={styles.heading} variants={reduced ? undefined : settleVariants}>
              {t.heading}
            </motion.h2>
            <motion.p className={styles.lead} variants={reduced ? undefined : settleVariants}>
              {t.lead}
            </motion.p>

            <motion.div variants={reduced ? undefined : settleVariants}>
              <LocalizedLink className={styles.cta} href="/blog">
                {t.cta}
                <Arrow />
              </LocalizedLink>
            </motion.div>

            <motion.div className={styles.stats} variants={reduced ? undefined : stepVariants}>
              <span className={styles.stat}>
                <span className={styles.statValue}>{postCount}</span>
                <span className={styles.statLabel}>{t.articles}</span>
              </span>
              <span className={styles.stat}>
                <span className={styles.statValue}>{categoryCount}</span>
                <span className={styles.statLabel}>{t.topics}</span>
              </span>
            </motion.div>
          </div>

          <motion.div variants={reduced ? undefined : stepVariants}>
            <LocalizedLink className={styles.frameLink} href={`/blog/${latest.slug}`}>
              <div className={styles.frame}>
                <span aria-hidden className={styles.frameCorner} data-corner="tl" />
                <span aria-hidden className={styles.frameCorner} data-corner="tr" />
                <span aria-hidden className={styles.frameCorner} data-corner="bl" />
                <span aria-hidden className={styles.frameCorner} data-corner="br" />

                {latest.coverUrl ? (
                  <Image
                    className={styles.cover}
                    src={latest.coverUrl}
                    alt={latest.coverAlt ?? ""}
                    fill
                    sizes="(max-width: 64rem) 100vw, 45vw"
                  />
                ) : (
                  <span className={styles.coverEmpty}>
                    <ImageMark />
                  </span>
                )}

                <div className={styles.caption}>
                  <span className={styles.captionMeta}>
                    <span className={styles.captionCategory}>{t.latest}</span>
                    {latest.categoryName && (
                      <>
                        <span className={styles.captionDot} aria-hidden="true" />
                        <span>{latest.categoryName}</span>
                      </>
                    )}
                    <span className={styles.captionDot} aria-hidden="true" />
                    <time dateTime={latest.publishedAt}>
                      {dateFormat.format(new Date(latest.publishedAt))}
                    </time>
                    <span className={styles.captionDot} aria-hidden="true" />
                    <span>
                      {latest.readingMinutes} {t.read}
                    </span>
                  </span>
                  <p className={styles.captionTitle}>{latest.title}</p>
                </div>
              </div>
            </LocalizedLink>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
