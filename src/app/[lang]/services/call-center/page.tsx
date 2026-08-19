import type { Metadata } from "next";
import CallCenterDetail from "./CallCenterDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import JsonLd from "@/components/JsonLd";
import { servicePageGraph } from "@/lib/schema";

/* El título lleva "República Dominicana"/"Dominican Republic" a propósito:
   es la keyword objetivo literal del documento de requisitos para esta
   página, y sin el calificador geográfico la página nunca la capta. */
const TITLE: Record<Locale, string> = {
  en: "Call Center in the Dominican Republic | Center Quest",
  es: "Call Center en República Dominicana | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Inbound and outbound contact-center operations in the Dominican Republic: customer service, sales, collections, surveys, onboarding and tech support.",
  es: "Contact center inbound y outbound en República Dominicana: servicio al cliente, ventas, cobros, encuestas, onboarding y soporte técnico.",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/services/call-center"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
    twitter: { card: "summary_large_image", title: TITLE[lang], description: DESCRIPTION[lang] },
  };
}

export default async function CallCenterPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await resolveLang(params);
  return (
    <>
      <JsonLd data={servicePageGraph("call-center", lang)} />
      <CallCenterDetail />
    </>
  );
}
