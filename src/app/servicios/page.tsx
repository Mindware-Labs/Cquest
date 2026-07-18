import type { Metadata } from "next";
import ServicesExperience from "@/components/ServicesExperience";

export const metadata: Metadata = {
  title: "Nuestros servicios | Center Quest",
  description:
    "Call Center, BPO y Desarrollo de Sistemas para operaciones en República Dominicana.",
};

export default function ServicesPage() {
  return <ServicesExperience />;
}
