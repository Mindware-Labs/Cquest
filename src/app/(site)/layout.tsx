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
import { dict } from "@/lib/dictionary";

/* El corte VARIABLE, no una lista de pesos estáticos. Las hojas piden 600 y
   700 en más de 130 sitios: sin el eje wght el navegador falseaba la negrita. */
const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Center Quest is an operations partner: Call Center, BPO and Systems Development, run under clear SLAs and shaped around how your operation actually works.";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/* El ID del contenedor viaja en el HTML servido: no es secreto. Va con default
   en el código para que el tag no dependa de configurar el entorno en cada
   despliegue, pero el env manda si hace falta apuntar a otro contenedor. */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-MZVHNCDV";

const SITE_TITLE = "Center Quest — Call Center, BPO & Systems Development";

/* Compuesto desde BRAND_LINE en vez de repetirlo: una fuente, tres superficies. */
export const OG_TITLE = `Center Quest — ${brandLine}`;

/* Pinta el cromo del navegador móvil con la tinta del hero: la primera
   pantalla se lee como una superficie oscura continua. */
export const viewport: Viewport = {
  themeColor: "#0a1116",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "call center Dominican Republic",
    "nearshore call center",
    "BPO services",
    "business process outsourcing",
    "systems development for operations",
    "customer service outsourcing",
    "Center Quest",
  ],
  openGraph: {
    title: OG_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: "/" },
  /* URL estática en /public en vez de la ruta generada por la convención
     app/icon.png (que agrega hash + query de deploy en cada build): Google
     recomienda mantener la URL del favicon estable entre despliegues. */
  icons: { icon: "/icon.png", apple: "/icon.png" },
  /* Vacío hasta tener una propiedad de Search Console real: un token
     inventado no verifica nada, y el `undefined` simplemente omite la
     etiqueta en vez de emitir una vacía. */
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
        <JsonLd data={graph(organizationNode(), websiteNode())} />

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
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
