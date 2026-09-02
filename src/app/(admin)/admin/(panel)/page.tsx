import type { Metadata } from "next";
import { getDashboard } from "@/server/dashboard";
import DashboardView from "./DashboardView";

export const metadata: Metadata = {
  title: "Dashboard · Center Quest Admin",
  robots: { index: false, follow: false },
};

export default async function PanelHomePage() {
  const data = await getDashboard();
  return <DashboardView data={data} />;
}
