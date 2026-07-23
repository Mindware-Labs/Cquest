import type { Metadata } from "next";
import CallCenterDetail from "./CallCenterDetail";

export const metadata: Metadata = {
  title: "Call Center | Center Quest",
  description:
    "Inbound and outbound contact-center operations: customer service, sales, collections, surveys, onboarding, and tech support.",
};

export default function CallCenterPage() {
  return <CallCenterDetail />;
}
