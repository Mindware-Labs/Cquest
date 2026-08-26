"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import SectionIntro from "@/components/services/SectionIntro";
import container from "@/components/services/Container.module.css";
import { groupVariants, softRiseVariants, VIEWPORT } from "@/components/services/motion";
import { CLIENT_LOGOS } from "../data";
import ClientDialog from "./ClientDialog";
import styles from "./ClientsSection.module.css";

const COPY = {
  heading: "Clients we've built custom systems for",
  logosAriaLabel: "Client logos",
  viewDetails: (name: string) => `${name} — view details`,
};

export default function ClientsSection({ reduced }: { reduced: boolean }) {
  const t = COPY;
  const [activeClientName, setActiveClientName] = useState<string | null>(null);
  const activeClient = CLIENT_LOGOS.find((client) => client.name === activeClientName) ?? null;
  const clientTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lastTriggerName = useRef<string | null>(null);

  const openClientDialog = (name: string) => {
    lastTriggerName.current = name;
    setActiveClientName(name);
  };
  const closeClientDialog = () => setActiveClientName(null);

  useEffect(() => {
    if (!activeClientName) return;
    document.body.style.overflow = "hidden";

    window.__lenis?.stop();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeClientDialog();
    };
    window.addEventListener("keydown", handleKeyDown);
    const triggerRefs = clientTriggerRefs.current;
    return () => {
      document.body.style.overflow = "";
      window.__lenis?.start();
      window.removeEventListener("keydown", handleKeyDown);
      const triggerName = lastTriggerName.current;
      const trigger = triggerName ? triggerRefs[triggerName] : null;
      trigger?.focus();
    };
  }, [activeClientName]);

  return (
    <section id="clients" className={styles.clientsSection}>
      <div className={container.container}>
        <SectionIntro title={t.heading} reduced={reduced} accentColor="var(--sy-blue)" />
        <motion.ul
          className={styles.logoWall}
          aria-label={t.logosAriaLabel}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          {CLIENT_LOGOS.map((brand) => (
            <motion.li key={brand.name} variants={softRiseVariants}>
              <button
                type="button"
                ref={(node) => {
                  clientTriggerRefs.current[brand.name] = node;
                }}
                className={styles.logoTrigger}
                onClick={() => openClientDialog(brand.name)}
                aria-haspopup="dialog"
                aria-label={t.viewDetails(brand.name)}
              >
                <motion.span
                  className={styles.logoImageWrap}
                  data-size={"size" in brand ? brand.size : undefined}
                  layoutId={reduced ? undefined : `sy-client-badge-${brand.name}`}
                >
                  <Image src={brand.src} alt={`${brand.name} logo`} fill sizes="(min-width: 64rem) 18vw, 40vw" className={styles.logoImage} />
                </motion.span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <AnimatePresence>
        {activeClient && <ClientDialog client={activeClient} onClose={closeClientDialog} reduced={reduced} />}
      </AnimatePresence>
    </section>
  );
}
