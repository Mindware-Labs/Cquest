import type { Metadata } from "next";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";
import { listDepartmentsForDisplay } from "@/lib/departments";
import { simplePageGraph } from "@/lib/schema";
import RecaptchaBadge from "../../quote/RecaptchaBadge";
import ApplyExperience from "./ApplyExperience";

const TITLE = "Open application | Center Quest";
const DESCRIPTION =
  "No open role fits yet? Send your resume to Center Quest's talent pool and we reach out as soon as a position matches your profile.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/join-us/apply" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Formulario: se sirve fresco, sin caché de página.
export const dynamic = "force-dynamic";

export default async function OpenApplicationPage() {
  const departments = await listDepartmentsForDisplay();
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      <JsonLd
        data={simplePageGraph("WebPage", "/join-us/apply", TITLE, DESCRIPTION, [
          { name: "Center Quest", path: "" },
          { name: "Join Us", path: "/join-us" },
          { name: "Open application", path: "/join-us/apply" },
        ])}
      />
      {recaptchaSiteKey && (
        <>
          <Script src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`} strategy="afterInteractive" />
          <RecaptchaBadge />
        </>
      )}
      <ApplyExperience
        vacancy={null}
        departments={departments.map((entry) => ({ slug: entry.slug, shortLabel: entry.shortLabel, icon: entry.icon }))}
      />
    </>
  );
}
