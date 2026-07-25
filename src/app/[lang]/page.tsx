import AboutSection from "@/components/about/AboutSection";
import HeroImage from "@/components/HeroImage";
import ServicesCarousel from "@/components/services-carousel/ServicesCarousel";

export default function Home() {
  return (
    <>
      <HeroImage />
      <ServicesCarousel />
      <AboutSection />
    </>
  );
}
