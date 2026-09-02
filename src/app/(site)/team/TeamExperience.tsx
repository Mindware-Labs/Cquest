"use client";

import { useReducedMotion } from "motion/react";
import type { PublicDepartment } from "@/lib/departments";
import Hero from "./components/Hero";
import OrgChart from "./components/OrgChart";

export default function TeamExperience({ departments }: { departments: PublicDepartment[] }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <>
      <Hero reduced={reduced} />
      <OrgChart reduced={reduced} departments={departments} />
    </>
  );
}
