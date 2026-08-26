import type { Metadata } from "next";
import LocationExperience from "./LocationExperience";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE = "Our Location | Center Quest";
const DESCRIPTION =
  "Everything runs from a single control room in Santo Domingo. See where Center Quest's operations centre is and how to get there.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/location" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function LocationPage() {
  return (
    <>
      <JsonLd
        data={simplePageGraph("ContactPage", "/location", TITLE, DESCRIPTION, [
          { name: "Center Quest", path: "" },
          { name: TITLE, path: "/location" },
        ])}
      />
      <LocationExperience />
    </>
  );
}
