import type { Metadata } from "next";
import TeamExperience from "./TeamExperience";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE = "Our Team | Center Quest";
const DESCRIPTION =
  "Meet the six departments behind Center Quest: Customer Experience, Business Operations, Back Office Services, Technology & Innovation, Quality Assurance and Human Capital.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/team" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function TeamPage() {
  return (
    <>
      <JsonLd
        data={simplePageGraph("AboutPage", "/team", TITLE, DESCRIPTION, [
          { name: "Center Quest", path: "" },
          { name: TITLE, path: "/team" },
        ])}
      />
      <TeamExperience />
    </>
  );
}
