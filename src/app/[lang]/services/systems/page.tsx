import type { Metadata } from "next";
import SystemsDetail from "./SystemsDetail";

export const metadata: Metadata = {
  title: "Systems Development | Center Quest",
  description:
    "Custom software for operations: CRMs, dashboards, operations automation, and AI implementation shaped around how the client actually works.",
};

export default function SystemsPage() {
  return <SystemsDetail />;
}
