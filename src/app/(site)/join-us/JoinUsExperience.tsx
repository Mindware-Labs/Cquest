"use client";

import { useReducedMotion } from "motion/react";
import type { PublicVacancy } from "@/lib/vacancies";
import Hero from "./components/Hero";
import Listing from "./components/Listing";

export type Hiring = { slug: string; label: string; shortLabel: string; icon: string; count: number };

export default function JoinUsExperience({
  openings,
  hiring,
}: {
  openings: PublicVacancy[];
  hiring: Hiring[];
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <>
      <Hero reduced={reduced} count={openings.length} hiring={hiring} />
      <Listing reduced={reduced} openings={openings} hiring={hiring} />
    </>
  );
}
