"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { softRiseVariants } from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import FrameTicks from "./FrameTicks";
import frame from "./Frame.module.css";
import styles from "./MediaBand.module.css";

export default function MediaBand({ reduced }: { reduced: boolean }) {
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
        <FrameTicks />
        <figcaption className={frame.frameLabel}>
          <span>Image placeholder</span>
          <strong>BPO operations floor</strong>
          <small>Full-width band · 21:9 · real facility photo, WebP</small>
        </figcaption>
      </motion.figure>
    </div>
  );
}
