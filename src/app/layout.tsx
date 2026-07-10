import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Center Quest — We power operations. You drive growth.",
  description:
    "Center Quest offers custom software, business solutions, technical support, AI implementation, back office, and customer service to scale your operation.",
  openGraph: {
    title: "Center Quest — We power operations. You drive growth.",
    description:
      "Center Quest offers custom software, business solutions, technical support, AI implementation, back office, and customer service to scale your operation.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Accessibility: skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
