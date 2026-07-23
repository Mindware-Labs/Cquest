import type { Metadata } from "next";
import CallCenterDetail from "./CallCenterDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Call Center in the Dominican Republic | Center Quest",
  es: "Call Center en República Dominicana | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Inbound and outbound contact-center operations: customer service, sales, collections, surveys, onboarding, and tech support.",
  es: "Operaciones de contact center inbound y outbound: servicio al cliente, ventas, cobros, encuestas, onboarding y soporte técnico.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/services/call-center"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

const SERVICE_JSON_LD = (lang: Locale) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Call Center",
  name: TITLE[lang],
  description: DESCRIPTION[lang],
  provider: { "@type": "Organization", name: "Center Quest" },
  areaServed: "Dominican Republic",
});

export default async function CallCenterPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSON_LD(lang)) }}
      />
      <CallCenterDetail />
    </>
  );
}
