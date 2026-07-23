"use client";

import { motion } from "motion/react";
import SectionIntro from "@/components/services/SectionIntro";
import ServiceIcon from "@/components/services/ServiceIcon";
import {
  focusRiseVariants,
  groupVariants,
  softRiseVariants,
  VIEWPORT,
} from "@/components/services/motion";
import container from "@/components/services/Container.module.css";
import { CAPABILITY_DETAIL, SYSTEMS } from "../data";
import SystemPreview from "./SystemPreview";
import styles from "./CapabilitiesSection.module.css";

export default function CapabilitiesSection({ reduced }: { reduced: boolean }) {
  return (
    <section id="capabilities" className={styles.capabilitiesSection}>
      <div className={container.container}>
        <SectionIntro
          title={<>Built for the operation,<br />shown as the product</>}
          description="Four kinds of systems, each presented with what it includes and the benefit it creates for the operation running it."
          reduced={reduced}
          accentColor="var(--sy-blue)"
        />
        <div className={styles.capRows}>
          {SYSTEMS.details.map((item, index) => {
            const detail = CAPABILITY_DETAIL[item.title];
            return (
              <motion.div
                key={item.title}
                className={styles.capRow}
                data-flip={index % 2 === 1 || undefined}
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={VIEWPORT}
                variants={groupVariants}
              >
                <motion.div className={styles.capCopy} variants={focusRiseVariants}>
                  <p className={styles.capKicker}><ServiceIcon name={item.icon} />System 0{index + 1}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className={styles.capIncludes}>
                    <p className={styles.capListLabel}>What it includes</p>
                    <ul>
                      {detail.includes.map((line) => (<li key={line}>{line}</li>))}
                    </ul>
                  </div>
                  <div className={styles.capBenefit}>
                    <h4>The benefit</h4>
                    <p>{detail.benefit}</p>
                  </div>
                </motion.div>
                <motion.div className={styles.capMedia} variants={softRiseVariants}>
                  <SystemPreview title={item.title} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
