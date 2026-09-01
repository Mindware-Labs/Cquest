"use client";

import { useReducedMotion } from "motion/react";
import type { PublicVacancy } from "@/lib/vacancies";
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
  return <Listing reduced={reduced} openings={openings} hiring={hiring} />;
}
