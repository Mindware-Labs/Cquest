"use client";

import { useReducedMotion } from "motion/react";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import MetricsSection from "./MetricsSection";
import StorySection from "./StorySection";
import UpcomingSection from "./UpcomingSection";
import styles from "./AboutSection.module.css";

// "Nosotros" as a home-page section — same architecture as ServicesCarousel's
// "#services": no standalone route, just an anchor other pages/nav link into
// (see hero/animation.ts's pre-wired "#about" link and navigation/data.ts's
// dict.nav.aboutUs). Reuses the same section building blocks the standalone
// /about page used, minus the pieces that would duplicate what home already
// owns: its own Hero (HeroImage) and there is no sitewide Footer/CTA on home
// today, so this section doesn't invent one either — the quote/contact CTA
// lives on its own page and in the nav, same as every other home section.
export default function AboutSection() {
  const reduced = useReducedMotion() ?? false;
  // Same ambient-pause contract as the rest of the site: always-on pulses
  // hold their breath while the tab is hidden.
  const tabVisible = useTabVisibility();

  return (
    <section id="about" className={styles.aboutSection} data-ambient-active={tabVisible && !reduced}>
      <MetricsSection reduced={reduced} />
      <StorySection reduced={reduced} />
      {/* Reserved seats, not shipped designs: each is marked "in development"
          on purpose (see UpcomingSection). The clients wall will hold the
          general roster across all three business lines; partnerships closes
          the section once its content exists. */}
      <UpcomingSection
        id="clients"
        reduced={reduced}
        title={{
          en: "Clients who trust Center Quest",
          es: "Clientes que confían en Center Quest",
        }}
        note={{
          en: "The general client roster — one wall across call center, BPO and systems development — will live here. This section is in development.",
          es: "Aquí vivirá la cartera general de clientes — un solo muro a través de call center, BPO y desarrollo de sistemas. Esta sección está en desarrollo.",
        }}
      />
      <UpcomingSection
        id="pillars"
        reduced={reduced}
        title={{ en: "What we stand for", es: "En qué creemos" }}
        note={{
          en: "Our mission, vision and values will be presented here. This section is in development.",
          es: "Aquí presentaremos nuestra misión, visión y valores. Esta sección está en desarrollo.",
        }}
      />
      <UpcomingSection
        id="partnerships"
        reduced={reduced}
        title={{ en: "Partnerships", es: "Partnerships" }}
        note={{
          en: "Strategic partnerships and alliances will be presented here. This section will be developed later.",
          es: "Aquí se presentarán las alianzas y partnerships estratégicos. Esta sección se desarrollará posteriormente.",
        }}
      />
    </section>
  );
}
