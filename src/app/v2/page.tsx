import type { Metadata } from "next";
import HeroImage from "@/components/HeroImage";
import ServicesCarousel from "@/components/ServicesCarousel";

export const metadata: Metadata = {
  title: "Center Quest — Services carousel concept",
  description:
    "Alternate home concept: the hero followed by a full-screen services carousel with page-turn navigation.",
  robots: { index: false },
};

// Alternate version of the home page: same hero, but the services section is
// the full-screen page-turn carousel instead of the scroll-driven journey.
// The hero's "#services" anchors are relative, so they land on the carousel
// within this route.
export default function HomeV2() {
  return (
    <>
      <HeroImage />
      <ServicesCarousel />
    </>
  );
}
