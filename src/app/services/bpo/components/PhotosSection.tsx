"use client";

import { motion } from "motion/react";
import SectionIntro from "@/components/services/SectionIntro";
import {
  groupVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import FrameTicks from "./FrameTicks";
import frame from "./Frame.module.css";
import styles from "./PhotosSection.module.css";

const PHOTOS = [
  { title: "Back-office team at work", meta: "4:3 · real team photo, WebP" },
  { title: "Process floor detail", meta: "4:3 · real facility photo, WebP" },
] as const;

export default function PhotosSection({ reduced }: { reduced: boolean }) {
  return (
    <section id="facility" className={styles.photosSection}>
      <div className={container.container}>
        <SectionIntro
          title="The operation up close"
          description="Real photos of the team and facilities will live here — evidence of the operation, not stock imagery."
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
              key={photo.title}
              className={styles.photoFrame}
              variants={softRiseVariants}
            >
              <FrameTicks />
              <div className={frame.frameLabel}>
                <span>Image placeholder</span>
                <strong>{photo.title}</strong>
                <small>{photo.meta}</small>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
