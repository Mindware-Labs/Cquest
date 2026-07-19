import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";

// Switzer (Fontshare, free for commercial use) — one family for headings and
// body, carried by weight contrast instead of a second typeface. Replaces
// Geist + Inter, the single most common "Stripe-inspired" pairing on
// AI-assisted sites; see DISENIO.md for the brand rationale.
const switzer = localFont({
  variable: "--font-switzer",
  display: "swap",
  src: [
    { path: "../fonts/switzer/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/switzer/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/switzer/Switzer-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/switzer/Switzer-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const SITE_DESCRIPTION =
  "Center Quest is a Dominican operations partner across three business lines: Call Center, BPO (Business Process Outsourcing), and Systems Development for operations.";

export const metadata: Metadata = {
  title: "Center Quest — Call Center, BPO & Systems Development",
  description: SITE_DESCRIPTION,
  keywords: [
    "call center República Dominicana",
    "servicios BPO",
    "desarrollo de sistemas para operaciones",
    "business process outsourcing",
    "customer service",
    "Center Quest",
  ],
  openGraph: {
    title: "Center Quest — We power operations. You drive growth.",
    description: SITE_DESCRIPTION,
    type: "website",
  },
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
      className={`${switzer.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Accessibility: skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SmoothScroll />
        <ScrollProgress />
        <Navbar />
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
