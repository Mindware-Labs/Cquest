import type { Metadata } from "next";
import QuoteExperience from "./QuoteExperience";
import { resolveService } from "./data";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const TITLE: Record<Locale, string> = {
  en: "Request a quote | Center Quest",
  es: "Solicita una cotización | Center Quest",
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
    alternates: localeAlternates(lang, "/cotizador"),
  };
}

// Service pages deep-link in with ?servicio=<id> (also accepts ?service=). In
// Next 16 `searchParams` is async, so the page awaits it and hands the resolved
// service to the client experience as a prop — no client-side useSearchParams,
// so no Suspense boundary is needed.
export default async function CotizadorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialService = resolveService(params.servicio ?? params.service);
  const stepParam = Number(Array.isArray(params.step) ? params.step[0] : params.step);
  const initialStep = Number.isInteger(stepParam) && stepParam >= 1 && stepParam <= 2 ? stepParam : undefined;
  return <QuoteExperience initialService={initialService} initialStep={initialStep} />;
}
