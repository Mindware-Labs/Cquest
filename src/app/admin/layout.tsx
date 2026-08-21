import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "../globals.css";
/* El vocabulario visual del panel se carga solo acá: el sitio público no lo ve. */
import "../styles/admin.css";
import { getDictionary } from "@/i18n/getDictionary";
import { I18nProvider } from "@/i18n/I18nProvider";

/* Segundo root layout, hermano de src/app/[lang]/layout.tsx: el panel tiene su
   propio <html> porque no comparte nada del cromo público — ni navbar, ni
   footer, ni scroll suave, ni analítica. Un editor de artículos no necesita
   una cortina de transición entre rutas. */

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

/* El panel no se indexa nunca. `nofollow` además evita que un rastreador que
   llegue por un enlace suelto siga recorriendo pantallas internas. */
export const metadata: Metadata = {
  title: "Panel | Center Quest",
  robots: { index: false, follow: false },
};

/* El panel no es multiidioma, pero la vista previa del editor reutiliza los
   bloques públicos (BlockRenderer -> CtaBlock -> LocalizedLink), y esos exigen
   el contexto de i18n. Lo fijamos en español, el idioma del panel. */
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary("es");

  return (
    <html lang="es" className={`${josefin.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <I18nProvider dict={dict} lang="es">
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
