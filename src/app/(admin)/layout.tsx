import type { Metadata, Viewport } from "next";
import { Josefin_Sans } from "next/font/google";
import "../admin-globals.css";

/* Corte variable: las hojas piden 500/600/700 y sin el eje wght se falsean. */
const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panel · Center Quest",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: "#0a1116" };

/* Root layout propio: el panel no hereda Lenis, cortina, navbar ni footer. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${josefin.variable} h-full antialiased`}>
      <body className="cq-admin min-h-full">{children}</body>
    </html>
  );
}
