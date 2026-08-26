import type { Metadata } from "next";
import SystemsDetail from "./SystemsDetail";
import JsonLd from "@/components/JsonLd";
import { servicePageGraph } from "@/lib/schema";

const TITLE = "Systems Development for Operations | Center Quest";

const DESCRIPTION =
  "Custom software for operations: CRMs, dashboards, and AI implementation shaped around how the client actually works.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/services/systems" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function SystemsPage() {
  return (
    <>
      <JsonLd data={servicePageGraph("systems")} />
      <SystemsDetail />
    </>
  );
}
