import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";
import { breadcrumbNode, graph, jobPostingNode, simplePageNode } from "@/lib/schema";
import { getPublishedVacancy } from "@/lib/vacancies";
import RecaptchaBadge from "../../../quote/RecaptchaBadge";
import ApplyExperience from "../ApplyExperience";

// Formulario: se sirve fresco, sin caché de página.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getPublishedVacancy(slug);
  if (!vacancy) return { title: "Position not found | Center Quest", robots: { index: false, follow: false } };

  const title = `Apply for ${vacancy.title} | Center Quest`;
  const description = vacancy.summary || `Apply for the ${vacancy.title} position at Center Quest.`;
  return {
    title,
    description,
    alternates: { canonical: `/join-us/apply/${vacancy.slug}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ApplyVacancyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vacancy = await getPublishedVacancy(slug);
  if (!vacancy) notFound();

  const path = `/join-us/apply/${vacancy.slug}`;
  const title = `Apply for ${vacancy.title} | Center Quest`;
  const description = vacancy.summary || `Apply for the ${vacancy.title} position at Center Quest.`;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      <JsonLd
        data={graph(
          simplePageNode("WebPage", path, title, description),
          breadcrumbNode([
            { name: "Center Quest", path: "" },
            { name: "Join Us", path: "/join-us" },
            { name: vacancy.title, path },
          ]),
          jobPostingNode(vacancy),
        )}
      />
      {recaptchaSiteKey && (
        <>
          <Script src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`} strategy="afterInteractive" />
          <RecaptchaBadge />
        </>
      )}
      <ApplyExperience vacancy={vacancy} departments={[]} />
    </>
  );
}
