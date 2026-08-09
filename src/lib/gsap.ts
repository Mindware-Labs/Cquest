"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const CQ_EASE = "cq-out";

export const CQ_EASE_SNAP = "back.out(1.7)";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create(CQ_EASE, "M0,0 C0.22,1 0.36,1 1,1");
}

export { gsap, ScrollTrigger };
