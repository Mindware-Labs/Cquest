import type { Metadata, Viewport } from "next";
import { Josefin_Sans } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import "../globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import RouteTransition from "@/components/RouteTransition";
import SiteFooter from "@/components/footer/SiteFooter";
import { brandLine } from "@/components/footer/data";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, graph, organizationNode, websiteNode } from "@/lib/schema";
import SmoothScroll from "@/components/SmoothScroll";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";

/* El corte VARIABLE, no una lista de pesos estáticos. Las hojas piden 600 y
   700 en más de 130 sitios: sin el eje wght el navegador falseaba la negrita. */
const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

const SITE_DESCRIPTION: Record<Locale, string> = {
  en: "Center Quest is an operations partner: Call Center, BPO and Systems Development, run under clear SLAs and shaped around how your operation actually works.",
  es: "Center Quest es un aliado de operaciones: Call Center, Operaciones (BPO) y Desarrollo de Sistemas, con SLAs claros y ajustados a cómo funciona tu operación.",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/* El ID del contenedor viaja en el HTML servido: no es secreto. Va con default
   en el código para que el tag no dependa de configurar el entorno en cada
   despliegue, pero el env manda si hace falta apuntar a otro contenedor. */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-MZVHNCDV";

const SITE_TITLE: Record<Locale, string> = {
  en: "Center Quest — Call Center, BPO & Systems Development",
  es: "Center Quest — Call Center, BPO y Desarrollo de Sistemas",
};

/* Compuesto desde BRAND_LINE en vez de repetirlo: una fuente, tres superficies. */
export const OG_TITLE: Record<Locale, string> = {
  en: `Center Quest — ${brandLine("en")}`,
  es: `Center Quest — ${brandLine("es")}`,
};

/* Pinta el cromo del navegador móvil con la tinta del hero: la primera
   pantalla se lee como una superficie oscura continua. */
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
    twitter: {
      card: "summary_large_image",
      title: OG_TITLE[lang],
      description: SITE_DESCRIPTION[lang],
    },
    alternates: localeAlternates(lang, ""),
    /* Vacío hasta tener una propiedad de Search Console real: un token
       inventado no verifica nada, y el `undefined` simplemente omite la
       etiqueta en vez de emitir una vacía. */
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
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
      {/* Antes de <body>: el contenedor arranca lo más arriba posible. */}
      <GoogleTagManager gtmId={GTM_ID} />
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {/* Respaldo sin JS: el paso 2 del instalador de GTM. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* El negocio y el sitio, con @id estables: el resto de páginas cuelgan
            sus nodos de estos dos por referencia en vez de repetirlos. */}
        <JsonLd data={graph(organizationNode(lang), websiteNode(lang))} />
        <I18nProvider dict={dict} lang={lang}>

          <a href="#main-content" className="skip-link">
            {dict.common.skipToMainContent}
          </a>
          <RouteTransition>
            <SmoothScroll />
            <ScrollProgress />

            {/* Sin <ViewTransition>: el telón de RouteTransition es el único
                traspaso. Los snapshots pintan en el top layer, por encima. */}
            <main id="main-content" className="flex flex-1 flex-col">
              {children}
            </main>

            {/* Fuera de <main> a propósito: el footer es cromo del sitio, no
                contenido de ruta, y va bajo el telón como todo lo demás. */}
            <SiteFooter />
          </RouteTransition>
        </I18nProvider>
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
