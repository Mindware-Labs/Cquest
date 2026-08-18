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
  "/Personal/FotoGrupal.jpg",
] as const;

/* ── The wall ────────────────────────────────────────────────────────────
   Three columns of portraits, taller than the box that holds them so they run
   off the top and bottom edges.

   That overflow is the whole design. A finite block reads as a countable list
   of people. A wall that leaves the frame in both directions reads as SCALE:
   the eye takes it for a fragment of something much larger, which is the
   honest impression for an operation of 200+ people shown through eleven
   photographs. */
const COLUMNS = 3;

/* Tiles per LOOP, not per column. Each column renders this set twice — see
   `.track` in the stylesheet — because a seamless loop needs a second copy to
   scroll into place before the first one has left. */
const TILES_PER_LOOP = 5;

/* Eleven photographs across fifteen tiles means repeats — unavoidable. What is
   avoidable is a repeat landing next to its twin. Both steps below are coprime
   with the roster length (eleven is prime, so any step below it works), so
   walking the roster never short-cycles: neighbours down a column are three
   apart, neighbours across a row are four apart, and no row or diagonal pairs
   the same face with itself. */
const COLUMN_STEP = 4;
const TILE_STEP = 3;

function photoAt(column: number, tile: number) {
  return PHOTOS[(column * COLUMN_STEP + tile * TILE_STEP) % PHOTOS.length];
}

/* The cascade would otherwise run to three seconds across fifteen tiles, and
   the last one would still be arriving after the loop has started moving. */
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
        {Array.from({ length: COLUMNS }, (_, column) => (
          <div key={column} className={styles.wallColumn} data-column={column}>
            <div className={styles.track}>
              {/* Two identical passes. The track scrolls exactly one pass and
                  restarts, so the copy is already sitting where the original
                  was and the seam never shows. */}
              {Array.from({ length: TILES_PER_LOOP * 2 }, (_, index) => {
                const tile = index % TILES_PER_LOOP;
                const isCopy = index >= TILES_PER_LOOP;

                return (
                  <motion.span
                    key={index}
                    className={styles.tile}
                    /* Only the first pass performs the entrance. The copy lives
                       below the fold of the wall on load, so animating it would
                       spend time on something nobody can see. */
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
                        Math.min(column + tile, MAX_STAGGER_STEPS) * 0.045,
                    }}
                  >
                    <Image
                      src={photoAt(column, tile)}
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
                      /* 70rem is where Hero.module.css collapses to one column
                         and the wall goes full-bleed — three tiles plus gaps
                         across the viewport is roughly 32vw each. Above it the
                         wall sits in the 1.22fr column of an 84rem container,
                         which works out to about 16rem per tile. */
                      sizes="(max-width: 70rem) 32vw, 16rem"
                      /* Only the first row is above the fold on load; the rest
                         can wait rather than compete with the headline. */
                      priority={!isCopy && tile === 0}
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
