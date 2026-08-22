import type { Metadata } from "next";
import { Geist, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "../globals.css";
/* El vocabulario visual del panel se carga solo acá: el sitio público no lo ve. */
import "../styles/admin.css";
import { getDictionary } from "@/i18n/getDictionary";
import { I18nProvider } from "@/i18n/I18nProvider";

/* Segundo root layout, hermano de src/app/[lang]/layout.tsx: el panel tiene su
   propio <html> porque no comparte nada del cromo público — ni navbar, ni
   footer, ni scroll suave, ni analítica. Un editor de artículos no necesita
   una cortina de transición entre rutas.

   Dos familias. El panel NO usa Josefin: la del sitio público es una
   geométrica de display, dibujada para titulares grandes, y a 13px en una tabla
   de cuarenta filas pierde legibilidad frente a una tipografía de interfaz. Que
   el panel y el sitio no compartan tipografía es correcto — son dos productos
   con dos trabajos distintos.

   Tres familias, y las dos primeras son hermanas a propósito:

     Geist        interfaz. Neo-grotesca de aperturas amplias, hecha para
                  tamaños chicos: es la que sostiene una tabla de 13px.
     Inter Tight  cifras grandes y títulos de tarjeta. Es la MISMA familia
                  formal que Geist —mismo esqueleto, mismo eje vertical— pero
                  más angosta y de aperturas más cerradas, que a 32px es lo que
                  hace que un número se lea compacto en vez de desparramado.
                  No rompe el archetipo porque no introduce una voz nueva:
                  aprieta la que ya está.
     JetBrains    identificadores: slugs, rutas, IDs, conteos.

   Hubo un serif de display para los números y se sacó: en un tablero los
   dígitos se escanean, no se leen, y un serif de contraste alto los vuelve más
   lentos de distinguir a tamaño grande.

   Las tres vienen por next/font: se autoalojan en el build, no hay pedido a un
   tercero en tiempo de ejecución y no hay salto de fuente al cargar. Ninguna
   dependencia nueva en package.json. */

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
