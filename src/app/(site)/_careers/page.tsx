import type { Metadata } from "next";
import CareersExperience from "./CareersExperience";

const TITLE = "Careers | Center Quest";
const DESCRIPTION =
  "Open positions at Center Quest in Santo Domingo: entry-level call center agents with paid training, plus specialist and leadership roles across the operation.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/careers" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

export default function CareersPage() {
  return <CareersExperience />;
}
