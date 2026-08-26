import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import { PRIVACY, UPDATED_ISO } from "../content";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE = "Privacy Policy | Center Quest";
const DESCRIPTION =
  "What personal data Center Quest collects through this site, how it's used, and how to exercise your rights over it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/legal/privacy" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={simplePageGraph("WebPage", "/legal/privacy", TITLE, DESCRIPTION, [
          { name: "Center Quest", path: "" },
          { name: TITLE, path: "/legal/privacy" },
        ], { dateModified: UPDATED_ISO })}
      />
      <LegalPage doc={PRIVACY} />
    </>
  );
}
