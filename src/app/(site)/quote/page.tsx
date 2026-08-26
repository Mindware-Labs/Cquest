import type { Metadata } from "next";
import Script from "next/script";
import QuoteExperience from "./QuoteExperience";
import RecaptchaBadge from "./RecaptchaBadge";
import { resolveService } from "./data";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE = "Request a service quote | Center Quest";

const DESCRIPTION =
  "Tell us what you need across Call Center, Operations or Systems Development and get a tailored proposal in under a minute.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/quote" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initialService = resolveService(sp.servicio ?? sp.service);
  const stepParam = Number(Array.isArray(sp.step) ? sp.step[0] : sp.step);
  const initialStep = Number.isInteger(stepParam) && stepParam >= 1 && stepParam <= 2 ? stepParam : undefined;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <>
      <JsonLd
        data={simplePageGraph("ContactPage", "/quote", TITLE, DESCRIPTION, [
          { name: "Center Quest", path: "" },
          { name: TITLE, path: "/quote" },
        ])}
      />

      {recaptchaSiteKey && (
        <>
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
          />

          <RecaptchaBadge />
        </>
      )}
      <QuoteExperience initialService={initialService} initialStep={initialStep} />
    </>
  );
}
