import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/seo/StructuredData";
import { YandexMetrika } from "@/components/seo/YandexMetrika";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GTA6·БЛОГ — независимый хаб новостей о GTA VI",
    template: "%s · GTA6·БЛОГ",
  },
  description:
    "Независимый хаб новостей о GTA VI. Утечки, разборы, теории — без хайпа и кликбейта.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "GTA6·БЛОГ",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  alternates: {
    canonical: "/",
    languages: { ru: "/" },
    types: { "application/rss+xml": [{ url: "/rss.xml", title: "GTA6·БЛОГ" }] },
  },
  robots: { index: true, follow: true },
};

const GRAIN_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <StructuredData data={[websiteJsonLd, organizationJsonLd]} />
        <YandexMetrika />
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3,
            pointerEvents: "none",
            opacity: 0.04,
            backgroundImage: `url("${GRAIN_SVG}")`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
