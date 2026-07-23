"use client";

import Image from "next/image";
import { motion } from "motion/react";
import SectionIntro from "@/components/services/SectionIntro";
import {
  groupVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import FrameTicks from "./FrameTicks";
import styles from "./PhotosSection.module.css";

const PHOTOS = [
  { title: "Back-office team at work", src: "/bpo-services/bpo-floor2.jpg" },
  { title: "Process floor detail", src: "/bpo-services/bpo-floor3.jpeg" },
] as const;

export default function PhotosSection({ reduced }: { reduced: boolean }) {
  return (
    <section id="facility" className={styles.photosSection}>
      <div className={container.container}>
        <SectionIntro
          title="The operation up close"
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
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="(max-width: 42rem) 100vw, 50vw"
                className={styles.photoImage}
              />
              <FrameTicks />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
