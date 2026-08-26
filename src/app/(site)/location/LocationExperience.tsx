"use client";

import { useReducedMotion } from "motion/react";
import LocationSection from "@/components/about/LocationSection";

export default function LocationExperience() {
  const reduced = useReducedMotion() ?? false;
  return <LocationSection reduced={reduced} />;
}
