"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  mediaRevealVariants,
  mediaSettleVariants,
  softRiseVariants,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import FrameTicks from "./FrameTicks";
import styles from "./MediaBand.module.css";

const ALT = { en: "Operations floor", es: "Piso de operaciones" };

export default function MediaBand({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  // The media band drifts on its own axis as it crosses the viewport, so the
  // hero → content seam reads as depth rather than a stacked block.
  const bandRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: bandProgress } = useScroll({
    target: bandRef,
    offset: ["start end", "end start"],
  });
  const bandY = useTransform(
    bandProgress,
    [0, 1],
    reduced ? [0, 0] : [28, -28],
  );

  return (
    <div ref={bandRef} className={`${container.container} ${styles.bandWrap}`}>
      <motion.figure
        className={styles.band}
        style={{ y: bandY }}
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={{ once: true, margin: "-40px" }}
        variants={softRiseVariants}
      >
        {/* The frame (border, shadow, ticks) sharpens in with the figure;
            inside it the photo is revealed in two layers of one gesture —
            the crop wipes open upward while the image settles from a slight
            overscale. */}
        <motion.div className={styles.bandReveal} variants={mediaRevealVariants}>
          <motion.div className={styles.bandZoom} variants={mediaSettleVariants}>
            <Image
              src="/bpo-services/bpo-floor.jpeg"
              alt={ALT[lang]}
              fill
              preload
              sizes="100vw"
              className={styles.bandImage}
            />
          </motion.div>
        </motion.div>
        <FrameTicks />
      </motion.figure>
    </div>
  );
}
