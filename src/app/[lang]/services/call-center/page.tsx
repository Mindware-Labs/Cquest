import type { Metadata } from "next";
import CallCenterDetail from "./CallCenterDetail";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Call Center | Center Quest",
  es: "Call Center | Center Quest",
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
  };
}

export default function CallCenterPage() {
  return <CallCenterDetail />;
}
