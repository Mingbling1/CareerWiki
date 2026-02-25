import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sileo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://empliq.com";

export const metadata: Metadata = {
  // ── Core ──
  title: {
    default: "Empliq — Transparencia laboral para el Perú",
    template: "%s | Empliq",
  },
  description:
    "Descubre salarios reales, organigramas y reseñas de las empresas más grandes del Perú. Plataforma open-source donde profesionales comparten información laboral de forma anónima.",
  applicationName: "Empliq",
  keywords: [
    "salarios Perú",
    "sueldos empresas peruanas",
    "organigrama empresas",
    "transparencia laboral",
    "reseñas empresas Perú",
    "BCP salarios",
    "Interbank sueldos",
    "Alicorp salarios",
    "BBVA Perú sueldos",
    "plataforma laboral",
    "comparar salarios",
    "puestos de trabajo Perú",
  ],
  authors: [{ name: "Empliq" }],
  creator: "Empliq",

  // ── Canonical & alternates ──
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: { "es-PE": "/" },
  },

  // ── Open Graph ──
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: SITE_URL,
    siteName: "Empliq",
    title: "Empliq — Transparencia laboral para el Perú",
    description:
      "Descubre salarios reales, organigramas y reseñas de las empresas más grandes del Perú. Información compartida por profesionales de forma anónima.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Empliq — Transparencia laboral para el Perú",
      },
    ],
  },

  // ── Twitter Card ──
  twitter: {
    card: "summary_large_image",
    title: "Empliq — Transparencia laboral para el Perú",
    description:
      "Salarios reales, organigramas y reseñas de empresas peruanas. 100% anónimo.",
    images: ["/og-image.png"],
    creator: "@empliq",
  },

  // ── Icons (Next.js auto-detects files in /app, but being explicit) ──
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },

  // ── Robots ──
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Verification (agregar IDs cuando se registren) ──
  // verification: {
  //   google: "TU_GOOGLE_SEARCH_CONSOLE_ID",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
