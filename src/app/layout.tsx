import type { Metadata, Viewport } from "next";
import { Maven_Pro } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  variable: "--font-maven-pro",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Center Quest is a Dominican operations partner across three business lines: Call Center, BPO (Business Process Outsourcing), and Systems Development for operations.";

// Paints the mobile browser chrome in the hero's ink so the first screen
// reads as one continuous dark surface instead of a white browser band.
export const viewport: Viewport = {
  themeColor: "#0a1116",
};

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
      className={`${mavenPro.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
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
