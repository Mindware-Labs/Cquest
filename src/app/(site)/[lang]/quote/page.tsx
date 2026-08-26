import type { Metadata } from "next";
import Script from "next/script";
import QuoteExperience from "./QuoteExperience";
import RecaptchaBadge from "./RecaptchaBadge";
import { resolveService } from "./data";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import JsonLd from "@/components/JsonLd";
import { simplePageGraph } from "@/lib/schema";

const TITLE: Record<Locale, string> = {
  en: "Request a service quote | Center Quest",
  es: "Solicita una cotización de servicios | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Tell us what you need across Call Center, Operations or Systems Development and get a tailored proposal in under a minute.",
  es: "Cuéntanos qué necesitas en Call Center, Operaciones o Desarrollo de Sistemas y recibe una propuesta a tu medida en menos de un minuto.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/quote"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
    twitter: { card: "summary_large_image", title: TITLE[lang], description: DESCRIPTION[lang] },
  };
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = await resolveLang(params);
  const sp = await searchParams;
  const initialService = resolveService(sp.servicio ?? sp.service);
  const stepParam = Number(Array.isArray(sp.step) ? sp.step[0] : sp.step);
  const initialStep = Number.isInteger(stepParam) && stepParam >= 1 && stepParam <= 2 ? stepParam : undefined;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <>
      <JsonLd
        data={simplePageGraph("ContactPage", lang, "/quote", TITLE[lang], DESCRIPTION[lang], [
          { name: "Center Quest", path: "" },
          { name: TITLE[lang], path: "/quote" },
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
