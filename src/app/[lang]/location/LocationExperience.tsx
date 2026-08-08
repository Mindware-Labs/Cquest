"use client";

import { useReducedMotion } from "motion/react";
import LocationSection from "@/components/about/LocationSection";

// Same "own page, own client wrapper" shape as TeamExperience/QuoteExperience
// — page.tsx stays a server component for its metadata, and this is the one
// spot that reads useReducedMotion() and hands `reduced` down.
export default function LocationExperience() {
  const reduced = useReducedMotion() ?? false;
  return <LocationSection reduced={reduced} />;
}
