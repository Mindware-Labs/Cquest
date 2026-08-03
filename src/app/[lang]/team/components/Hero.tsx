"use client";

import { motion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import {
  EASE_OUT,
  focusRiseVariants,
  heroCopyVariants,
  heroCurtainVariants,
  heroLinesVariants,
  passThroughVariants,
} from "@/components/services/motion";
import Silhouette from "@/components/team/Silhouette";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import styles from "./Hero.module.css";

/* Every figure below comes from components/about/data.ts, which marks it as
   real client-supplied headcount. Nothing here describes the DEPARTMENT
   structure — that does not exist yet, and the chart below carries its own
   placeholder notice. */
const COPY = {
  en: {
    eyebrow: "Our team",
    lines: [
      { text: "The people behind", strong: false },
      { text: "every operation.", strong: true },
    ],
    lead: "Over 200 call center operators, 10 specialized developers, and a dedicated HR department whose only job is finding and training the right people.",
    seeChart: "See the org chart",
    talk: "Talk to us",
    wallCaption: "Portraits pending",
  },
  es: {
    eyebrow: "Nuestro equipo",
    lines: [
      { text: "La gente detrás", strong: false },
      { text: "de cada operación.", strong: true },
    ],
    lead: "Más de 200 operadores de call center, 10 programadores especializados y un departamento de RRHH dedicado exclusivamente a buscar y formar a la gente correcta.",
    seeChart: "Ver el organigrama",
    talk: "Hablemos",
    wallCaption: "Retratos pendientes",
  },
};

/* ── The wall ────────────────────────────────────────────────────────────
   Three columns of portrait frames, taller than the frame that holds them so
   they run off the top and bottom edges.

   That overflow is the whole design. A finite 4×3 block of empty frames reads
   as twelve empty boxes — as something missing. A wall that leaves the frame
   in both directions reads as scale: the eye takes it as a fragment of
   something much larger, and the emptiness stops being an absence and becomes
   the size of the organisation. The columns drift slowly against each other
   for the same reason, which is also what keeps it from reading as wallpaper.

   When the real portraits arrive they drop into exactly these tiles. */
const COLUMNS = 3;
const TILES_PER_COLUMN = 5;

function Wall({ reduced, caption }: { reduced: boolean; caption: string }) {
  return (
    <div className={styles.wall} aria-hidden>
      <div className={styles.wallInner} data-still={reduced}>
        {Array.from({ length: COLUMNS }, (_, column) => (
          <div key={column} className={styles.wallColumn} data-column={column}>
            {Array.from({ length: TILES_PER_COLUMN }, (_, tile) => (
              <motion.span
                key={tile}
                className={styles.tile}
                initial={reduced ? false : { opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                /* Diagonal cascade: the wall assembles from the near corner
                   outward rather than column by column, which would read as
                   three separate lists arriving. */
                transition={{
                  duration: 0.7,
                  ease: EASE_OUT,
                  delay: 0.35 + (column + tile) * 0.06,
                }}
              >
                <Silhouette className={styles.tileArt} />
              </motion.span>
            ))}
          </div>
        ))}
      </div>
      <span className={styles.wallCaption}>{caption}</span>
    </div>
  );
}

export default function Hero({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];

  return (
    <header data-hero-boundary className={styles.hero}>
      <div aria-hidden className={styles.vignette} />
      <div aria-hidden className={`${styles.grain} cq-noise`} />

      <div className={`${container.container} ${styles.grid}`}>
        <motion.div
          className={styles.copy}
          variants={heroCopyVariants}
          initial={reduced ? false : "hidden"}
          animate="visible"
        >
          <motion.span className={styles.eyebrow} variants={focusRiseVariants}>
            <span className={styles.eyebrowRule} aria-hidden />
            {t.eyebrow}
          </motion.span>

          <motion.h1 className={styles.headline} variants={heroLinesVariants}>
            {t.lines.map((line) => (
              <motion.span key={line.text} className={styles.lineMask} variants={passThroughVariants}>
                <motion.span
                  className={line.strong ? `${styles.line} ${styles.lineStrong}` : styles.line}
                  variants={heroCurtainVariants}
                >
                  {line.text}
                </motion.span>
              </motion.span>
            ))}
          </motion.h1>

          <motion.p className={styles.lead} variants={focusRiseVariants}>
            {t.lead}
          </motion.p>

          <motion.div className={styles.actions} variants={focusRiseVariants}>
            <a href="#chart" className={styles.primaryCta}>
              {t.seeChart} <Arrow direction="down" />
            </a>
            <LocalizedLink href="/quote" className={styles.secondaryCta}>
              {t.talk} <Arrow />
            </LocalizedLink>
          </motion.div>
        </motion.div>

        {/* The caption deliberately carries no count. The only headcount this
            page can reach is the mockup roster's (25), and printing it beside
            a lead that says "over 200 operators" would put two contradictory
            numbers one column apart. */}
        <Wall reduced={reduced} caption={t.wallCaption} />
      </div>
    </header>
  );
}
