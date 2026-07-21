"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import container from "@/components/services/Container.module.css";
import { focusRiseVariants, groupVariants, nodeVariants, stepVariants } from "@/components/services/motion";
import { PROCESS } from "../data";
import styles from "./ProcessSection.module.css";

export default function ProcessSection({ reduced }: { reduced: boolean }) {
  // The process connecting line draws itself as the timeline scrolls through —
  // spring-smoothed so it trails the scroll like a needle, not a scrubber.
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: lineProgress } = useScroll({
    target: trackRef,
    offset: ["start 82%", "end 60%"],
  });
  const lineScale = useSpring(
    useTransform(lineProgress, [0, 1], reduced ? [1, 1] : [0, 1]),
    { stiffness: 120, damping: 28, restDelta: 0.001 },
  );

  return (
    <section id="method" className={styles.processSection}>
      <div className={container.container}>
        <SectionIntro
          title={<>A method the client<br />can understand</>}
          description="Every engagement follows the same disciplined sequence, from first discovery call to the ongoing work of getting better."
          reduced={reduced}
          accentColor="var(--cc-sky)"
        />
        <div ref={trackRef} className={styles.processTrack}>
          <motion.span
            className={styles.processLine}
            aria-hidden
            style={{ scaleX: lineScale }}
          />
          <motion.ol
            className={styles.processList}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={{ once: true, margin: "-60px" }}
            variants={groupVariants}
          >
            {PROCESS.map((step, index) => (
              <motion.li key={step.title} className={styles.processStep} variants={stepVariants}>
                <motion.span className={styles.processNode} aria-hidden variants={nodeVariants} />
                <motion.div className={styles.processBody} variants={focusRiseVariants}>
                  <span className={styles.processNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p>
                </motion.div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
