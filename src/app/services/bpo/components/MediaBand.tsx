"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { softRiseVariants } from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import FrameTicks from "./FrameTicks";
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
        <Image
          src="/bpo-services/bpo-floor.jpeg"
          alt="Operations floor"
          fill
          sizes="100vw"
          className={styles.bandImage}
        />
        <FrameTicks />
      </motion.figure>
    </div>
  );
}
