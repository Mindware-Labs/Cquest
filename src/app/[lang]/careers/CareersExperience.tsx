"use client";

import { useReducedMotion } from "motion/react";
import Culture from "./components/Culture";
import Faq from "./components/Faq";
import Hero from "./components/Hero";
import Openings from "./components/Openings";
import Process from "./components/Process";
import TalentPool from "./components/TalentPool";

/* Un solo useReducedMotion para las seis secciones: la preferencia es una del
   sistema, no una por componente, y consultarla seis veces monta seis
   suscripciones al mismo media query. */
export default function CareersExperience() {
  const reduced = useReducedMotion() ?? false;
  return (
    <>
      <Hero reduced={reduced} />
      <Culture reduced={reduced} />
      <Openings reduced={reduced} />
      <Process reduced={reduced} />
      <TalentPool reduced={reduced} />
      <Faq reduced={reduced} />
    </>
  );
}
