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

// Client dialog state and the logo grid live here, isolated from the rest of
// the page — opening/closing the dialog only re-renders this section. Same
// component this page's design mirrors from Call Center's ClientsSection,
// just re-themed to the systems accent and re-scoped to systems clients.
export default function ClientsSection({ reduced }: { reduced: boolean }) {
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
    // Lenis drives scroll through its own rAF loop independent of native
    // overflow, so `body.style.overflow = "hidden"` alone doesn't stop the
    // page behind the dialog from gliding along with a wheel/touch gesture —
    // the smooth-scroll engine itself has to be paused too.
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
        <SectionIntro title="Clients we've built custom systems for" reduced={reduced} accentColor="var(--sy-blue)" />
      </div>
      {/* Breaks out of the standard content container on purpose — with a
          short client list, boxing the wall to the 84rem container leaves it
          looking cramped/left-heavy; spanning the full viewport lets each
          logo breathe and reads as a wide trust bar instead of a form grid. */}
      <motion.ul
        className={styles.logoWall}
        aria-label="Client logos"
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
              aria-label={`${brand.name} — view details`}
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
      <AnimatePresence>
        {activeClient && <ClientDialog client={activeClient} onClose={closeClientDialog} reduced={reduced} />}
      </AnimatePresence>
    </section>
  );
}
