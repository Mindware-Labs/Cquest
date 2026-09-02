import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApplication, getApplicationStatusHistory } from "@/server/applications";
import ApplicationDetail from "./ApplicationDetail";

export const metadata: Metadata = {
  title: "Application · Center Quest Admin",
  robots: { index: false, follow: false },
};

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getApplication(id);
  if (!application) notFound();

  const history = await getApplicationStatusHistory(id);

  return <ApplicationDetail application={application} history={history} />;
}
