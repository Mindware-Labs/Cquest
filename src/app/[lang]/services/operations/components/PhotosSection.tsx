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
import { useI18n } from "@/i18n/I18nProvider";
import FrameTicks from "./FrameTicks";
import styles from "./PhotosSection.module.css";

const PHOTOS = [
  { title: { en: "Back-office team at work", es: "Equipo de back office en acción" }, src: "/bpo-services/bpo-floor2.jpg" },
  { title: { en: "Process floor detail", es: "Detalle del piso de procesos" }, src: "/bpo-services/bpo-floor3.jpeg" },
] as const;

const COPY = {
  en: { heading: "The operation up close" },
  es: { heading: "La operación de cerca" },
};

export default function PhotosSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
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
              key={photo.title.en}
              className={styles.photoFrame}
              variants={softRiseVariants}
            >
              {/* Frame sharpens in (its CSS keeps the hover lift); inside,
                  the crop wipes open while the photo settles from a slight
                  overscale — the grid's stagger offsets the two reveals. */}
              <motion.div className={styles.photoReveal} variants={mediaRevealVariants}>
                <motion.div className={styles.photoZoom} variants={mediaSettleVariants}>
                  <Image
                    src={photo.src}
                    alt={photo.title[lang]}
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
