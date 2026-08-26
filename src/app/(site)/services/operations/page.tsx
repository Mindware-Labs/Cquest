import type { Metadata } from "next";
import OperationsDetail from "./OperationsDetail";
import JsonLd from "@/components/JsonLd";
import { servicePageGraph } from "@/lib/schema";

const TITLE = "Operations (BPO) | Center Quest";

const DESCRIPTION =
  "Business Process Outsourcing: back office support, data processing, omnichannel support, trust and safety, quality assurance, and consulting.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/services/operations" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function OperationsPage() {
  return (
    <>
      <JsonLd data={servicePageGraph("bpo")} />
      <OperationsDetail />
    </>
  );
}
