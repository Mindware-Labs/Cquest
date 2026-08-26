"use client";

import Image from "next/image";
import { motion } from "motion/react";
import SectionIntro from "@/components/services/SectionIntro";
import {
  groupVariants,
  mediaRevealVariants,
  mediaSettleVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { PHOTOS } from "../data";
import FrameTicks from "./FrameTicks";
import styles from "./PhotosSection.module.css";

const COPY = {
  heading: "The operation up close",
};

export default function PhotosSection({ reduced }: { reduced: boolean }) {
  const t = COPY;
  return (
    <section id="facility" className={styles.photosSection}>
      <div className={container.container}>
        <SectionIntro
          title={t.heading}
          reduced={reduced}
          accentColor="var(--bp-teal)"
        />
        <motion.div
          className={styles.photoGrid}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {PHOTOS.map((photo) => (
            <motion.div
              key={photo.src}
              className={styles.photoFrame}
              variants={softRiseVariants}
            >

              <motion.div className={styles.photoReveal} variants={mediaRevealVariants}>
                <motion.div className={styles.photoZoom} variants={mediaSettleVariants}>
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 42rem) 100vw, 50vw"
                    className={styles.photoImage}
                  />
                </motion.div>
              </motion.div>
              <FrameTicks />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
