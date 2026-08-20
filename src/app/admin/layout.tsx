import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "../globals.css";
/* El vocabulario visual del panel se carga solo acá: el sitio público no lo ve. */
import "../styles/admin.css";

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

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${josefin.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
