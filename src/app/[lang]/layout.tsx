import type { Metadata, Viewport } from "next";
import { Josefin_Sans } from "next/font/google";
import { ViewTransition } from "react";
import "../globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import SiteFooter from "@/components/footer/SiteFooter";
import { CONTACT } from "@/components/footer/data";
import SmoothScroll from "@/components/SmoothScroll";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-josefin",
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

// Organization schema — still only fields we actually have. Phone, email and
// address are now real (see components/footer/data.ts, the single source both
// this and the footer read), so they belong here: the requirements list
// structured data as an SEO deliverable, and address + phone are exactly what
// a local-business query like "call center República Dominicana" resolves on.
// No sameAs — no social profiles have been confirmed, and a guessed profile
// URL is worse than an absent one.
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Center Quest",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: CONTACT.email,
  telephone: CONTACT.phoneHref,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.street,
    addressLocality: CONTACT.city,
    addressCountry: CONTACT.countryCode,
  },
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
      className={`${josefin.variable} h-full antialiased`}
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
          {/* Outside <main> on purpose: the footer is site chrome, not page
              content, so it stays put across the ViewTransition instead of
              being animated out and back in on every navigation. */}
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
