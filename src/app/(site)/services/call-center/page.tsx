import type { Metadata } from "next";
import CallCenterDetail from "./CallCenterDetail";
import JsonLd from "@/components/JsonLd";
import { servicePageGraph } from "@/lib/schema";

/* El título lleva "Dominican Republic" a propósito: es la keyword objetivo
   literal del documento de requisitos para esta página, y sin el calificador
   geográfico la página nunca la capta. */
const TITLE = "Call Center in the Dominican Republic | Center Quest";

const DESCRIPTION =
  "Inbound and outbound contact-center operations in the Dominican Republic: customer service, sales, collections, surveys, onboarding and tech support.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/services/call-center" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function CallCenterPage() {
  return (
    <>
      <JsonLd data={servicePageGraph("call-center")} />
      <CallCenterDetail />
    </>
  );
}
