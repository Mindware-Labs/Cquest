import type { Metadata } from "next";
import { Geist, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "../globals.css";
/* El vocabulario visual del panel se carga solo acá: el sitio público no lo ve. */
import "../styles/admin.css";
import { getDictionary } from "@/i18n/getDictionary";
import { I18nProvider } from "@/i18n/I18nProvider";

// Segundo root layout (hermano de src/app/[lang]/layout.tsx): el panel no comparte cromo con el sitio público. Geist para interfaz, Inter Tight (misma familia, más angosta) para cifras grandes, JetBrains para identificadores; las tres por next/font, autoalojadas sin salto de fuente al cargar.

const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const ui = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const ident = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// El panel no se indexa nunca; nofollow evita que un rastreador que llegue por un enlace suelto siga recorriendo pantallas internas.
export const metadata: Metadata = {
  title: "Panel | Center Quest",
  robots: { index: false, follow: false },
};

// El panel no es multiidioma, pero la vista previa reutiliza bloques públicos (BlockRenderer -> CtaBlock -> LocalizedLink) que exigen contexto i18n; se fija en español.
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary("es");

  return (
    <html
      lang="es"
      className={`${display.variable} ${ui.variable} ${ident.variable} h-full antialiased`}
    >
      <body className="cq-panel-root min-h-full">
        <I18nProvider dict={dict} lang="es">
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
