"use client";

import { useReducedMotion } from "motion/react";
import Hero from "./components/Hero";
import OrgChart from "./components/OrgChart";

export default function TeamExperience() {
  const reduced = useReducedMotion() ?? false;
  return (
    <>
      <Hero reduced={reduced} />
      <OrgChart reduced={reduced} />
    </>
  );
}
