import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import "../globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const switzer = localFont({
  src: [
    { path: "../../fonts/switzer/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/switzer/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/switzer/Switzer-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/switzer/Switzer-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const SITE_DESCRIPTION: Record<Locale, string> = {
  en: "Center Quest is a Dominican operations partner: Call Center, Operations (BPO) and Systems Development for operations in the Dominican Republic.",
  es: "Center Quest es un aliado dominicano de operaciones: Call Center, Operaciones (BPO) y Desarrollo de Sistemas para operaciones en República Dominicana.",
};

// Same SITE_URL pattern as sitemap.ts/robots.ts — one env var, one fallback,
// kept in sync across all three so canonical/hreflang/JSON-LD/metadataBase
// all resolve against the same domain.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example").replace(/\/$/, "");

// Minimal, honest Organization schema — only fields we actually have (name,
// url, logo). No phone/address/sameAs: none exist anywhere in the codebase
// yet, and inventing them would make the markup wrong rather than useful.
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Center Quest",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

const SITE_TITLE: Record<Locale, string> = {
  en: "Center Quest — Call Center, Operations & Systems Development",
  es: "Center Quest — Call Center, Operaciones y Desarrollo de Sistemas",
};

export const OG_TITLE: Record<Locale, string> = {
  en: "Center Quest — We power operations. You drive growth.",
  es: "Center Quest — Nosotros impulsamos las operaciones. Tú impulsas el crecimiento.",
};

// Paints the mobile browser chrome in the hero's ink so the first screen
// reads as one continuous dark surface instead of a white browser band.
export const viewport: Viewport = {
  themeColor: "#0a1116",
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_TITLE[lang],
    description: SITE_DESCRIPTION[lang],
    keywords: [
      "call center República Dominicana",
      "servicios BPO",
      "desarrollo de sistemas para operaciones",
      "business process outsourcing",
      "customer service",
      "Center Quest",
    ],
    openGraph: {
      title: OG_TITLE[lang],
      description: SITE_DESCRIPTION[lang],
      type: "website",
    },
    alternates: localeAlternates(lang, ""),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const lang = await resolveLang(params);
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${switzer.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <I18nProvider dict={dict} lang={lang}>
          {/* Accessibility: skip to main content */}
          <a href="#main-content" className="skip-link">
            {dict.common.skipToMainContent}
          </a>
          <SmoothScroll />
          <ScrollProgress />
          <main id="main-content" className="flex flex-1 flex-col">
            <ViewTransition name="page" exit="page-exit" enter="page-enter">
              {children}
            </ViewTransition>
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
