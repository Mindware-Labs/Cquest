import type { Metadata } from "next";
import BpoDetail from "./BpoDetail";

export const metadata: Metadata = {
  title: "Operations | Center Quest",
  description:
    "Business Process Outsourcing: back office support, data processing, omnichannel support, trust and safety, quality assurance, and consulting.",
};

export default function BpoPage() {
  return <BpoDetail />;
}
