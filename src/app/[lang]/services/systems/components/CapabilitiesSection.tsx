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
import { useI18n } from "@/i18n/I18nProvider";
import { CAPABILITY_DETAIL, SYSTEMS } from "../data";
import SystemPreview from "./SystemPreview";
import styles from "./CapabilitiesSection.module.css";

const COPY = {
  en: {
    title: <>Built for the operation,<br />shown as the product</>,
    description: "Four kinds of systems, each presented with what it includes and the benefit it creates for the operation running it.",
    system: "System",
    whatItIncludes: "What it includes",
    theBenefit: "The benefit",
  },
  es: {
    title: <>Construido para la operación,<br />presentado como producto</>,
    description: "Cuatro tipos de sistemas, cada uno presentado con lo que incluye y el beneficio que crea para la operación que lo usa.",
    system: "Sistema",
    whatItIncludes: "Qué incluye",
    theBenefit: "El beneficio",
  },
};

export default function CapabilitiesSection({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  return (
    <section id="capabilities" className={styles.capabilitiesSection}>
      <div className={container.container}>
        <SectionIntro
          title={t.title}
          description={t.description}
          reduced={reduced}
          accentColor="var(--sy-blue)"
        />
        <div className={styles.capRows}>
          {SYSTEMS.details.map((item, index) => {
            const detail = CAPABILITY_DETAIL[item.id];
            return (
              <motion.div
                key={item.id}
                className={styles.capRow}
                data-flip={index % 2 === 1 || undefined}
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={VIEWPORT}
                variants={groupVariants}
              >
                <motion.div className={styles.capCopy} variants={focusRiseVariants}>
                  <p className={styles.capKicker}><ServiceIcon name={item.icon} />{t.system} 0{index + 1}</p>
                  <h3>{item.title[lang]}</h3>
                  <p>{item.description[lang]}</p>
                  <div className={styles.capIncludes}>
                    <p className={styles.capListLabel}>{t.whatItIncludes}</p>
                    <ul>
                      {detail.includes[lang].map((line) => (<li key={line}>{line}</li>))}
                    </ul>
                  </div>
                  <div className={styles.capBenefit}>
                    <h4>{t.theBenefit}</h4>
                    <p>{detail.benefit[lang]}</p>
                  </div>
                </motion.div>
                <motion.div className={styles.capMedia} variants={softRiseVariants}>
                  <SystemPreview id={item.id} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
