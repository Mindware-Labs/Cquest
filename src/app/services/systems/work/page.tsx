import type { Metadata } from "next";
import WorkCaseStudy from "./WorkCaseStudy";

export const metadata: Metadata = {
  title: "Contact-center operations platform · Case study | Center Quest",
  description:
    "How we designed and built a custom platform that runs an entire call-center operation — automatic call capture, ticketing, real-time dashboards and per-site reporting.",
};

export default function WorkCaseStudyPage() {
  return <WorkCaseStudy />;
}
