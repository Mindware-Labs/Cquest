import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import { TERMS, UPDATED_ISO } from "../content";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE = "Terms and Conditions | Center Quest";
const DESCRIPTION =
  "The terms that govern the use of the Center Quest website and its quote request form.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/legal/terms" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={simplePageGraph("WebPage", "/legal/terms", TITLE, DESCRIPTION, [
          { name: "Center Quest", path: "" },
          { name: TITLE, path: "/legal/terms" },
        ], { dateModified: UPDATED_ISO })}
      />
      <LegalPage doc={TERMS} />
    </>
  );
}
