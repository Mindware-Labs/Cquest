import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";

const switzer = localFont({
  src: [
    { path: "../fonts/switzer/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/switzer/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/switzer/Switzer-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/switzer/Switzer-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Center Quest is a Dominican operations partner across three business lines: Call Center, Operations (BPO / Business Process Outsourcing), and Systems Development for operations.";

// Paints the mobile browser chrome in the hero's ink so the first screen
// reads as one continuous dark surface instead of a white browser band.
export const viewport: Viewport = {
  themeColor: "#0a1116",
};

export const metadata: Metadata = {
  title: "Center Quest — Call Center, Operations & Systems Development",
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
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {/* Accessibility: skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SmoothScroll />
        <ScrollProgress />
        <main id="main-content" className="flex flex-1 flex-col">
          <ViewTransition name="page" exit="page-exit" enter="page-enter">
            {children}
          </ViewTransition>
        </main>
      </body>
    </html>
  );
}
