"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { EASE_OUT } from "@/components/services/motion";
import styles from "./PhotoDeck.module.css";

const PHOTOS = [
  "/Personal/FotoEmpleado1.png",
  "/Personal/FotoEmpleado2.png",
  "/Personal/FotoEmpleado3.png",
  "/Personal/FotoEmpleado4.png",
  "/Personal/FotoEmpleado5.png",
  "/Personal/FotoEmpleado6.png",
  "/Personal/FotoEmpleado7.png",
  "/Personal/FotoEmpleado8.png",
  "/Personal/IMG_0929.JPG",
  "/Personal/IMG_0930.JPG",
  /* FotoGrupal.jpg stays out on purpose: it is a wide shot of ~40 people, and
     inside a 4/5 portrait tile the faces come out too small to read next to
     single-person portraits. It already has its own place in #metrics. */
] as const;

/* ── The wall ────────────────────────────────────────────────────────────
   Three columns of portraits, taller than the box that holds them so they run
   off the top and bottom edges.

   That overflow is the whole design. A finite block reads as a countable list
   of people. A wall that leaves the frame in both directions reads as SCALE:
   the eye takes it for a fragment of something much larger, which is the
   honest impression for an operation of 200+ people shown through ten
   photographs. */
const COLUMNS = 3;

/* Every photograph appears exactly once across the wall, so the columns are
   whatever length the roster divides into — 4/3/3 today, not a fixed five.
   A fixed tile count would force duplicates the moment it exceeded the roster,
   which is precisely what a wall of real colleagues cannot afford: the same
   face twice reads as a stock library, not as a team.

   Dealt round-robin rather than sliced into thirds, so photographs that were
   shot together land in different columns instead of stacking into one. */
const COLUMN_PHOTOS = Array.from({ length: COLUMNS }, (_, column) =>
  PHOTOS.filter((_photo, index) => index % COLUMNS === column),
);

/* The cascade would otherwise still be arriving after the loop starts moving. */
const MAX_STAGGER_STEPS = 7;

export default function PhotoDeck({
  reduced,
  label,
}: {
  reduced: boolean;
  label: string;
}) {
  return (
    <div className={styles.wall} role="img" aria-label={label}>
      <span aria-hidden className={styles.glow} />

      <div aria-hidden className={styles.wallInner} data-still={reduced}>
        {COLUMN_PHOTOS.map((photos, column) => (
          <div key={column} className={styles.wallColumn} data-column={column}>
            <div className={styles.track}>
              {/* Two identical passes. The track scrolls exactly one pass and
                  restarts, so the copy is already sitting where the original
                  was and the seam never shows. The copy is what makes the loop
                  continuous — it is not a second face on screen, because the
                  visible band is far shorter than one pass. */}
              {[...photos, ...photos].map((photo, index) => {
                const isCopy = index >= photos.length;
                const position = index % photos.length;

                return (
                  <motion.span
                    key={index}
                    className={styles.tile}
                    /* Only the first pass performs the entrance. The copy sits
                       below the wall on load, so animating it would spend time
                       on something nobody can see. */
                    initial={reduced || isCopy ? false : { opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    /* Diagonal cascade: the wall assembles from the near corner
                       outward rather than column by column, which would read as
                       three separate lists arriving. */
                    transition={{
                      duration: 0.58,
                      ease: EASE_OUT,
                      delay:
                        0.28 +
                        Math.min(column + position, MAX_STAGGER_STEPS) * 0.045,
                    }}
                  >
                    <Image
                      src={photo}
                      alt=""
                      fill
                      /* 92, same as the group portrait in #metrics and for the
                         same reason: these are faces at small size, and
                         anything lower lets the source JPEG's own artefacts
                         through the second compression right where the eye is
                         looking. */
                      quality={92}
                      className={styles.photo}
                      /* Faces sit above centre in these frames; the default
                         centre crop cuts foreheads on a portrait tile. */
                      style={{ objectPosition: "center 38%" }}
                      /* `sizes` describes the width of the DECODED image, not
                         the width of the tile — and with `object-fit: cover`
                         those are not the same number. Every source is 3:2
                         landscape (1186×791) and the tile is 4/5 portrait, so
                         `cover` matches on HEIGHT and lets the sides hang off
                         frame: the browser paints the photo at
                         tile_height × 3/2 = tile_width × 5/4 × 3/2 = tile_width
                         × 1.875, and only the middle 53% of that is visible.

                         The old values described the tile (16rem / 32vw), so
                         the browser downloaded a 256px-wide file and then had
                         to blow it up to ~437px to perform the crop. That 1.7×
                         upscale is the pixelation — the tiles were never short
                         of source pixels, they were short of DOWNLOADED ones.

                         So: tile × 1.875. Above 70rem the wall is the 1.14fr
                         column of an 84rem container ≈ 15rem per tile → 28rem.
                         Below it the wall goes full-bleed and three tiles plus
                         gaps are ~31vw each → 58vw. */
                      sizes="(max-width: 70rem) 58vw, 28rem"
                      /* Only the top row is above the fold on load; the rest
                         can wait rather than compete with the headline. */
                      preload={!isCopy && position === 0}
                    />
                  </motion.span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
